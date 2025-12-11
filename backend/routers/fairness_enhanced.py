"""
Enhanced Fairness Audit API Endpoints

Provides comprehensive fairness auditing capabilities with:
- Detailed metrics
- AI recommendations
- Mitigation strategies
- Model comparison
- Advanced analysis (intersectional, subgroup discovery, trends)
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset, Audit
from auth_middleware import get_current_user
from services.fairness import EnhancedFairnessService  # Main service from fairness.py
from services.fairness.analysis import AdvancedFairnessAnalyzer

router = APIRouter(prefix="/api/audits/enhanced", tags=["fairness-enhanced"])


# ==================== Pydantic Models ====================

class DetailedMetricsResponse(BaseModel):
    """Response for detailed metrics endpoint"""
    overall_metrics: Dict[str, float]
    fairness_scores: Dict[str, float]
    disaggregated_metrics: Dict[str, Any]
    group_metrics: Dict[str, Any]
    risk_assessment: Dict[str, Any]


class AIRecommendationsResponse(BaseModel):
    """Response for AI recommendations"""
    severity: str
    overall_assessment: str
    problematic_metrics: List[str]
    affected_groups: List[str]
    root_causes: List[Dict[str, Any]]
    mitigation_strategies: List[Dict[str, Any]]
    immediate_actions: List[Dict[str, Any]]
    compliance: Dict[str, Any]


class MitigationRequest(BaseModel):
    """Request to apply mitigation strategy"""
    strategy_name: str  # 'threshold_optimizer', 'exponentiated_gradient', 'correlation_remover'
    constraint: Optional[str] = "demographic_parity"  # 'demographic_parity', 'equalized_odds'
    alpha: Optional[float] = 1.0  # For correlation_remover


class MitigationResponse(BaseModel):
    """Response from mitigation application"""
    strategy_name: str
    metrics_before: Dict[str, float]
    metrics_after: Dict[str, float]
    improvement: Dict[str, Any]
    recommendation: str


# ==================== Helper Functions ====================

async def get_db():
    """Database session dependency"""
    async with AsyncSessionLocal() as session:
        yield session


# ==================== Endpoints ====================

@router.get("/{audit_id}/metrics/detailed", response_model=DetailedMetricsResponse)
async def get_detailed_metrics(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive fairness metrics for an audit
    
    Returns all calculated metrics including:
    - Overall performance metrics
    - Fairness scores (demographic parity, equalized odds, etc.)
    - Disaggregated metrics per group
    - Detailed group metrics
    - Risk assessment
    """
    # Get audit
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if not audit.detailed_metrics:
        raise HTTPException(
            status_code=400,
            detail="Detailed metrics not available. Run audit first."
        )
    
    return DetailedMetricsResponse(
        overall_metrics=audit.detailed_metrics.get("overall_metrics", {}),
        fairness_scores=audit.detailed_metrics.get("fairness_scores", {}),
        disaggregated_metrics=audit.detailed_metrics.get("disaggregated_metrics", {}),
        group_metrics=audit.detailed_metrics.get("group_metrics", {}),
        risk_assessment=audit.detailed_metrics.get("risk_assessment", {})
    )


