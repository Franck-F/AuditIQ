"""
What-If Tool API Endpoints

Provides interactive exploration and counterfactual analysis
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset, Audit
from auth_middleware import get_current_user
from services.fairness import EnhancedFairnessService
from services.fairness.whatif import WhatIfAnalyzer

router = APIRouter(prefix="/api/audits/enhanced", tags=["what-if-tool"])


# ==================== Pydantic Models ====================

class CounterfactualRequest(BaseModel):
    """Request for counterfactual generation"""
    instance_index: int  # Index of instance in dataset
    desired_outcome: int  # 0 or 1
    sensitive_features: Optional[List[str]] = None
    max_changes: int = 3


class FeatureImportanceRequest(BaseModel):
    """Request for feature importance calculation"""
    method: str = "shap"  # 'shap', 'permutation', 'coefficients'
    sample_size: Optional[int] = 100  # Number of samples for SHAP


class ExploreRequest(BaseModel):
    """Request for prediction exploration"""
    instance_index: int
    feature_ranges: Optional[Dict[str, List[float]]] = None  # {feature: [min, max]}


# ==================== Helper Functions ====================

async def get_db():
    """Database session dependency"""
    async with AsyncSessionLocal() as session:
        yield session


# ==================== Endpoints ====================

@router.post("/{audit_id}/whatif/counterfactual")
async def generate_counterfactual(
    audit_id: int,
    request: CounterfactualRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate counterfactual explanation for a specific instance
    
    Finds minimal changes to features that would flip the prediction.
    
    Args:
        instance_index: Index of instance in dataset
        desired_outcome: Desired prediction (0 or 1)
        sensitive_features: Features that should not be changed
        max_changes: Maximum number of features to change
    
    Returns:
        Counterfactual instance with minimal changes
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
    
    # Get instance
    if request.instance_index >= len(df):
        raise HTTPException(status_code=400, detail="Instance index out of range")
    
    # Prepare features
    exclude_cols = [audit.target_column] + audit.sensitive_attributes
    if hasattr(audit, 'prediction_column') and audit.prediction_column:
        exclude_cols.append(audit.prediction_column)
    
    feature_cols = [col for col in df.columns if col not in exclude_cols]
    X = df[feature_cols].select_dtypes(include=[np.number]).fillna(0)
    
    instance = X.iloc[request.instance_index].values
    
    # Train a simple model if needed
    from sklearn.linear_model import LogisticRegression
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y_true)
    
    # Create What-If analyzer
    analyzer = WhatIfAnalyzer(model, X.columns.tolist())
    
    try:
        # Generate counterfactual
        cf_result = analyzer.generate_counterfactual(
            instance=instance,
            desired_outcome=request.desired_outcome,
            sensitive_features=request.sensitive_features,
            max_changes=request.max_changes
        )
        
        if cf_result is None:
            return {
                "success": False,
                "message": "Could not find counterfactual or instance already has desired outcome"
            }
        
        return {
            "success": True,
            "original_instance": cf_result.original_instance,
            "counterfactual_instance": cf_result.counterfactual_instance,
            "original_prediction": cf_result.original_prediction,
            "counterfactual_prediction": cf_result.counterfactual_prediction,
            "features_changed": cf_result.features_changed,
            "minimal_changes": cf_result.minimal_changes,
            "distance": cf_result.distance,
            "explanation": f"By changing {len(cf_result.features_changed)} feature(s) ({', '.join(cf_result.features_changed)}), "
                          f"the prediction changes from {cf_result.original_prediction:.2%} to {cf_result.counterfactual_prediction:.2%}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Counterfactual generation failed: {str(e)}")


@router.post("/{audit_id}/whatif/feature-importance")
async def calculate_feature_importance(
    audit_id: int,
    request: FeatureImportanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate feature importance using SHAP or other methods
    
    Args:
        method: 'shap', 'permutation', or 'coefficients'
        sample_size: Number of samples to use for SHAP (default: 100)
    
    Returns:
        Feature importance scores and SHAP values
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
    
    # Prepare features
    exclude_cols = [audit.target_column] + audit.sensitive_attributes
    if hasattr(audit, 'prediction_column') and audit.prediction_column:
        exclude_cols.append(audit.prediction_column)
    
    feature_cols = [col for col in df.columns if col not in exclude_cols]
    X = df[feature_cols].select_dtypes(include=[np.number]).fillna(0)
    
    # Sample if needed
    if request.sample_size and len(X) > request.sample_size:
        X_sample = X.sample(n=request.sample_size, random_state=42)
        y_sample = y_true[X_sample.index]
    else:
        X_sample = X
        y_sample = y_true
    
    # Train model
    from sklearn.linear_model import LogisticRegression
    model = LogisticRegression(max_iter=1000)
    model.fit(X_sample, y_sample)
    
    # Create What-If analyzer
    analyzer = WhatIfAnalyzer(model, X.columns.tolist())
    
    try:
        # Calculate feature importance
        importance_result = analyzer.calculate_feature_importance(
            X=X_sample.values,
            method=request.method
        )
        
        return {
            "feature_importances": importance_result.feature_importances,
            "base_value": importance_result.base_value,
            "explanation_type": importance_result.explanation_type,
            "top_features": list(importance_result.feature_importances.keys())[:10],
            "has_shap_values": importance_result.shap_values is not None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature importance calculation failed: {str(e)}")


@router.post("/{audit_id}/whatif/explore")
async def explore_prediction(
    audit_id: int,
    request: ExploreRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explore how changing features affects prediction
    
    Interactive exploration of prediction sensitivity to feature changes.
    
    Args:
        instance_index: Index of instance to explore
        feature_ranges: Optional custom ranges for each feature
    
    Returns:
        Sensitivity analysis showing how prediction changes with features
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
    
    # Get instance
    if request.instance_index >= len(df):
        raise HTTPException(status_code=400, detail="Instance index out of range")
    
    # Prepare features
    exclude_cols = [audit.target_column] + audit.sensitive_attributes
    if hasattr(audit, 'prediction_column') and audit.prediction_column:
        exclude_cols.append(audit.prediction_column)
    
    feature_cols = [col for col in df.columns if col not in exclude_cols]
    X = df[feature_cols].select_dtypes(include=[np.number]).fillna(0)
    
    instance = X.iloc[request.instance_index].values
    
    # Convert feature_ranges to tuples
    feature_ranges_tuples = None
    if request.feature_ranges:
        feature_ranges_tuples = {
            k: tuple(v) for k, v in request.feature_ranges.items()
        }
    
    # Train model
    from sklearn.linear_model import LogisticRegression
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y_true)
    
    # Create What-If analyzer
    analyzer = WhatIfAnalyzer(model, X.columns.tolist())
    
    try:
        # Explore prediction
        exploration = analyzer.explore_prediction(
            instance=instance,
            feature_ranges=feature_ranges_tuples
        )
        
        return {
            "audit_id": audit_id,
            "instance_index": request.instance_index,
            "exploration": exploration
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction exploration failed: {str(e)}")


@router.get("/{audit_id}/whatif/instances")
async def get_instances_for_exploration(
    audit_id: int,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sample instances for What-If exploration
    
    Returns a sample of instances from the dataset for interactive exploration.
    
    Args:
        limit: Maximum number of instances to return
    
    Returns:
        List of instances with their features and predictions
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
    
    # Sample instances
    sample_df = df.sample(n=min(limit, len(df)), random_state=42)
    
    instances = []
    for idx, row in sample_df.iterrows():
        instance_data = {
            "index": int(idx),
            "features": row.to_dict(),
            "true_label": int(y_true[idx]),
            "predicted_label": int(y_pred[idx]) if idx < len(y_pred) else None,
            "sensitive_attributes": {
                attr: row[attr] for attr in audit.sensitive_attributes if attr in row
            }
        }
        instances.append(instance_data)
    
    return {
        "audit_id": audit_id,
        "total_instances": len(df),
        "returned_instances": len(instances),
        "instances": instances
    }
