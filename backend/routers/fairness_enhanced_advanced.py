"""
Advanced Fairness Analysis API Endpoints

Provides endpoints for:
- Intersectional analysis
- Subgroup discovery
- Trend analysis
- Model comparison
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import pandas as pd
import numpy as np

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset, Audit
from auth_middleware import get_current_user
from services.fairness import EnhancedFairnessService
from services.fairness.analysis import AdvancedFairnessAnalyzer

router = APIRouter(prefix="/api/audits/enhanced", tags=["fairness-advanced"])


# ==================== Helper Functions ====================

async def get_db():
    """Database session dependency"""
    async with AsyncSessionLocal() as session:
        yield session


# ==================== ADVANCED ANALYSIS ENDPOINTS ====================

@router.get("/{audit_id}/analysis/intersectional")
async def get_intersectional_analysis(
    audit_id: int,
    max_combination_size: int = 2,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get intersectional fairness analysis
    
    Analyzes fairness across intersections of sensitive attributes.
    Example: Not just "gender" or "race", but "Black women", "Asian men", etc.
    
    Args:
        max_combination_size: Maximum number of attributes to combine (default: 2)
    
    Returns:
        Intersectional analysis with vulnerable subgroups
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
    
    # Load data
    service = EnhancedFairnessService()
    df, y_true, y_pred, y_prob, sensitive_attrs = service._load_and_prepare_data(dataset, audit)
    
    if df is None:
        raise HTTPException(status_code=400, detail="Failed to load dataset")
    
    # Perform intersectional analysis
    analyzer = AdvancedFairnessAnalyzer(audit.sensitive_attributes)
    
    try:
        intersectional_result = analyzer.analyze_intersectionality(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_attrs=sensitive_attrs,
            max_combination_size=max_combination_size
        )
        
        return {
            "audit_id": audit_id,
            "attribute_combinations": [list(combo) for combo in intersectional_result.attribute_combinations],
            "subgroup_metrics": intersectional_result.subgroup_metrics,
            "worst_subgroups": intersectional_result.worst_subgroups,
            "disparity_matrix": intersectional_result.disparity_matrix,
            "recommendations": intersectional_result.recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intersectional analysis failed: {str(e)}")


@router.get("/{audit_id}/analysis/subgroups")
async def discover_vulnerable_subgroups(
    audit_id: int,
    min_group_size: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Discover vulnerable subgroups using automated analysis
    
    Identifies subgroups that may need additional protection or intervention.
    
    Args:
        min_group_size: Minimum size for a subgroup to be considered (default: 30)
    
    Returns:
        List of discovered vulnerable subgroups with vulnerability scores
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
    
    # Load data
    service = EnhancedFairnessService()
    df, y_true, y_pred, y_prob, sensitive_attrs = service._load_and_prepare_data(dataset, audit)
    
    if df is None:
        raise HTTPException(status_code=400, detail="Failed to load dataset")
    
    # Discover vulnerable subgroups
    analyzer = AdvancedFairnessAnalyzer(audit.sensitive_attributes)
    
    try:
        subgroup_discovery = analyzer.discover_vulnerable_subgroups(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_attrs=sensitive_attrs,
            min_group_size=min_group_size
        )
        
        return {
            "audit_id": audit_id,
            "discovered_subgroups": subgroup_discovery.discovered_subgroups,
            "vulnerability_scores": subgroup_discovery.vulnerability_scores,
            "protection_needed": subgroup_discovery.protection_needed,
            "insights": subgroup_discovery.insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subgroup discovery failed: {str(e)}")


@router.post("/{audit_id}/analysis/trends")
async def analyze_fairness_trends(
    audit_id: int,
    historical_audit_ids: List[int],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze fairness trends over time
    
    Compares fairness metrics across multiple audits to identify trends.
    
    Args:
        historical_audit_ids: List of audit IDs to compare (in chronological order)
    
    Returns:
        Trend analysis showing improvement or degradation over time
    """
    # Get all audits
    all_audit_ids = [audit_id] + historical_audit_ids
    
    historical_metrics = []
    time_periods = []
    
    for aid in all_audit_ids:
        stmt = select(Audit).where(Audit.id == aid, Audit.user_id == current_user.id)
        result = await db.execute(stmt)
        audit = result.scalar_one_or_none()
        
        if not audit:
            continue
        
        if audit.fairness_scores:
            historical_metrics.append(audit.fairness_scores)
            time_periods.append(audit.created_at.isoformat() if audit.created_at else f"Audit {aid}")
    
    if len(historical_metrics) < 2:
        raise HTTPException(
            status_code=400,
            detail="Need at least 2 audits for trend analysis"
        )
    
    # Analyze trends
    analyzer = AdvancedFairnessAnalyzer([])
    
    try:
        trend_analysis = analyzer.analyze_fairness_trends(
            historical_metrics=historical_metrics,
            time_periods=time_periods
        )
        
        return {
            "audit_id": audit_id,
            "trend_analysis": trend_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")


@router.post("/{audit_id}/analysis/compare-models")
async def compare_models(
    audit_id: int,
    comparison_audit_ids: List[int],
    model_names: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare fairness-performance tradeoffs across multiple models
    
    Analyzes multiple audits (representing different models) to identify
    the best fairness-performance balance.
    
    Args:
        comparison_audit_ids: List of audit IDs to compare
        model_names: Optional names for each model
    
    Returns:
        Model comparison with Pareto frontier analysis
    """
    # Get all audits
    all_audit_ids = [audit_id] + comparison_audit_ids
    
    if model_names is None:
        model_names = [f"Model {i+1}" for i in range(len(all_audit_ids))]
    elif len(model_names) != len(all_audit_ids):
        raise HTTPException(
            status_code=400,
            detail="Number of model names must match number of audits"
        )
    
    models_results = []
    
    for aid in all_audit_ids:
        stmt = select(Audit).where(Audit.id == aid, Audit.user_id == current_user.id)
        result = await db.execute(stmt)
        audit = result.scalar_one_or_none()
        
        if not audit:
            raise HTTPException(status_code=404, detail=f"Audit {aid} not found")
        
        if not audit.detailed_metrics:
            raise HTTPException(
                status_code=400,
                detail=f"Audit {aid} missing detailed metrics"
            )
        
        # Combine overall metrics and fairness scores
        combined_results = {
            **audit.detailed_metrics.get("overall_metrics", {}),
            **audit.detailed_metrics.get("fairness_scores", {})
        }
        models_results.append(combined_results)
    
    # Compare models
    analyzer = AdvancedFairnessAnalyzer([])
    
    try:
        comparison = analyzer.compare_models(
            models_results=models_results,
            model_names=model_names
        )
        
        return {
            "audit_id": audit_id,
            "comparison": comparison
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model comparison failed: {str(e)}")
