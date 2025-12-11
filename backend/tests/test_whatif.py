"""
Unit Tests for What-If Analyzer

Tests counterfactual generation and feature importance
"""

import pytest
import numpy as np
from sklearn.linear_model import LogisticRegression
from services.fairness.whatif import WhatIfAnalyzer, CounterfactualResult, FeatureImportanceResult


class TestWhatIfAnalyzer:
    """Test suite for What-If analyzer"""
    
    @pytest.fixture
    def sample_model_and_data(self):
        """Create sample model and data"""
        np.random.seed(42)
        
        # Create simple dataset
        X = np.random.randn(100, 5)
        y = (X[:, 0] + X[:, 1] > 0).astype(int)
        
        # Train simple model
        model = LogisticRegression(random_state=42)
        model.fit(X, y)
        
        feature_names = [f'feature_{i}' for i in range(5)]
        
        return model, X, y, feature_names
    
    def test_analyzer_initialization(self, sample_model_and_data):
        """Test analyzer initialization"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        assert analyzer.model == model
        assert analyzer.feature_names == feature_names
    
    def test_counterfactual_generation(self, sample_model_and_data):
        """Test counterfactual generation"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        # Get an instance with prediction 0
        instance_idx = np.where(model.predict(X) == 0)[0][0]
        instance = X[instance_idx]
        
        # Generate counterfactual for outcome 1
        cf_result = analyzer.generate_counterfactual(
            instance=instance,
            desired_outcome=1,
            max_changes=3,
            max_iterations=50
        )
        
        if cf_result is not None:
            # Check result type
            assert isinstance(cf_result, CounterfactualResult)
            
            # Check predictions changed
            assert cf_result.original_prediction != cf_result.counterfactual_prediction
            
            # Check features changed
            assert len(cf_result.features_changed) > 0
            assert len(cf_result.features_changed) <= 3
            
            # Check distance is positive
            assert cf_result.distance > 0
    
    def test_counterfactual_with_sensitive_features(self, sample_model_and_data):
        """Test counterfactual respects sensitive features"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        instance = X[0]
        sensitive_features = ['feature_0']  # Should not change this feature
        
        cf_result = analyzer.generate_counterfactual(
            instance=instance,
            desired_outcome=1,
            sensitive_features=sensitive_features,
            max_changes=2
        )
        
        if cf_result is not None:
            # Check sensitive feature not in changed features
            assert 'feature_0' not in cf_result.features_changed
    
    def test_feature_importance_shap(self, sample_model_and_data):
        """Test SHAP feature importance"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        # Calculate feature importance
        importance_result = analyzer.calculate_feature_importance(
            X=X[:20],  # Use small sample for speed
            method='shap'
        )
        
        # Check result type
        assert isinstance(importance_result, FeatureImportanceResult)
        
        # Check feature importances
        assert len(importance_result.feature_importances) == len(feature_names)
        
        # Check all features have importance scores
        for feature in feature_names:
            assert feature in importance_result.feature_importances
            assert importance_result.feature_importances[feature] >= 0
    
    def test_feature_importance_coefficients(self, sample_model_and_data):
        """Test coefficient-based feature importance"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        # Calculate using coefficients
        importance_result = analyzer.calculate_feature_importance(
            X=X,
            method='coefficients'
        )
        
        # Check result
        assert importance_result.explanation_type == 'coefficients'
        assert len(importance_result.feature_importances) == len(feature_names)
        
        # Check sorted by importance
        importances = list(importance_result.feature_importances.values())
        assert importances == sorted(importances, reverse=True)
    
    def test_prediction_exploration(self, sample_model_and_data):
        """Test prediction exploration"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        instance = X[0]
        
        # Explore prediction
        exploration = analyzer.explore_prediction(instance)
        
        # Check result structure
        assert 'original_prediction' in exploration
        assert 'feature_sensitivity' in exploration
        assert 'most_sensitive_features' in exploration
        
        # Check all features analyzed
        assert len(exploration['feature_sensitivity']) == len(feature_names)
        
        # Check sensitivity values
        for feature, sensitivity in exploration['feature_sensitivity'].items():
            assert 'test_values' in sensitivity
            assert 'predictions' in sensitivity
            assert 'max_change' in sensitivity
            assert 'current_value' in sensitivity
            
            # Check max_change is non-negative
            assert sensitivity['max_change'] >= 0
    
    def test_exploration_with_custom_ranges(self, sample_model_and_data):
        """Test exploration with custom feature ranges"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        instance = X[0]
        
        # Define custom ranges
        feature_ranges = {
            'feature_0': (-2.0, 2.0),
            'feature_1': (-1.0, 1.0)
        }
        
        exploration = analyzer.explore_prediction(
            instance=instance,
            feature_ranges=feature_ranges
        )
        
        # Check custom ranges were used
        for feature, (min_val, max_val) in feature_ranges.items():
            sensitivity = exploration['feature_sensitivity'][feature]
            test_values = sensitivity['test_values']
            
            assert min(test_values) >= min_val - 0.01  # Small tolerance
            assert max(test_values) <= max_val + 0.01
    
    def test_counterfactual_already_desired_outcome(self, sample_model_and_data):
        """Test counterfactual when instance already has desired outcome"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        # Get instance with prediction 1
        instance_idx = np.where(model.predict(X) == 1)[0][0]
        instance = X[instance_idx]
        
        # Try to generate counterfactual for outcome 1 (already has it)
        cf_result = analyzer.generate_counterfactual(
            instance=instance,
            desired_outcome=1
        )
        
        # Should return None
        assert cf_result is None
    
    def test_minimal_changes_flag(self, sample_model_and_data):
        """Test minimal_changes flag in counterfactual"""
        model, X, y, feature_names = sample_model_and_data
        
        analyzer = WhatIfAnalyzer(model, feature_names)
        
        instance = X[0]
        
        cf_result = analyzer.generate_counterfactual(
            instance=instance,
            desired_outcome=1 - model.predict(instance.reshape(1, -1))[0],
            max_changes=1  # Force minimal changes
        )
        
        if cf_result is not None:
            # With max_changes=1, should be minimal
            assert cf_result.minimal_changes == (len(cf_result.features_changed) <= 2)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