@router.get("/{audit_id}/recommendations/ai", response_model=AIRecommendationsResponse)
async def get_ai_recommendations(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered bias mitigation recommendations
    
    Uses Google Gemini to generate:
    - Severity assessment
    - Root cause analysis
    - Prioritized mitigation strategies
    - Immediate action items
    - Compliance status
    """
    # Get audit
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if not audit.ai_recommendations:
        raise HTTPException(
            status_code=400,
            detail="AI recommendations not available. Run audit first."
        )
    
    return AIRecommendationsResponse(**audit.ai_recommendations)


@router.post("/{audit_id}/mitigation/apply", response_model=MitigationResponse)
async def apply_mitigation_strategy(
    audit_id: int,
    request: MitigationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Apply a bias mitigation strategy
    
    Supported strategies:
    - threshold_optimizer: Optimize decision thresholds per group (post-processing)
    - exponentiated_gradient: Fairness-aware learning (in-processing)
    - correlation_remover: Remove feature correlation with sensitive attributes (preprocessing)
    
    Returns before/after comparison of fairness metrics.
    """
    # Get audit and dataset
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    stmt = select(Dataset).where(Dataset.id == audit.dataset_id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Apply mitigation in background
    service = EnhancedFairnessService()
    
    try:
        # Run mitigation (this is async but we'll run it sync for now)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        mitigation_result = await service.apply_mitigation_strategy(
            audit=audit,
            dataset=dataset,
            strategy_name=request.strategy_name,
            strategy_params={
                "constraint": request.constraint,
                "alpha": request.alpha
            },
            db=db
        )
        
        return MitigationResponse(
            strategy_name=mitigation_result["strategy_name"],
            metrics_before=mitigation_result["metrics_before"],
            metrics_after=mitigation_result["metrics_after"],
            improvement=mitigation_result["improvement"],
            recommendation=mitigation_result["recommendation"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mitigation failed: {str(e)}")


@router.get("/{audit_id}/mitigation/recommendations")
async def get_mitigation_recommendations(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recommended mitigation strategies based on audit results
    
    Returns prioritized list of mitigation strategies with:
    - Strategy name
    - Priority level
    - Rationale
    - Expected improvement
    - Implementation time
    """
    # Get audit
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if not audit.mitigation_recommendations:
        raise HTTPException(
            status_code=400,
            detail="Mitigation recommendations not available. Run audit first."
        )
    
    return {
        "audit_id": audit_id,
        "recommendations": audit.mitigation_recommendations
    }


@router.get("/{audit_id}/groups/comparison")
async def get_group_comparison(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed comparison of metrics across groups
    
    Returns:
    - Metrics for each group
    - Worst performing groups
    - Best performing groups
    - Disparity analysis
    """
    # Get audit
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if not audit.group_metrics:
        raise HTTPException(
            status_code=400,
            detail="Group metrics not available. Run audit first."
        )
    
    # Analyze groups
    group_analysis = {}
    
    for attr, groups in audit.group_metrics.items():
        # Find best and worst performing groups
        group_scores = {}
        for group_name, metrics in groups.items():
            if isinstance(metrics, dict) and 'accuracy' in metrics:
                group_scores[group_name] = metrics['accuracy']
        
        if group_scores:
            best_group = max(group_scores, key=group_scores.get)
            worst_group = min(group_scores, key=group_scores.get)
            disparity = group_scores[best_group] - group_scores[worst_group]
            
            group_analysis[attr] = {
                "groups": groups,
                "best_performing": {
                    "group": best_group,
                    "accuracy": group_scores[best_group]
                },
                "worst_performing": {
                    "group": worst_group,
                    "accuracy": group_scores[worst_group]
                },
                "disparity": disparity,
                "disparity_percentage": (disparity / group_scores[best_group] * 100) if group_scores[best_group] > 0 else 0
            }
    
    return {
        "audit_id": audit_id,
        "group_analysis": group_analysis
    }


@router.get("/{audit_id}/metrics/explain/{metric_name}")
async def explain_metric(
    audit_id: int,
    metric_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get plain-language explanation of a specific metric
    
    Uses AI to generate accessible explanations for non-technical stakeholders.
    """
    # Get audit
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if not audit.fairness_scores:
        raise HTTPException(
            status_code=400,
            detail="Metrics not available. Run audit first."
        )
    
    # Find metric value
    metric_value = audit.fairness_scores.get(metric_name)
    
    if metric_value is None:
        raise HTTPException(
            status_code=404,
            detail=f"Metric '{metric_name}' not found in audit results"
        )
    
    # Get explanation from AI
    service = EnhancedFairnessService()
    explanation = await service.ai_engine.explain_metric(
        metric_name=metric_name,
        value=metric_value,
        context=f"Audit: {audit.audit_name}, Use case: {audit.use_case}"
    )
    
    return {
        "metric_name": metric_name,
        "value": metric_value,
        "explanation": explanation
    }


@router.get("/{audit_id}/compliance/status")
async def get_compliance_status(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI Act and GDPR compliance status
    
    Returns:
    - Compliance status for each regulation
    - Required documentation
    - Action items for compliance
    """
    # Get audit
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if not audit.ai_recommendations:
        raise HTTPException(
            status_code=400,
            detail="Compliance information not available. Run audit first."
        )
    
    compliance_info = audit.ai_recommendations.get("compliance", {})
    
    return {
        "audit_id": audit_id,
        "audit_name": audit.audit_name,
        "compliance": compliance_info,
        "overall_compliant": audit.compliant,
        "risk_level": audit.risk_level
    }
