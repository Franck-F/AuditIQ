"""
AI Chat Router - Gemini-powered assistant for Audit-IQ
Provides intelligent responses about fairness metrics, audits, and compliance
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address
import pandas as pd
from pathlib import Path

UPLOAD_DIR = Path("uploads")

from db import AsyncSessionLocal
from models.dataset import Audit, Dataset
from models.user import User
from routers.auth import get_current_user

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/ai", tags=["ai"])

# ... (keep existing classes) ...




class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    audit_id: Optional[int] = None


class Source(BaseModel):
    title: str
    url: Optional[str] = None
    type: str  # 'audit', 'dataset', 'web'


class ChatResponse(BaseModel):
    response: str
    sources: List[Source] = []



async def get_audit_context(audit_id: int, user_id: int, db: AsyncSession) -> str:
    """Retrieve specific audit result for granular context"""
    from sqlalchemy import select
    result = await db.execute(
        select(Audit).filter(Audit.id == audit_id, Audit.user_id == user_id)
    )
    audit = result.scalar_one_or_none()
    if not audit:
        return ""
    
    context = f"=== FOCUS SUR L'AUDIT #{audit.id} ===\n"
    context += f"Nom: {audit.name or 'Audit'}\n"
    context += f"Cible: {audit.target_column}\n"
    context += f"Attributs Sensibles: {', '.join(audit.sensitive_attributes)}\n"
    context += f"Status: {audit.status}\n"
    
    if audit.fairness_metrics:
        context += "Scores de Fairness (0-1):\n"
        for k, v in audit.fairness_metrics.items():
            if not k.endswith('_error'):
                context += f"- {k}: {v}\n"
    
    if audit.overall_score:
        context += f"Score Global: {audit.overall_score}/100\n"
    
    if audit.recommendations:
        context += f"Recommandations suggérées: {json.dumps(audit.recommendations[:3])}\n"
        
    return context + "\n"


async def get_user_context(user_id: int, db: AsyncSession, current_audit_id: Optional[int] = None) -> str:
    """Retrieve user's audit data for context"""
    from sqlalchemy import select
    
    context = ""
    
    # Prioritize specific audit context if provided
    if current_audit_id:
        context += await get_audit_context(current_audit_id, user_id, db)

    # Get recent audits (excluding current one if already added)
    query = select(Audit).filter(Audit.user_id == user_id)
    if current_audit_id:
        query = query.filter(Audit.id != current_audit_id)
    
    result = await db.execute(query.order_by(Audit.created_at.desc()).limit(3))
    audits = result.scalars().all()
    
    # Get datasets
    result = await db.execute(
        select(Dataset).filter(Dataset.user_id == user_id).order_by(Dataset.created_at.desc()).limit(3)
    )
    datasets = result.scalars().all()
    
    context += "=== CONTEXTE UTILISATEUR RÉCENT ===\n\n"
    
    if audits:
        context += "AUTRES AUDITS:\n"
        for audit in audits:
            context += f"- Audit #{audit.id}: {audit.name or 'Sans nom'}\n"
            if audit.status:
                context += f"  Statut: {audit.status}\n"
            context += "\n"
    
    if datasets:
        context += "DATASETS PRINCIPAUX:\n"
        for dataset in datasets:
            context += f"- Dataset: {dataset.filename} ({dataset.row_count} lignes)\n"
    
    return context


def create_system_prompt() -> str:
    """Create system prompt for Gemini with strict domain guardrails"""
    return """Tu es l'Assistant Audit-IQ, un expert MANDATÉ en équité algorithmique (Fairness), éthique de l'IA et conformité (AI Act, GDPR).

CHAMP D'EXPERTISE (STRICT) :
1. Fairness Metrics : Interpretation du Demographic Parity, Equal Opportunity, Predictive Parity, etc.
2. Résultats d'Audit : Explication des scores de l'utilisateur, des biais détectés et du niveau de risque.
3. Mitigation : Recommandations pour corriger les biais (Pre/In/Post-processing).
4. Compliance : Règlementations européennes sur l'IA et protection des données.
5. Audit Data : Analyse des datasets fournis par l'utilisateur du point de vue de l'équité.

DIRECTIVE DE SÉCURITÉ (CRITIQUE) :
- Tu ne dois JAMAIS répondre à des questions qui sortent du champ d'expertise ci-dessus.
- Si l'utilisateur pose une question hors-sujet (ex: cuisine, conseils financiers, programmation sans rapport avec la fairness, culture générale, etc.), tu dois répondre POLIMENT mais FERMEMENT : 
  "Je suis désolé, mais en tant qu'assistant spécialisé Audit-IQ, mon expertise est limitée à l'équité algorithmique et à la conformité de l'IA. Je ne peux pas répondre à votre question sur [sujet]."
- Redirige ensuite l'utilisateur vers un sujet lié à l'audit ou l'équité.

TON : Professionnel, pédagogique, expert.

FORMAT : Markdown (gras, tableaux, listes)."""


