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
model = genai.GenerativeModel('gemini-3-pro-preview')

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []


class Source(BaseModel):
    title: str
    url: Optional[str] = None
    type: str  # 'audit', 'dataset', 'web'


class ChatResponse(BaseModel):
    response: str
    sources: List[Source] = []



async def get_user_context(user_id: int, db: AsyncSession) -> str:
    """Retrieve user's audit data for context"""
    from sqlalchemy import select
    
    # Get recent audits
    result = await db.execute(
        select(Audit).filter(Audit.user_id == user_id).order_by(Audit.created_at.desc()).limit(5)
    )
    audits = result.scalars().all()
    
    # Get datasets
    result = await db.execute(
        select(Dataset).filter(Dataset.user_id == user_id).order_by(Dataset.created_at.desc()).limit(5)
    )
    datasets = result.scalars().all()
    
    context = "=== CONTEXTE UTILISATEUR ===\n\n"
    
    if audits:
        context += "AUDITS RÉCENTS:\n"
        for audit in audits:
            context += f"- Audit #{audit.id}: {audit.name or 'Sans nom'}\n"
            if audit.fairness_metrics:
                context += f"  Métriques: {audit.fairness_metrics}\n"
            if audit.status:
                context += f"  Statut: {audit.status}\n"
            context += "\n"
    
    if datasets:
        context += "DATASETS:\n"
        for dataset in datasets:
            context += f"- Dataset: {dataset.filename}\n"
            if dataset.row_count:
                context += f"  Lignes: {dataset.row_count}\n"
            if dataset.column_count:
                context += f"  Colonnes (Total): {dataset.column_count}\n"
            
            # Read file content preview
            try:
                file_path = UPLOAD_DIR / dataset.filename
                if file_path.exists():
                    if dataset.filename.endswith('.csv'):
                        # Try different encodings if utf-8 fails
                        try:
                            df = pd.read_csv(file_path, nrows=5)
                        except UnicodeDecodeError:
                            df = pd.read_csv(file_path, nrows=5, encoding='latin-1')
                    elif dataset.filename.endswith(('.xls', '.xlsx')):
                        df = pd.read_excel(file_path, nrows=5)
                    else:
                        df = None
                    
                    if df is not None:
                        context += f"  Noms des colonnes: {', '.join(df.columns)}\n"
                        context += f"  Aperçu des données (5 premières lignes):\n"
                        context += df.to_markdown(index=False) + "\n"
            except Exception as e:
                print(f"Error reading dataset {dataset.id}: {e}")
                
            context += "\n"
    
    return context


def create_system_prompt() -> str:
    """Create system prompt for Gemini"""
    return """Tu es l'Assistant Audit-IQ, un expert en équité algorithmique et conformité IA.

RÔLE:
- Aider les utilisateurs à comprendre les métriques de fairness
- Interpréter les résultats d'audit
- Fournir des recommandations de mitigation
- Expliquer la conformité AI Act et RGPD

TON ET PERSONNALITÉ:
- Professionnel, empathique et encourageant.
- Tu es un collègue expert, pas un robot froid.
- Évite les répétitions : ne dis pas "Bonjour" ou ne te présente pas à chaque message si la conversation est déjà en cours.
- Sois direct et pertinent.

MÉTRIQUES DE FAIRNESS:
- Demographic Parity: Égalité des taux de prédiction positive entre groupes
- Equal Opportunity: Égalité des taux de vrais positifs
- Equalized Odds: Égalité des taux de vrais positifs ET faux positifs
- Calibration: Précision des probabilités prédites par groupe

STYLE:
- Réponses claires et concises en français
- Utilise des exemples concrets
- Cite des sources quand possible
- Fournis des liens vers documentation officielle
- Utilise le format Markdown pour structurer tes réponses (gras, listes, tableaux).

SOURCES:
- Pour l'AI Act: https://artificialintelligenceact.eu/
- Pour RGPD: https://www.cnil.fr/
- Pour fairness: https://fairlearn.org/

Réponds toujours de manière professionnelle et pédagogique."""


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
        # Get user context
        user_context = await get_user_context(current_user.id, db)
        
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
            # Send sources first
            yield json.dumps({"type": "sources", "sources": sources}) + "\n"
            
            # Stream response from Gemini
            try:
                # Use async streaming if available, otherwise synchronous in thread
                # Assuming google-generativeai supports async
                response = await chat.send_message_async(full_prompt, stream=True)
                async for chunk in response:
                    if chunk.text:
                        yield json.dumps({"type": "chunk", "text": chunk.text}) + "\n"
            except Exception as e:
                print(f"Error streaming from Gemini: {e}")
                yield json.dumps({"type": "error", "error": str(e)}) + "\n"

        from fastapi.responses import StreamingResponse
        return StreamingResponse(generate(), media_type="application/x-ndjson")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Error in AI chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération de la réponse: {str(e)}")
