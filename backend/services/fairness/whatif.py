"""
What-If Tool Integration for Fairness Analysis

Provides:
- Counterfactual generation
- Feature importance analysis (SHAP)
- Interactive exploration
- Prediction explanation
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("⚠️ SHAP not available. Install with: pip install shap")

from sklearn.base import BaseEstimator


@dataclass
class CounterfactualResult:
    """Result from counterfactual generation"""
    original_instance: Dict[str, Any]
    counterfactual_instance: Dict[str, Any]
    original_prediction: float
    counterfactual_prediction: float
    features_changed: List[str]
    minimal_changes: bool
    distance: float


@dataclass
class FeatureImportanceResult:
    """Result from feature importance analysis"""
    feature_importances: Dict[str, float]
    shap_values: Optional[np.ndarray]
    base_value: float
    explanation_type: str  # 'shap', 'permutation', 'coefficients'


class WhatIfAnalyzer:
    """
    What-If analysis for fairness exploration
    
    Enables:
    - Counterfactual generation
    - Feature importance (SHAP)
    - Interactive prediction exploration
    """
    
    def __init__(self, model: BaseEstimator, feature_names: List[str]):
        """
        Initialize What-If analyzer
        
        Args:
            model: Trained model
            feature_names: List of feature names
        """
        self.model = model
        self.feature_names = feature_names
        self.shap_explainer = None
        
        if SHAP_AVAILABLE:
            try:
                # Initialize SHAP explainer
                self.shap_explainer = shap.Explainer(model)
            except Exception as e:
                print(f"Could not initialize SHAP explainer: {e}")
    
    # ==================== COUNTERFACTUAL GENERATION ====================
    
    def generate_counterfactual(
        self,
        instance: np.ndarray,
        desired_outcome: int,
        sensitive_features: Optional[List[str]] = None,
        max_changes: int = 3,
        max_iterations: int = 100
    ) -> Optional[CounterfactualResult]:
        """
        Generate counterfactual explanation
        
        Finds minimal changes to features that would flip the prediction.
        
        Args:
            instance: Original instance (feature vector)
            desired_outcome: Desired prediction (0 or 1)
            sensitive_features: Features that should not be changed
            max_changes: Maximum number of features to change
            max_iterations: Maximum optimization iterations
        
        Returns:
            CounterfactualResult or None if not found
        """
        # Get original prediction
        original_pred = self.model.predict(instance.reshape(1, -1))[0]
        
        if original_pred == desired_outcome:
            # Already has desired outcome
            return None
        
        # Get feature indices that can be changed
        changeable_indices = list(range(len(instance)))
        if sensitive_features:
            sensitive_indices = [
                i for i, name in enumerate(self.feature_names)
                if name in sensitive_features
            ]
            changeable_indices = [
                i for i in changeable_indices
                if i not in sensitive_indices
            ]
        
        # Try to find counterfactual with minimal changes
        best_counterfactual = None
        best_distance = float('inf')
        
        # Simple greedy search
        for num_changes in range(1, min(max_changes + 1, len(changeable_indices) + 1)):
            # Try different combinations of features to change
            from itertools import combinations
            
            for feature_combo in combinations(changeable_indices, num_changes):
                # Try small perturbations
                for _ in range(max_iterations // (num_changes * 10)):
                    candidate = instance.copy()
                    
                    for idx in feature_combo:
                        # Random perturbation
                        perturbation = np.random.normal(0, 0.5)
                        candidate[idx] += perturbation
                    
                    # Check prediction
                    pred = self.model.predict(candidate.reshape(1, -1))[0]
                    
                    if pred == desired_outcome:
                        # Found counterfactual
                        distance = np.linalg.norm(instance - candidate)
                        
                        if distance < best_distance:
                            best_distance = distance
                            best_counterfactual = candidate
                            
                            # If minimal changes, return immediately
                            if num_changes == 1:
                                break
            
            if best_counterfactual is not None and num_changes == 1:
                break
        
        if best_counterfactual is None:
            return None
        
        # Identify changed features
        features_changed = [
            self.feature_names[i]
            for i in range(len(instance))
            if abs(instance[i] - best_counterfactual[i]) > 1e-6
        ]
        
        # Get predictions
        original_pred_prob = self._get_prediction_probability(instance)
        cf_pred_prob = self._get_prediction_probability(best_counterfactual)
        
        return CounterfactualResult(
            original_instance={
                name: float(val)
                for name, val in zip(self.feature_names, instance)
            },
            counterfactual_instance={
                name: float(val)
                for name, val in zip(self.feature_names, best_counterfactual)
            },
            original_prediction=float(original_pred_prob),
            counterfactual_prediction=float(cf_pred_prob),
            features_changed=features_changed,
            minimal_changes=len(features_changed) <= 2,
            distance=float(best_distance)
        )
    
    def _get_prediction_probability(self, instance: np.ndarray) -> float:
        """Get prediction probability for instance"""
        try:
            if hasattr(self.model, 'predict_proba'):
                return self.model.predict_proba(instance.reshape(1, -1))[0][1]
            else:
                return float(self.model.predict(instance.reshape(1, -1))[0])
        except Exception:
            return float(self.model.predict(instance.reshape(1, -1))[0])
    
    # ==================== FEATURE IMPORTANCE ====================
    
    def calculate_feature_importance(
        self,
        X: np.ndarray,
        method: str = 'shap'
    ) -> FeatureImportanceResult:
        """
        Calculate feature importance
        
        Args:
            X: Feature matrix
            method: 'shap', 'permutation', or 'coefficients'
        
        Returns:
            FeatureImportanceResult
        """
        if method == 'shap' and self.shap_explainer:
            return self._calculate_shap_importance(X)
        elif method == 'coefficients' and hasattr(self.model, 'coef_'):
            return self._calculate_coefficient_importance()
        else:
            return self._calculate_permutation_importance(X)
    
    def _calculate_shap_importance(self, X: np.ndarray) -> FeatureImportanceResult:
        """Calculate SHAP-based feature importance"""
        
        if not SHAP_AVAILABLE or not self.shap_explainer:
            return self._fallback_importance()
        
        try:
            # Calculate SHAP values
            shap_values = self.shap_explainer(X)
            
            # Get mean absolute SHAP values
            if hasattr(shap_values, 'values'):
                shap_vals = shap_values.values
            else:
                shap_vals = shap_values
            
            # Handle multi-output
            if len(shap_vals.shape) > 2:
                shap_vals = shap_vals[:, :, 1]  # Take positive class
            
            mean_abs_shap = np.abs(shap_vals).mean(axis=0)
            
            feature_importances = {
                name: float(importance)
                for name, importance in zip(self.feature_names, mean_abs_shap)
            }
            
            # Sort by importance
            feature_importances = dict(
                sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)
            )
            
            return FeatureImportanceResult(
                feature_importances=feature_importances,
                shap_values=shap_vals,
                base_value=float(shap_values.base_values[0]) if hasattr(shap_values, 'base_values') else 0.0,
                explanation_type='shap'
            )
        except Exception as e:
            print(f"Error calculating SHAP values: {e}")
            return self._fallback_importance()
    
    def _calculate_coefficient_importance(self) -> FeatureImportanceResult:
        """Calculate importance from model coefficients (linear models)"""
        
        coefficients = self.model.coef_[0] if len(self.model.coef_.shape) > 1 else self.model.coef_
        
        feature_importances = {
            name: float(abs(coef))
            for name, coef in zip(self.feature_names, coefficients)
        }
        
        # Sort by importance
        feature_importances = dict(
            sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)
        )
        
        return FeatureImportanceResult(
            feature_importances=feature_importances,
            shap_values=None,
            base_value=float(self.model.intercept_[0]) if hasattr(self.model, 'intercept_') else 0.0,
            explanation_type='coefficients'
        )
    
    def _calculate_permutation_importance(self, X: np.ndarray) -> FeatureImportanceResult:
        """Calculate permutation-based feature importance"""
        
        from sklearn.inspection import permutation_importance
        
        try:
            # Need y for permutation importance
            y = self.model.predict(X)
            
            perm_importance = permutation_importance(
                self.model, X, y, n_repeats=10, random_state=42
            )
            
            feature_importances = {
                name: float(importance)
                for name, importance in zip(self.feature_names, perm_importance.importances_mean)
            }
            
            # Sort by importance
            feature_importances = dict(
                sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)
            )
            
            return FeatureImportanceResult(
                feature_importances=feature_importances,
                shap_values=None,
                base_value=0.0,
                explanation_type='permutation'
            )
        except Exception as e:
            print(f"Error calculating permutation importance: {e}")
            return self._fallback_importance()
    
    def _fallback_importance(self) -> FeatureImportanceResult:
        """Fallback when importance calculation fails"""
        
        # Equal importance
        feature_importances = {
            name: 1.0 / len(self.feature_names)
            for name in self.feature_names
        }
        
        return FeatureImportanceResult(
            feature_importances=feature_importances,
            shap_values=None,
            base_value=0.0,
            explanation_type='uniform'
        )
    
    # ==================== INTERACTIVE EXPLORATION ====================
    
    def explore_prediction(
        self,
        instance: np.ndarray,
        feature_ranges: Optional[Dict[str, Tuple[float, float]]] = None
    ) -> Dict[str, Any]:
        """
        Explore how changing features affects prediction
        
        Args:
            instance: Instance to explore
            feature_ranges: Optional ranges for each feature
        
        Returns:
            Exploration results with sensitivity analysis
        """
        original_pred = self._get_prediction_probability(instance)
        
        sensitivity = {}
        
        for i, feature_name in enumerate(self.feature_names):
            # Get feature range
            if feature_ranges and feature_name in feature_ranges:
                min_val, max_val = feature_ranges[feature_name]
            else:
                # Use ±20% of current value
                current_val = instance[i]
                min_val = current_val * 0.8
                max_val = current_val * 1.2
            
            # Test different values
            test_values = np.linspace(min_val, max_val, 10)
            predictions = []
            
            for test_val in test_values:
                test_instance = instance.copy()
                test_instance[i] = test_val
                pred = self._get_prediction_probability(test_instance)
                predictions.append(float(pred))
            
            # Calculate sensitivity (max change in prediction)
            max_change = max(predictions) - min(predictions)
            
            sensitivity[feature_name] = {
                'test_values': test_values.tolist(),
                'predictions': predictions,
                'max_change': float(max_change),
                'current_value': float(instance[i]),
                'current_prediction': float(original_pred)
            }
        
        # Sort by sensitivity
        sensitivity = dict(
            sorted(sensitivity.items(), key=lambda x: x[1]['max_change'], reverse=True)
        )
        
        return {
            'original_prediction': float(original_pred),
            'feature_sensitivity': sensitivity,
            'most_sensitive_features': list(sensitivity.keys())[:5]
        }
