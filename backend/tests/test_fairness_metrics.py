"""
Unit Tests for Fairness Metrics Calculator

Tests comprehensive fairness metrics calculation
"""

import pytest
import numpy as np
import pandas as pd
from services.fairness.metrics import ComprehensiveFairnessCalculator, FairnessMetricsResult


class TestComprehensiveFairnessCalculator:
    """Test suite for fairness metrics calculator"""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing"""
        np.random.seed(42)
        n_samples = 200
        
        # Create synthetic data
        y_true = np.random.randint(0, 2, n_samples)
        y_pred = np.random.randint(0, 2, n_samples)
        y_prob = np.random.random(n_samples)
        
        # Create sensitive attributes
        sensitive_attrs = pd.DataFrame({
            'gender': np.random.choice(['M', 'F'], n_samples),
            'race': np.random.choice(['A', 'B', 'C'], n_samples),
            'age_group': np.random.choice(['young', 'old'], n_samples)
        })
        
        return y_true, y_pred, y_prob, sensitive_attrs
    
    def test_calculator_initialization(self):
        """Test calculator initialization"""
        sensitive_features = ['gender', 'race']
        calculator = ComprehensiveFairnessCalculator(sensitive_features)
        
        assert calculator.sensitive_features == sensitive_features
        assert calculator.metric_frame is None
    
    def test_calculate_all_metrics(self, sample_data):
        """Test complete metrics calculation"""
        y_true, y_pred, y_prob, sensitive_attrs = sample_data
        
        calculator = ComprehensiveFairnessCalculator(['gender', 'race'])
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=y_prob,
            sensitive_attrs=sensitive_attrs
        )
        
        # Check result type
        assert isinstance(result, FairnessMetricsResult)
        
        # Check overall metrics
        assert 'accuracy' in result.overall_metrics
        assert 'precision' in result.overall_metrics
        assert 'recall' in result.overall_metrics
        assert 0 <= result.overall_metrics['accuracy'] <= 1
        
        # Check fairness scores
        assert len(result.fairness_scores) > 0
        assert any('demographic_parity' in key for key in result.fairness_scores.keys())
        
        # Check risk assessment
        assert 'risk_level' in result.risk_assessment
        assert result.risk_assessment['risk_level'] in ['Low', 'Medium', 'High', 'Critical']
    
    def test_overall_metrics_calculation(self, sample_data):
        """Test overall performance metrics"""
        y_true, y_pred, y_prob, sensitive_attrs = sample_data
        
        calculator = ComprehensiveFairnessCalculator(['gender'])
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=None,  # Test without probabilities
            sensitive_attrs=sensitive_attrs
        )
        
        # Should still have basic metrics
        assert 'accuracy' in result.overall_metrics
        assert 'true_positives' in result.overall_metrics
        assert 'false_positives' in result.overall_metrics
        
        # Check confusion matrix values
        total = (result.overall_metrics['true_positives'] + 
                result.overall_metrics['false_positives'] +
                result.overall_metrics['true_negatives'] +
                result.overall_metrics['false_negatives'])
        assert total == len(y_true)
    
    def test_group_metrics_calculation(self, sample_data):
        """Test per-group metrics"""
        y_true, y_pred, y_prob, sensitive_attrs = sample_data
        
        calculator = ComprehensiveFairnessCalculator(['gender'])
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=y_prob,
            sensitive_attrs=sensitive_attrs
        )
        
        # Check group metrics exist
        assert 'gender' in result.group_metrics
        
        # Check metrics for each gender group
        for group_name, metrics in result.group_metrics['gender'].items():
            if isinstance(metrics, dict):
                assert 'size' in metrics
                assert 'accuracy' in metrics
                assert 'precision' in metrics
                assert metrics['size'] > 0
    
    def test_risk_assessment(self, sample_data):
        """Test risk assessment logic"""
        y_true, y_pred, y_prob, sensitive_attrs = sample_data
        
        calculator = ComprehensiveFairnessCalculator(['gender', 'race'])
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=y_prob,
            sensitive_attrs=sensitive_attrs
        )
        
        risk = result.risk_assessment
        
        # Check required fields
        assert 'risk_level' in risk
        assert 'risk_score' in risk
        assert 'risk_factors' in risk
        assert 'total_violations' in risk
        assert 'requires_immediate_action' in risk
        
        # Check risk score range
        assert 1 <= risk['risk_score'] <= 4
        
        # Check risk factors is a list
        assert isinstance(risk['risk_factors'], list)
    
    def test_recommendations_generation(self, sample_data):
        """Test recommendations generation"""
        y_true, y_pred, y_prob, sensitive_attrs = sample_data
        
        calculator = ComprehensiveFairnessCalculator(['gender'])
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=y_prob,
            sensitive_attrs=sensitive_attrs
        )
        
        # Check recommendations exist
        assert isinstance(result.recommendations, list)
        assert len(result.recommendations) > 0
        
        # Check recommendations are strings
        for rec in result.recommendations:
            assert isinstance(rec, str)
            assert len(rec) > 0
    
    def test_empty_sensitive_attributes(self):
        """Test with no sensitive attributes"""
        calculator = ComprehensiveFairnessCalculator([])
        
        y_true = np.array([0, 1, 0, 1])
        y_pred = np.array([0, 1, 1, 1])
        sensitive_attrs = pd.DataFrame()
        
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=None,
            sensitive_attrs=sensitive_attrs
        )
        
        # Should still calculate overall metrics
        assert 'accuracy' in result.overall_metrics
        
        # But no group-specific metrics
        assert len(result.group_metrics) == 0
    
    def test_single_class_predictions(self):
        """Test with all predictions being the same class"""
        calculator = ComprehensiveFairnessCalculator(['gender'])
        
        y_true = np.array([0, 1, 0, 1, 0, 1])
        y_pred = np.array([1, 1, 1, 1, 1, 1])  # All predict class 1
        sensitive_attrs = pd.DataFrame({
            'gender': ['M', 'F', 'M', 'F', 'M', 'F']
        })
        
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=None,
            sensitive_attrs=sensitive_attrs
        )
        
        # Should handle gracefully
        assert result.overall_metrics['accuracy'] == 0.5
        assert result.overall_metrics['true_negatives'] == 0
    
    def test_perfect_predictions(self):
        """Test with perfect predictions"""
        calculator = ComprehensiveFairnessCalculator(['gender'])
        
        y_true = np.array([0, 1, 0, 1, 0, 1])
        y_pred = np.array([0, 1, 0, 1, 0, 1])  # Perfect predictions
        sensitive_attrs = pd.DataFrame({
            'gender': ['M', 'F', 'M', 'F', 'M', 'F']
        })
        
        result = calculator.calculate_all_metrics(
            y_true=y_true,
            y_pred=y_pred,
            y_prob=None,
            sensitive_attrs=sensitive_attrs
        )
        
        # Should have perfect accuracy
        assert result.overall_metrics['accuracy'] == 1.0
        assert result.risk_assessment['risk_level'] == 'Low'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
