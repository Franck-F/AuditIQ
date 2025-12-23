from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from pathlib import Path

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset, Audit
from auth_middleware import get_current_user
from services.eda.eda_service import EDAService

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
            
            y_prob = None
            if dataset.probability_column and dataset.probability_column in df.columns:
                y_prob = df[dataset.probability_column].values
            
            sensitive_features = df[sensitive_attrs]
            
            # Utiliser le nouveau ComprehensiveFairnessCalculator via EnhancedFairnessService
            from services.fairness.service import EnhancedFairnessService
            service = EnhancedFairnessService()
            
            fairness_results = await service.run_full_audit(
                y_true=y_true.values,
                y_pred=y_pred.values,
                y_prob=y_prob,
                sensitive_features=sensitive_features,
                feature_names=sensitive_attrs
            )
            
            # Mettre à jour les champs de l'audit avec les résultats complets
            audit.overall_score = fairness_results.get("overall_score", 0)
            audit.risk_level = fairness_results.get("risk_assessment", {}).get("risk_level", "Medium")
            audit.compliant = fairness_results.get("risk_assessment", {}).get("is_fair", True)
            
            audit.metrics_results = fairness_results.get("fairness_scores") 
            audit.detailed_metrics = fairness_results
            audit.group_metrics = fairness_results.get("group_metrics")
            audit.disaggregated_metrics = fairness_results.get("disaggregated_metrics")
            
            # Générer les recommandations
            audit.ai_recommendations = await service.generate_ai_recommendations(fairness_results)
            audit.mitigation_recommendations = await service.get_mitigation_recommendations(fairness_results)
            
            # Finaliser l'audit
            audit.status = "completed"
            audit.completed_at = func.now()
            audit.bias_detected = audit.overall_score < 80
            
            # Marquer le dataset comme prêt
            dataset.status = "ready"
            
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
    # Vérifier le dataset (Propriétaire ou même Organisation)
    if current_user.organization_id:
        stmt = select(Dataset).where(
            Dataset.id == request.dataset_id,
            Dataset.organization_id == current_user.organization_id
        )
    else:
        stmt = select(Dataset).where(
            Dataset.id == request.dataset_id,
            Dataset.user_id == current_user.id
        )
    
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    # Créer l'audit en base
    new_audit = Audit(
        dataset_id=dataset.id,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
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
        # Get all audits for the user or their organization
        if current_user.organization_id:
            stmt = select(Audit).where(Audit.organization_id == current_user.organization_id)
        else:
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
        
        # Count critical biases (score < 60) - Aligné sur les nouveaux seuils
        critical_biases = sum(1 for audit in audits if audit.overall_score is not None and audit.overall_score < 60)
        
        # Calculate compliance rate (score >= 80)
        compliant_audits = sum(1 for audit in audits if audit.overall_score is not None and audit.overall_score >= 80)
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
    if current_user.organization_id:
        stmt = select(Audit).where(Audit.id == audit_id, Audit.organization_id == current_user.organization_id)
    else:
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
        "overall_score": audit.overall_score,
        "risk_level": audit.risk_level,
        "metrics_results": audit.metrics_results,
        "detailed_metrics": audit.detailed_metrics,
        "ai_recommendations": audit.ai_recommendations,
        "mitigation_recommendations": audit.mitigation_recommendations,
        "group_metrics": audit.group_metrics,
        "disaggregated_metrics": audit.disaggregated_metrics,
        "target_column": audit.target_column,
        "sensitive_attributes": audit.sensitive_attributes,
        "prediction_column": audit.prediction_column,
        "created_at": audit.created_at
    }

@router.get("/")
async def list_audits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.organization_id:
        stmt = select(Audit).where(Audit.organization_id == current_user.organization_id).order_by(Audit.created_at.desc())
    else:
        stmt = select(Audit).where(Audit.user_id == current_user.id).order_by(Audit.created_at.desc())
        
    result = await db.execute(stmt)
    audits = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "name": a.audit_name,
            "status": a.status,
            "score": a.overall_score,
            "overall_score": a.overall_score,
            "use_case": a.use_case,
            "risk_level": a.risk_level,
            "critical_bias_count": a.critical_bias_count or (1 if a.overall_score and a.overall_score < 60 else 0),
            "created_at": a.created_at
        }
        for a in audits
    ]


@router.get("/{audit_id}/eda")
async def get_audit_eda(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère l'analyse exploratoire (EDA) pour un audit spécifique.
    """
    # 1. Récupérer l'audit (Propriétaire ou Organisation)
    if current_user.organization_id:
        stmt = select(Audit).where(Audit.id == audit_id, Audit.organization_id == current_user.organization_id)
    else:
        stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
        
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    stmt_ds = select(Dataset).where(Dataset.id == audit.dataset_id)
    result_ds = await db.execute(stmt_ds)
    dataset = result_ds.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # 2. Charger les données (CSV ou Excel)
    dataset_path = UPLOAD_DIR / dataset.filename
    if not dataset_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found")
        
    try:
        if str(dataset_path).endswith('.csv'):
            df = pd.read_csv(dataset_path)
        else:
            df = pd.read_excel(dataset_path)
            
        # 3. Générer le rapport EDA
        eda_service = EDAService()
        eda_report = eda_service.generate_eda_report(
            df, 
            target_column=audit.target_column,
            sensitive_attributes=audit.sensitive_attributes
        )
        
        return eda_report
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating EDA: {str(e)}")
