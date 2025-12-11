"""
Bias Mitigation Strategies using Fairlearn

Implements preprocessing, in-processing, and post-processing mitigation techniques.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import pickle

# Fairlearn mitigation imports
try:
    from fairlearn.preprocessing import CorrelationRemover
    from fairlearn.reductions import (
        ExponentiatedGradient,
        GridSearch,
        DemographicParity,
        EqualizedOdds,
        TruePositiveRateParity,
        FalsePositiveRateParity,
        ErrorRateParity
    )
    from fairlearn.postprocessing import ThresholdOptimizer
    FAIRLEARN_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Fairlearn mitigation not available: {e}")
    FAIRLEARN_AVAILABLE = False

# Scikit-learn
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier


@dataclass
class MitigationResult:
    """Results from applying mitigation strategy"""
    strategy_name: str
    strategy_type: str  # 'preprocessing', 'inprocessing', 'postprocessing'
    mitigated_model: Any
    performance_before: Dict[str, float]
    performance_after: Dict[str, float]
    fairness_before: Dict[str, float]
    fairness_after: Dict[str, float]
    improvement_summary: Dict[str, Any]
    model_artifact: bytes  # Pickled model


class BiasMitigationEngine:
    """
    Comprehensive bias mitigation using Fairlearn strategies
    """
    
    def __init__(self):
        self.available_strategies = self._get_available_strategies()
    
    def _get_available_strategies(self) -> Dict[str, Dict[str, Any]]:
        """List all available mitigation strategies"""
        
        strategies = {
            "correlation_remover": {
                "type": "preprocessing",
                "name": "Correlation Remover",
                "description": "Remove correlation between features and sensitive attributes",
                "complexity": "Low",
                "use_case": "When features are correlated with sensitive attributes"
            },
            "reweighting": {
                "type": "preprocessing",
                "name": "Sample Reweighting",
                "description": "Adjust sample weights to balance group representation",
                "complexity": "Low",
                "use_case": "Imbalanced group representation"
            },
            "exponentiated_gradient": {
                "type": "inprocessing",
                "name": "Exponentiated Gradient",
                "description": "Fairness-aware learning with demographic parity or equalized odds",
                "complexity": "Medium",
                "use_case": "Training new models with fairness constraints"
            },
            "grid_search": {
                "type": "inprocessing",
                "name": "Grid Search",
                "description": "Search over model parameters to optimize fairness-accuracy tradeoff",
                "complexity": "High",
                "use_case": "Finding optimal fairness-performance balance"
            },
            "threshold_optimizer": {
                "type": "postprocessing",
                "name": "Threshold Optimizer",
                "description": "Optimize decision thresholds per group",
                "complexity": "Low",
                "use_case": "Quick fix for existing models"
            }
        }
        
        return strategies
    
    # ==================== PREPROCESSING ====================
    
    def apply_correlation_remover(
        self,
        X: pd.DataFrame,
        sensitive_features: pd.DataFrame,
        alpha: float = 1.0
    ) -> Tuple[pd.DataFrame, Any]:
        """
        Remove correlation between features and sensitive attributes
        
        Args:
            X: Feature matrix
            sensitive_features: Sensitive attributes
            alpha: Strength of correlation removal (0-1)
        
        Returns:
            Transformed features, fitted transformer
        """
        if not FAIRLEARN_AVAILABLE:
            return X, None
        
        try:
            remover = CorrelationRemover(sensitive_feature_ids=sensitive_features.columns.tolist(), alpha=alpha)
            X_transformed = remover.fit_transform(X)
            
            # Convert back to DataFrame
            X_transformed_df = pd.DataFrame(
                X_transformed,
                columns=X.columns,
                index=X.index
            )
            
            return X_transformed_df, remover
        except Exception as e:
            print(f"Error in correlation remover: {e}")
            return X, None
    
    def apply_reweighting(
        self,
        y: np.ndarray,
        sensitive_features: pd.DataFrame
    ) -> np.ndarray:
        """
        Calculate sample weights to balance group representation
        
        Args:
            y: Target labels
            sensitive_features: Sensitive attributes
        
        Returns:
            Sample weights array
        """
        # Calculate weights to balance groups
        weights = np.ones(len(y))
        
        for col in sensitive_features.columns:
            groups = sensitive_features[col]
            for group in groups.unique():
                mask = (groups == group)
                group_size = mask.sum()
                # Weight inversely proportional to group size
                weights[mask] *= len(y) / (group_size * len(groups.unique()))
        
        # Normalize weights
        weights = weights / weights.sum() * len(y)
        
        return weights
    
    # ==================== IN-PROCESSING ====================
    
    def apply_exponentiated_gradient(
        self,
        X_train: pd.DataFrame,
        y_train: np.ndarray,
        sensitive_features_train: pd.DataFrame,
        constraint: str = "demographic_parity",
        base_estimator: Optional[BaseEstimator] = None
    ) -> Tuple[Any, Dict[str, Any]]:
        """
        Train model with Exponentiated Gradient fairness constraints
        
        Args:
            X_train: Training features
            y_train: Training labels
            sensitive_features_train: Sensitive attributes for training
            constraint: 'demographic_parity' or 'equalized_odds'
            base_estimator: Base classifier (default: LogisticRegression)
        
        Returns:
            Trained mitigated model, training info
        """
        if not FAIRLEARN_AVAILABLE:
            # Fallback to regular model
            model = LogisticRegression(max_iter=1000)
            model.fit(X_train, y_train)
            return model, {"method": "fallback", "fairness_constraint": None}
        
        # Select constraint
        if constraint == "demographic_parity":
            fairness_constraint = DemographicParity()
        elif constraint == "equalized_odds":
            fairness_constraint = EqualizedOdds()
        elif constraint == "true_positive_parity":
            fairness_constraint = TruePositiveRateParity()
        elif constraint == "false_positive_parity":
            fairness_constraint = FalsePositiveRateParity()
        else:
            fairness_constraint = DemographicParity()
        
        # Base estimator
        if base_estimator is None:
            base_estimator = LogisticRegression(solver='liblinear', max_iter=1000)
        
        # Train with Exponentiated Gradient
        try:
            mitigator = ExponentiatedGradient(
                estimator=base_estimator,
                constraints=fairness_constraint,
                eps=0.01,
                max_iter=50
            )
            
            mitigator.fit(X_train, y_train, sensitive_features=sensitive_features_train)
            
            return mitigator, {
                "method": "exponentiated_gradient",
                "constraint": constraint,
                "n_oracle_calls": mitigator.n_oracle_calls_,
                "best_gap": mitigator.best_gap_
            }
        except Exception as e:
            print(f"Error in Exponentiated Gradient: {e}")
            # Fallback
            model = base_estimator
            model.fit(X_train, y_train)
            return model, {"method": "fallback_error", "error": str(e)}
    
    def apply_grid_search(
        self,
        X_train: pd.DataFrame,
        y_train: np.ndarray,
        sensitive_features_train: pd.DataFrame,
        constraint: str = "demographic_parity",
        grid_size: int = 10
    ) -> Tuple[Any, Dict[str, Any]]:
        """
        Grid search over fairness-accuracy tradeoff
        
        Args:
            X_train: Training features
            y_train: Training labels
            sensitive_features_train: Sensitive attributes
            constraint: Fairness constraint
            grid_size: Number of grid points
        
        Returns:
            Best model from grid, search info
        """
        if not FAIRLEARN_AVAILABLE:
            model = LogisticRegression(max_iter=1000)
            model.fit(X_train, y_train)
            return model, {"method": "fallback"}
        
        # Select constraint
        if constraint == "demographic_parity":
            fairness_constraint = DemographicParity()
        elif constraint == "equalized_odds":
            fairness_constraint = EqualizedOdds()
        else:
            fairness_constraint = DemographicParity()
        
        try:
            grid_search = GridSearch(
                estimator=LogisticRegression(solver='liblinear', max_iter=1000),
                constraints=fairness_constraint,
                grid_size=grid_size
            )
            
            grid_search.fit(X_train, y_train, sensitive_features=sensitive_features_train)
            
            return grid_search, {
                "method": "grid_search",
                "constraint": constraint,
                "n_models": len(grid_search.predictors_),
                "grid_size": grid_size
            }
        except Exception as e:
            print(f"Error in Grid Search: {e}")
            model = LogisticRegression(max_iter=1000)
            model.fit(X_train, y_train)
            return model, {"method": "fallback_error", "error": str(e)}
    
    # ==================== POST-PROCESSING ====================
    
    def apply_threshold_optimizer(
        self,
        base_model: BaseEstimator,
        X_train: pd.DataFrame,
        y_train: np.ndarray,
        sensitive_features_train: pd.DataFrame,
        constraint: str = "demographic_parity"
    ) -> Tuple[Any, Dict[str, Any]]:
        """
        Optimize decision thresholds per group
        
        Args:
            base_model: Pre-trained model
            X_train: Training features
            y_train: Training labels
            sensitive_features_train: Sensitive attributes
            constraint: Fairness constraint
        
        Returns:
            Threshold optimizer, optimization info
        """
        if not FAIRLEARN_AVAILABLE:
            return base_model, {"method": "fallback"}
        
        try:
            threshold_optimizer = ThresholdOptimizer(
                estimator=base_model,
                constraints=constraint,
                predict_method='predict_proba'
            )
            
            threshold_optimizer.fit(
                X_train, y_train,
                sensitive_features=sensitive_features_train
            )
            
            return threshold_optimizer, {
                "method": "threshold_optimizer",
                "constraint": constraint,
                "n_groups": len(threshold_optimizer.interpolated_thresholder_.interpolation_dict)
            }
        except Exception as e:
            print(f"Error in Threshold Optimizer: {e}")
            return base_model, {"method": "fallback_error", "error": str(e)}
    
    # ==================== COMPARISON ====================
    
    def compare_mitigation_strategies(
        self,
        X_train: pd.DataFrame,
        y_train: np.ndarray,
        X_test: pd.DataFrame,
        y_test: np.ndarray,
        sensitive_features_train: pd.DataFrame,
        sensitive_features_test: pd.DataFrame,
        strategies: List[str] = None
    ) -> Dict[str, MitigationResult]:
        """
        Compare multiple mitigation strategies
        
        Args:
            X_train, y_train: Training data
            X_test, y_test: Test data
            sensitive_features_train, sensitive_features_test: Sensitive attributes
            strategies: List of strategy names to compare
        
        Returns:
            Dictionary of results for each strategy
        """
        if strategies is None:
            strategies = ["exponentiated_gradient", "threshold_optimizer"]
        
        results = {}
        
        # Baseline model (no mitigation)
        baseline_model = LogisticRegression(max_iter=1000)
        baseline_model.fit(X_train, y_train)
        
        # TODO: Calculate baseline metrics
        
        for strategy in strategies:
            # Apply strategy and compare
            # This would call the appropriate method and calculate metrics
            pass
        
        return results
    
    def get_strategy_recommendations(
        self,
        fairness_metrics: Dict[str, float],
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Recommend mitigation strategies based on metrics and context
        
        Args:
            fairness_metrics: Current fairness metrics
            context: Additional context (data size, use case, etc.)
        
        Returns:
            List of recommended strategies with rationale
        """
        recommendations = []
        
        # Check for high demographic parity violation
        dp_violations = [k for k, v in fairness_metrics.items() 
                        if 'demographic_parity' in k and abs(v) > 0.1]
        
        if dp_violations:
            recommendations.append({
                "strategy": "threshold_optimizer",
                "priority": "High",
                "rationale": "Quick fix for demographic parity violations",
                "expected_improvement": "20-40% reduction in disparity",
                "implementation_time": "< 1 day"
            })
            
            recommendations.append({
                "strategy": "exponentiated_gradient",
                "priority": "Medium",
                "rationale": "More robust long-term solution",
                "expected_improvement": "30-50% reduction in disparity",
                "implementation_time": "2-3 days"
            })
        
        # Check for feature correlation issues
        if context.get("high_feature_correlation", False):
            recommendations.append({
                "strategy": "correlation_remover",
                "priority": "High",
                "rationale": "Features correlated with sensitive attributes",
                "expected_improvement": "Reduces indirect discrimination",
                "implementation_time": "< 1 day"
            })
        
        return recommendations
