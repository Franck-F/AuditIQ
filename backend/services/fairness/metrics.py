"""
Comprehensive Fairness Metrics Calculator using Fairlearn

Implements all major fairness metrics with MetricFrame for disaggregated analysis.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import warnings

# Fairlearn imports
try:
    from fairlearn.metrics import (
        # Parity metrics
        demographic_parity_difference,
        demographic_parity_ratio,
        
        # Equalized odds metrics
        equalized_odds_difference,
        equalized_odds_ratio,
        
        # Error rate metrics
        false_positive_rate,
        false_negative_rate,
        true_positive_rate,
        true_negative_rate,
        
        # Selection metrics
        selection_rate,
        mean_prediction,
        
        # Utility
        count,
        MetricFrame
    )
    FAIRLEARN_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Fairlearn import error: {e}")
    FAIRLEARN_AVAILABLE = False

# Scikit-learn metrics
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


@dataclass
class FairnessMetricsResult:
    """Container for fairness metrics results"""
    overall_metrics: Dict[str, float]
    disaggregated_metrics: Dict[str, Dict[str, float]]
    group_metrics: Dict[str, Dict[str, Any]]
    fairness_scores: Dict[str, float]
    risk_assessment: Dict[str, Any]
    recommendations: List[str]


class ComprehensiveFairnessCalculator:
    """
    Calculate comprehensive fairness metrics using Fairlearn
    """
    
    def __init__(self, sensitive_features: List[str]):
        """
        Initialize calculator
        
        Args:
            sensitive_features: List of sensitive attribute column names
        """
        self.sensitive_features = sensitive_features
        self.metric_frame = None
        
    def calculate_all_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray],
        sensitive_attrs: pd.DataFrame
    ) -> FairnessMetricsResult:
        """
        Calculate all fairness metrics
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_prob: Prediction probabilities (optional)
            sensitive_attrs: DataFrame with sensitive attributes
        
        Returns:
            FairnessMetricsResult with all calculated metrics
        """
        if not FAIRLEARN_AVAILABLE:
            return self._mock_results()
        
        # 1. Overall performance metrics
        overall = self._calculate_overall_metrics(y_true, y_pred, y_prob)
        
        # 2. Disaggregated metrics using MetricFrame
        disaggregated = self._calculate_disaggregated_metrics(
            y_true, y_pred, y_prob, sensitive_attrs
        )
        
        # 3. Group-specific metrics
        group_metrics = self._calculate_group_metrics(
            y_true, y_pred, sensitive_attrs
        )
        
        # 4. Fairness-specific scores
        fairness_scores = self._calculate_fairness_scores(
            y_true, y_pred, sensitive_attrs
        )
        
        # 5. Risk assessment
        risk = self._assess_risk(fairness_scores, disaggregated)
        
        # 6. Generate recommendations
        recommendations = self._generate_recommendations(risk, fairness_scores)
        
        return FairnessMetricsResult(
            overall_metrics=overall,
            disaggregated_metrics=disaggregated,
            group_metrics=group_metrics,
            fairness_scores=fairness_scores,
            risk_assessment=risk,
            recommendations=recommendations
        )
    
    def _calculate_overall_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray]
    ) -> Dict[str, float]:
        """Calculate overall performance metrics"""
        
        metrics = {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision": precision_score(y_true, y_pred, average='binary', zero_division=0),
            "recall": recall_score(y_true, y_pred, average='binary', zero_division=0),
            "f1_score": f1_score(y_true, y_pred, average='binary', zero_division=0),
        }
        
        # Add AUC if probabilities available
        if y_prob is not None:
            try:
                metrics["roc_auc"] = roc_auc_score(y_true, y_prob)
            except ValueError:
                metrics["roc_auc"] = None
        
        # Confusion matrix components
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        metrics.update({
            "true_positives": int(tp),
            "false_positives": int(fp),
            "true_negatives": int(tn),
            "false_negatives": int(fn),
            "total_samples": len(y_true)
        })
        
        return metrics
    
    def _calculate_disaggregated_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray],
        sensitive_attrs: pd.DataFrame
    ) -> Dict[str, Dict[str, float]]:
        """Calculate metrics disaggregated by sensitive attributes using MetricFrame"""
        
        # Define metrics to calculate
        metrics_dict = {
            'accuracy': accuracy_score,
            'precision': lambda y_t, y_p: precision_score(y_t, y_p, zero_division=0),
            'recall': lambda y_t, y_p: recall_score(y_t, y_p, zero_division=0),
            'selection_rate': selection_rate,
            'false_positive_rate': false_positive_rate,
            'false_negative_rate': false_negative_rate,
            'true_positive_rate': true_positive_rate,
        }
        
        results = {}
        
        # Calculate for each sensitive attribute
        for attr in self.sensitive_features:
            if attr not in sensitive_attrs.columns:
                continue
            
            try:
                # Create MetricFrame
                mf = MetricFrame(
                    metrics=metrics_dict,
                    y_true=y_true,
                    y_pred=y_pred,
                    sensitive_features=sensitive_attrs[attr]
                )
                
                # Store results
                results[attr] = {
                    'by_group': mf.by_group.to_dict(),
                    'overall': mf.overall.to_dict(),
                    'difference': mf.difference().to_dict(),
                    'ratio': mf.ratio().to_dict(),
                    'group_min': mf.group_min().to_dict(),
                    'group_max': mf.group_max().to_dict(),
                }
                
            except Exception as e:
                print(f"Error calculating metrics for {attr}: {e}")
                results[attr] = {"error": str(e)}
        
        return results
    
    def _calculate_group_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        sensitive_attrs: pd.DataFrame
    ) -> Dict[str, Dict[str, Any]]:
        """Calculate detailed metrics for each group"""
        
        group_metrics = {}
        
        for attr in self.sensitive_features:
            if attr not in sensitive_attrs.columns:
                continue
            
            unique_groups = sensitive_attrs[attr].unique()
            group_metrics[attr] = {}
            
            for group in unique_groups:
                mask = sensitive_attrs[attr] == group
                y_true_group = y_true[mask]
                y_pred_group = y_pred[mask]
                
                if len(y_true_group) == 0:
                    continue
                
                # Calculate confusion matrix
                try:
                    tn, fp, fn, tp = confusion_matrix(y_true_group, y_pred_group).ravel()
                    
                    group_metrics[attr][str(group)] = {
                        "size": int(mask.sum()),
                        "percentage": float(mask.sum() / len(y_true) * 100),
                        "true_positives": int(tp),
                        "false_positives": int(fp),
                        "true_negatives": int(tn),
                        "false_negatives": int(fn),
                        "accuracy": float(accuracy_score(y_true_group, y_pred_group)),
                        "precision": float(precision_score(y_true_group, y_pred_group, zero_division=0)),
                        "recall": float(recall_score(y_true_group, y_pred_group, zero_division=0)),
                        "selection_rate": float(y_pred_group.mean()),
                    }
                except ValueError as e:
                    group_metrics[attr][str(group)] = {"error": str(e)}
        
        return group_metrics
    
    def _calculate_fairness_scores(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        sensitive_attrs: pd.DataFrame
    ) -> Dict[str, float]:
        """Calculate fairness-specific scores"""
        
        fairness_scores = {}
        
        for attr in self.sensitive_features:
            if attr not in sensitive_attrs.columns:
                continue
            
            try:
                # Demographic Parity
                dp_diff = demographic_parity_difference(
                    y_true, y_pred, sensitive_features=sensitive_attrs[attr]
                )
                dp_ratio = demographic_parity_ratio(
                    y_true, y_pred, sensitive_features=sensitive_attrs[attr]
                )
                
                # Equalized Odds
                eo_diff = equalized_odds_difference(
                    y_true, y_pred, sensitive_features=sensitive_attrs[attr]
                )
                eo_ratio = equalized_odds_ratio(
                    y_true, y_pred, sensitive_features=sensitive_attrs[attr]
                )
                
                # Equal Opportunity (manually calculated as TPR difference/ratio)
                # Equal opportunity = True Positive Rate parity
                tpr_frame = MetricFrame(
                    metrics=true_positive_rate,
                    y_true=y_true,
                    y_pred=y_pred,
                    sensitive_features=sensitive_attrs[attr]
                )
                eop_diff = tpr_frame.difference()
                eop_ratio = tpr_frame.ratio()
                
                fairness_scores[f"{attr}_demographic_parity_diff"] = float(dp_diff)
                fairness_scores[f"{attr}_demographic_parity_ratio"] = float(dp_ratio)
                fairness_scores[f"{attr}_equalized_odds_diff"] = float(eo_diff)
                fairness_scores[f"{attr}_equalized_odds_ratio"] = float(eo_ratio)
                fairness_scores[f"{attr}_equal_opportunity_diff"] = float(eop_diff)
                fairness_scores[f"{attr}_equal_opportunity_ratio"] = float(eop_ratio)
                
            except Exception as e:
                print(f"Error calculating fairness scores for {attr}: {e}")
                fairness_scores[f"{attr}_error"] = str(e)
        
        return fairness_scores
    
    def _assess_risk(
        self,
        fairness_scores: Dict[str, float],
        disaggregated: Dict[str, Dict[str, float]]
    ) -> Dict[str, Any]:
        """Assess overall fairness risk level"""
        
        risk_factors = []
        severity_scores = []
        
        # Check demographic parity violations
        for key, value in fairness_scores.items():
            if 'demographic_parity_diff' in key:
                if abs(value) > 0.2:
                    risk_factors.append(f"High demographic parity violation: {value:.3f}")
                    severity_scores.append(3)  # Critical
                elif abs(value) > 0.1:
                    risk_factors.append(f"Moderate demographic parity violation: {value:.3f}")
                    severity_scores.append(2)  # High
            
            if 'equalized_odds_diff' in key:
                if abs(value) > 0.15:
                    risk_factors.append(f"High equalized odds violation: {value:.3f}")
                    severity_scores.append(3)
                elif abs(value) > 0.08:
                    risk_factors.append(f"Moderate equalized odds violation: {value:.3f}")
                    severity_scores.append(2)
        
        # Determine overall risk level
        if not severity_scores:
            risk_level = "Low"
            risk_score = 1
        else:
            avg_severity = np.mean(severity_scores)
            if avg_severity >= 2.5:
                risk_level = "Critical"
                risk_score = 4
            elif avg_severity >= 2.0:
                risk_level = "High"
                risk_score = 3
            elif avg_severity >= 1.5:
                risk_level = "Medium"
                risk_score = 2
            else:
                risk_level = "Low"
                risk_score = 1
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "total_violations": len(risk_factors),
            "requires_immediate_action": risk_score >= 3
        }
    
    def _generate_recommendations(
        self,
        risk: Dict[str, Any],
        fairness_scores: Dict[str, float]
    ) -> List[str]:
        """Generate basic recommendations (enhanced by AI engine)"""
        
        recommendations = []
        
        if risk["risk_level"] == "Critical":
            recommendations.append("⚠️ URGENT: Critical fairness violations detected. Immediate mitigation required.")
            recommendations.append("Consider halting model deployment until bias is addressed.")
        
        if risk["risk_level"] in ["Critical", "High"]:
            recommendations.append("Apply threshold optimization (post-processing) for quick improvement.")
            recommendations.append("Review data collection process for sampling bias.")
            recommendations.append("Consider reweighting or resampling techniques (preprocessing).")
        
        # Specific metric recommendations
        for key, value in fairness_scores.items():
            if 'demographic_parity' in key and abs(value) > 0.1:
                attr = key.split('_')[0]
                recommendations.append(f"Address demographic parity for '{attr}': Consider balanced sampling or fairness constraints.")
            
            if 'equalized_odds' in key and abs(value) > 0.1:
                attr = key.split('_')[0]
                recommendations.append(f"Improve equalized odds for '{attr}': Use in-processing mitigation (e.g., ExponentiatedGradient).")
        
        if not recommendations:
            recommendations.append("✅ Fairness metrics within acceptable range. Continue monitoring.")
        
        return recommendations
    
    def _mock_results(self) -> FairnessMetricsResult:
        """Fallback mock results when Fairlearn unavailable"""
        return FairnessMetricsResult(
            overall_metrics={"accuracy": 0.85, "precision": 0.80, "recall": 0.75},
            disaggregated_metrics={},
            group_metrics={},
            fairness_scores={},
            risk_assessment={"risk_level": "Unknown", "error": "Fairlearn not available"},
            recommendations=["Install Fairlearn to enable fairness analysis"]
        )
