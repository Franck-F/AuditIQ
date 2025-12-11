"""
Fairness services package

Provides comprehensive fairness auditing capabilities:
- Metrics calculation (all Fairlearn metrics)
- AI-powered recommendations
- Mitigation strategies
- Visualization generation
"""

from .metrics import ComprehensiveFairnessCalculator, FairnessMetricsResult
from .ai_recommendations import AIRecommendationEngine, get_recommendation_engine
from .service import EnhancedFairnessService  # Main orchestrator

# Backward compatibility function for existing code
def calculate_fairness_metrics(y_true, y_pred, sensitive_features, sensitive_feature_names=None):
    """
    Legacy function for backward compatibility
    
    Use ComprehensiveFairnessCalculator for new code
    """
    import pandas as pd
    
    # Convert to DataFrame if needed
    if not isinstance(sensitive_features, pd.DataFrame):
        if sensitive_feature_names is None:
            sensitive_feature_names = [f"feature_{i}" for i in range(len(sensitive_features[0]))]
        sensitive_features = pd.DataFrame(sensitive_features, columns=sensitive_feature_names)
    
    # Use comprehensive calculator
    calculator = ComprehensiveFairnessCalculator(sensitive_features.columns.tolist())
    result = calculator.calculate_all_metrics(
        y_true=y_true,
        y_pred=y_pred,
        y_prob=None,
        sensitive_attrs=sensitive_features
    )
    
    # Return in legacy format
    return {
        'overall_metrics': result.overall_metrics,
        'fairness_scores': result.fairness_scores,
        'group_metrics': result.group_metrics
    }

__all__ = [
    'ComprehensiveFairnessCalculator',
    'FairnessMetricsResult',
    'AIRecommendationEngine',
    'get_recommendation_engine',
    'EnhancedFairnessService',
    'calculate_fairness_metrics',  # Legacy support
]