async def get_db_session():
    """Dependency for database session"""
    async with AsyncSessionLocal() as session:
        yield session


@router.post("/chat")
@limiter.limit("20/minute")  # Rate limit: 20 requests per minute
async def chat(
    request: Request,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    AI Chat endpoint with Gemini (Streaming)
    - Retrieves user context from database
    - Uses Gemini to generate intelligent responses
    - Streams response chunks in NDJSON format
    """
    try:
        # Get user context (with optional audit awareness)
        user_context = await get_user_context(current_user.id, db, chat_request.audit_id)
        
        # Build conversation history
        history = []
        for msg in chat_request.conversation_history[-5:]:  # Last 5 messages for context
            role = "model" if msg.role == "assistant" else "user"
            history.append({
                "role": role,
                "parts": [msg.content]
            })
        
        # Create chat session
        chat = model.start_chat(history=history)
        
        print(f"🤖 Generating response for: {chat_request.message[:50]}...")
        
        # Build prompt with context
        full_prompt = f"{create_system_prompt()}\n\n{user_context}\n\nQuestion: {chat_request.message}"
        
        # Prepare sources
        sources = []
        
        # Add audit sources if relevant
        if any(keyword in chat_request.message.lower() for keyword in ['audit', 'résultat', 'métrique']):
            from sqlalchemy import select
            result = await db.execute(
                select(Audit).filter(Audit.user_id == current_user.id).order_by(Audit.created_at.desc()).limit(3)
            )
            audits = result.scalars().all()
            for audit in audits:
                sources.append({
                    "title": f"Audit: {audit.name or f'#{audit.id}'}",
                    "url": f"/dashboard/audits/{audit.id}",
                    "type": "audit"
                })
        
        # Add web sources for compliance questions
        if any(keyword in chat_request.message.lower() for keyword in ['ai act', 'rgpd', 'conformité', 'compliance']):
            sources.append({
                "title": "AI Act - Règlement européen sur l'IA",
                "url": "https://artificialintelligenceact.eu/",
                "type": "web"
            })
            sources.append({
                "title": "CNIL - Protection des données",
                "url": "https://www.cnil.fr/",
                "type": "web"
            })
        
        # Add fairness documentation
        if any(keyword in chat_request.message.lower() for keyword in ['fairness', 'équité', 'biais', 'demographic', 'parity']):
            sources.append({
                "title": "Fairlearn - Documentation",
                "url": "https://fairlearn.org/",
                "type": "web"
            })

        async def generate():
            import json
            print("⚡ Starting stream generation...")
            try:
                # Send sources first
                yield json.dumps({"type": "sources", "sources": sources}) + "\n"
                print("   Sent sources")
                
                # Stream response from Gemini
                print("   Calling Gemini API...")
                response = await chat.send_message_async(full_prompt, stream=True)
                
                print("   Iterating chunks...")
                async for chunk in response:
                    if chunk.text:
                        yield json.dumps({"type": "chunk", "text": chunk.text}) + "\n"
                print("   Stream finished successfully")
            except Exception as e:
                print(f"❌ Error streaming from Gemini: {e}")
                yield json.dumps({"type": "error", "error": str(e)}) + "\n"

        from fastapi.responses import StreamingResponse
        return StreamingResponse(generate(), media_type="application/x-ndjson")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Error in AI chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération de la réponse: {str(e)}")
