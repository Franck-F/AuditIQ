from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
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
                
            # Récupérer le dataset pour vérifier si prédictions disponibles
            stmt_dataset = select(Dataset).join(Audit).where(Audit.id == audit_id)
            result_dataset = await db.execute(stmt_dataset)
            dataset = result_dataset.scalar_one_or_none()
            
            # Vérifier si prédictions ML disponibles
            if not dataset or not dataset.has_predictions:
                raise ValueError(
                    "No ML predictions available. Please train a model or upload predictions first. "
                    "Use /api/ml/datasets/{dataset_id}/auto-train or /api/ml/datasets/{dataset_id}/upload-predictions"
                )
            
            # Extraire colonnes nécessaires
            target_col = config["target_column"]
            sensitive_attrs = config["sensitive_attributes"]
            
            y_true = df[target_col]
            y_pred = df[dataset.prediction_column]
            sensitive_features = df[sensitive_attrs]
            
            # Calculer vraies métriques de fairness
            fairness_results = calculate_fairness_metrics(
                y_true=y_true,
                y_pred=y_pred,
                sensitive_features=sensitive_features,
                sensitive_feature_names=sensitive_attrs
            )
            
            # Calculer score global (moyenne des scores de fairness)
            fairness_scores = fairness_results.get('fairness_scores', {})
            if fairness_scores:
                # Convertir scores en pourcentage (0-100)
                overall_score = np.mean(list(fairness_scores.values())) * 100
            else:
                overall_score = 0
            
            # Déterminer risk level
            if overall_score >= 80:
                risk_level = "low"
            elif overall_score >= 60:
                risk_level = "medium"
            else:
                risk_level = "high"
            
            # Mettre à jour l'audit
            audit.metrics_results = fairness_results  # Stocker tous les résultats
            audit.overall_score = overall_score
            audit.risk_level = risk_level
            audit.status = "completed"
            audit.bias_detected = overall_score < 80
            audit.critical_bias_count = sum(1 for score in fairness_scores.values() if score < 0.7)
            
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

@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get dashboard statistics for the current user
    """
    from datetime import datetime, timedelta
    
    try:
        # Get all audits for the user
        stmt = select(Audit).where(Audit.user_id == current_user.id)
        result = await db.execute(stmt)
        audits = result.scalars().all()
        
        total_audits = len(audits)
        
        if total_audits == 0:
            return {
                "total_audits": 0,
                "avg_fairness_score": 0,
                "critical_biases": 0,
                "compliance_rate": 0,
                "recent_audits_count": 0,
                "audits_this_month": 0
            }
        
        # Calculate average fairness score
        scores = [audit.overall_score for audit in audits if audit.overall_score is not None]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Count critical biases (score < 70)
        critical_biases = sum(1 for audit in audits if audit.overall_score and audit.overall_score < 70)
        
        # Calculate compliance rate (score >= 80)
        compliant_audits = sum(1 for audit in audits if audit.overall_score and audit.overall_score >= 80)
        compliance_rate = (compliant_audits / total_audits * 100) if total_audits > 0 else 0
        
        # Count audits this month
        now = datetime.utcnow()
        first_day_of_month = datetime(now.year, now.month, 1)
        audits_this_month = sum(
            1 for audit in audits 
            if audit.created_at and audit.created_at >= first_day_of_month
        )
        
        # Recent audits (last 7 days)
        seven_days_ago = now - timedelta(days=7)
        recent_audits = sum(
            1 for audit in audits 
            if audit.created_at and audit.created_at >= seven_days_ago
        )
        
        return {
            "total_audits": total_audits,
            "avg_fairness_score": round(avg_score, 1),
            "critical_biases": critical_biases,
            "compliance_rate": round(compliance_rate, 1),
            "recent_audits_count": recent_audits,
            "audits_this_month": audits_this_month
        }
        
    except Exception as e:
        print(f"Error calculating dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")


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
        "score": audit.overall_score,  # Frontend attend 'score'
        "overall_score": audit.overall_score,
        "risk_level": audit.risk_level,
        "metrics_results": audit.metrics_results,
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
            "score": a.overall_score,  # Frontend attend 'score'
            "overall_score": a.overall_score,  # Garder aussi pour compatibilité
            "use_case": a.use_case,
            "critical_bias_count": a.critical_bias_count,
            "created_at": a.created_at
        }
        for a in audits
    ]


