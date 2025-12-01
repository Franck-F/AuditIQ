from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
from pathlib import Path

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset, Audit
from auth_middleware import get_current_user
from services.fairness import calculate_fairness_metrics

router = APIRouter(prefix="/api/audits", tags=["audits"])
UPLOAD_DIR = Path("uploads")

# Pydantic Models
class AuditCreateRequest(BaseModel):
    dataset_id: int
    name: str
    target_column: str
    sensitive_attributes: List[str]
    metrics: List[str] = ["demographic_parity"]
    use_case: str = "other"

class AuditResponse(BaseModel):
    id: int
    name: str
    status: str
    created_at: str
    score: Optional[float] = None

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def run_audit_task(audit_id: int, dataset_path: Path, config: Dict[str, Any]):
    """
    Tâche d'arrière-plan pour exécuter l'audit
    """
    async with AsyncSessionLocal() as db:
        try:
            # Récupérer l'audit
            stmt = select(Audit).where(Audit.id == audit_id)
            result = await db.execute(stmt)
            audit = result.scalar_one_or_none()
            
            if not audit:
                return

            audit.status = "running"
            await db.commit()
            
            # Charger les données
            if str(dataset_path).endswith('.csv'):
                df = pd.read_csv(dataset_path)
            else:
                df = pd.read_excel(dataset_path)
                
            # Calculer les métriques
            results = calculate_fairness_metrics(df, config)
            
            # Mettre à jour l'audit
            audit.results = results["details"]
            audit.overall_score = results["global_score"]
            audit.risk_level = results["risk_level"]
            audit.status = "completed"
            audit.bias_detected = results["global_score"] < 80
            
            await db.commit()
            
        except Exception as e:
            print(f"Error running audit {audit_id}: {e}")
            if audit:
                audit.status = "failed"
                await db.commit()

@router.post("/create", response_model=AuditResponse)
async def create_audit(
    request: AuditCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Vérifier le dataset
    stmt = select(Dataset).where(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Créer l'audit en base
    new_audit = Audit(
        dataset_id=dataset.id,
        user_id=current_user.id,
        audit_name=request.name,
        use_case=request.use_case,
        target_column=request.target_column,
        sensitive_attributes=request.sensitive_attributes,
        fairness_metrics=request.metrics,
        status="pending"
    )
    
    db.add(new_audit)
    await db.commit()
    await db.refresh(new_audit)
    
    # Lancer le calcul en arrière-plan
    file_path = UPLOAD_DIR / dataset.filename
    config = {
        "target_column": request.target_column,
        "sensitive_attributes": request.sensitive_attributes,
        "fairness_metrics": request.metrics
    }
    
    background_tasks.add_task(run_audit_task, new_audit.id, file_path, config)
    
    return AuditResponse(
        id=new_audit.id,
        name=new_audit.audit_name,
        status=new_audit.status,
        created_at=new_audit.created_at.isoformat()
    )

@router.get("/{audit_id}")
async def get_audit(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    return {
        "id": audit.id,
        "name": audit.audit_name,
        "status": audit.status,
        "score": audit.overall_score,
        "risk_level": audit.risk_level,
        "results": audit.results, # JSON détaillé
        "created_at": audit.created_at
    }

@router.get("/")
async def list_audits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Audit).where(Audit.user_id == current_user.id).order_by(Audit.created_at.desc())
    result = await db.execute(stmt)
    audits = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "name": a.audit_name,
            "status": a.status,
            "score": a.overall_score,
            "created_at": a.created_at
        }
        for a in audits
    ]
