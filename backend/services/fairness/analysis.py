"""
Advanced Fairness Analysis Module

Provides:
- Intersectional analysis (multiple sensitive attributes)
- Subgroup discovery (identify vulnerable subgroups)
- Trend analysis (fairness over time)
- Model comparison framework
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from itertools import combinations
from dataclasses import dataclass

try:
    from fairlearn.metrics import MetricFrame
    from sklearn.metrics import accuracy_score, precision_score, recall_score
    FAIRLEARN_AVAILABLE = True
except ImportError:
    FAIRLEARN_AVAILABLE = False


@dataclass
class IntersectionalResult:
    """Results from intersectional analysis"""
    attribute_combinations: List[Tuple[str, ...]]
    subgroup_metrics: Dict[str, Dict[str, float]]
    worst_subgroups: List[Dict[str, Any]]
    disparity_matrix: Dict[str, float]
    recommendations: List[str]


@dataclass
class SubgroupDiscovery:
    """Results from subgroup discovery"""
    discovered_subgroups: List[Dict[str, Any]]
    vulnerability_scores: Dict[str, float]
    protection_needed: List[str]
    insights: List[str]


class AdvancedFairnessAnalyzer:
    """
    Advanced fairness analysis beyond basic metrics
    """
    
    def __init__(self, sensitive_attributes: List[str]):
        self.sensitive_attributes = sensitive_attributes
    
    # ==================== INTERSECTIONAL ANALYSIS ====================
    
    def analyze_intersectionality(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        sensitive_attrs: pd.DataFrame,
        max_combination_size: int = 3
    ) -> IntersectionalResult:
        """
        Analyze fairness across intersections of sensitive attributes
        
        Example: Not just "gender" or "race", but "Black women", "Asian men", etc.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            sensitive_attrs: DataFrame with sensitive attributes
            max_combination_size: Maximum number of attributes to combine
        
        Returns:
            IntersectionalResult with detailed analysis
        """
        if not FAIRLEARN_AVAILABLE:
            return self._mock_intersectional_result()
        
        # Generate all combinations of attributes
        all_combinations = []
        for size in range(1, min(max_combination_size + 1, len(self.sensitive_attributes) + 1)):
            all_combinations.extend(
                combinations(self.sensitive_attributes, size)
            )
        
        subgroup_metrics = {}
        disparity_scores = {}
        
        for attr_combo in all_combinations:
            combo_name = " × ".join(attr_combo)
            
            # Create combined grouping
            if len(attr_combo) == 1:
                groups = sensitive_attrs[attr_combo[0]]
            else:
                # Combine multiple attributes
                groups = sensitive_attrs[list(attr_combo)].apply(
                    lambda row: ' & '.join([f"{col}={row[col]}" for col in attr_combo]),
                    axis=1
                )
            
            # Calculate metrics for each subgroup
            unique_groups = groups.unique()
            combo_metrics = {}
            
            for group in unique_groups:
                mask = (groups == group)
                if mask.sum() < 10:  # Skip very small groups
                    continue
                
                y_true_group = y_true[mask]
                y_pred_group = y_pred[mask]
                
                try:
                    combo_metrics[str(group)] = {
                        'size': int(mask.sum()),
                        'percentage': float(mask.sum() / len(y_true) * 100),
                        'accuracy': float(accuracy_score(y_true_group, y_pred_group)),
                        'precision': float(precision_score(y_true_group, y_pred_group, zero_division=0)),
                        'recall': float(recall_score(y_true_group, y_pred_group, zero_division=0)),
                        'selection_rate': float(y_pred_group.mean()),
                    }
                except Exception as e:
                    print(f"Error calculating metrics for {group}: {e}")
                    continue
            
            if combo_metrics:
                subgroup_metrics[combo_name] = combo_metrics
                
                # Calculate disparity for this combination
                accuracies = [m['accuracy'] for m in combo_metrics.values()]
                if len(accuracies) > 1:
                    disparity_scores[combo_name] = max(accuracies) - min(accuracies)
        
        # Identify worst performing subgroups
        worst_subgroups = self._identify_worst_subgroups(subgroup_metrics)
        
        # Generate recommendations
        recommendations = self._generate_intersectional_recommendations(
            worst_subgroups, disparity_scores
        )
        
        return IntersectionalResult(
            attribute_combinations=list(all_combinations),
            subgroup_metrics=subgroup_metrics,
            worst_subgroups=worst_subgroups,
            disparity_matrix=disparity_scores,
            recommendations=recommendations
        )
    
    def _identify_worst_subgroups(
        self,
        subgroup_metrics: Dict[str, Dict[str, float]],
        top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """Identify most vulnerable subgroups"""
        
        all_subgroups = []
        
        for combo_name, groups in subgroup_metrics.items():
            for group_name, metrics in groups.items():
                all_subgroups.append({
                    'combination': combo_name,
                    'group': group_name,
                    'accuracy': metrics['accuracy'],
                    'size': metrics['size'],
                    'percentage': metrics['percentage'],
                    'vulnerability_score': self._calculate_vulnerability_score(metrics)
                })
        
        # Sort by vulnerability score (lower accuracy + smaller size = more vulnerable)
        sorted_subgroups = sorted(
            all_subgroups,
            key=lambda x: x['vulnerability_score'],
            reverse=True
        )
        
        return sorted_subgroups[:top_n]
    
    def _calculate_vulnerability_score(self, metrics: Dict[str, float]) -> float:
        """
        Calculate vulnerability score for a subgroup
        
        Factors:
        - Low accuracy (more vulnerable)
        - Small size (underrepresented)
        - Low precision/recall
        """
        accuracy_penalty = (1.0 - metrics['accuracy']) * 100
        size_penalty = max(0, (5.0 - metrics['percentage'])) * 10  # Penalty for groups < 5%
        precision_penalty = (1.0 - metrics['precision']) * 50
        recall_penalty = (1.0 - metrics['recall']) * 50
        
        vulnerability = accuracy_penalty + size_penalty + precision_penalty + recall_penalty
        
        return vulnerability
    
    def _generate_intersectional_recommendations(
        self,
        worst_subgroups: List[Dict[str, Any]],
        disparity_scores: Dict[str, float]
    ) -> List[str]:
        """Generate recommendations based on intersectional analysis"""
        
        recommendations = []
        
        if not worst_subgroups:
            recommendations.append("✅ No significant intersectional disparities detected.")
            return recommendations
        
        # Check for high disparity in intersectional groups
        high_disparity = {k: v for k, v in disparity_scores.items() if v > 0.15}
        
        if high_disparity:
            recommendations.append(
                f"⚠️ High disparity detected in {len(high_disparity)} intersectional groups. "
                "Consider targeted interventions for specific subgroups."
            )
        
        # Identify most vulnerable
        most_vulnerable = worst_subgroups[0]
        recommendations.append(
            f"🎯 Most vulnerable subgroup: {most_vulnerable['group']} "
            f"(Accuracy: {most_vulnerable['accuracy']:.2%}, Size: {most_vulnerable['percentage']:.1f}%)"
        )
        
        # Check for small, underperforming groups
        small_underperforming = [
            sg for sg in worst_subgroups 
            if sg['percentage'] < 5 and sg['accuracy'] < 0.7
        ]
        
        if small_underperforming:
            recommendations.append(
                f"📊 {len(small_underperforming)} small, underperforming subgroups detected. "
                "Consider data augmentation or specialized models."
            )
        
        return recommendations
    
    # ==================== SUBGROUP DISCOVERY ====================
    
    def discover_vulnerable_subgroups(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        sensitive_attrs: pd.DataFrame,
        features: Optional[pd.DataFrame] = None,
        min_group_size: int = 30
    ) -> SubgroupDiscovery:
        """
        Discover vulnerable subgroups using automated analysis
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            sensitive_attrs: Sensitive attributes
            features: Optional feature data for deeper analysis
            min_group_size: Minimum size for a subgroup to be considered
        
        Returns:
            SubgroupDiscovery with identified vulnerable groups
        """
        discovered_subgroups = []
        vulnerability_scores = {}
        
        # Analyze each sensitive attribute
        for attr in self.sensitive_attributes:
            if attr not in sensitive_attrs.columns:
                continue
            
            groups = sensitive_attrs[attr]
            unique_groups = groups.unique()
            
            for group in unique_groups:
                mask = (groups == group)
                group_size = mask.sum()
                
                if group_size < min_group_size:
                    continue
                
                y_true_group = y_true[mask]
                y_pred_group = y_pred[mask]
                
                # Calculate performance
                accuracy = accuracy_score(y_true_group, y_pred_group)
                precision = precision_score(y_true_group, y_pred_group, zero_division=0)
                recall = recall_score(y_true_group, y_pred_group, zero_division=0)
                
                # Calculate vulnerability
                vulnerability = self._calculate_vulnerability_score({
                    'accuracy': accuracy,
                    'percentage': group_size / len(y_true) * 100,
                    'precision': precision,
                    'recall': recall
                })
                
                subgroup_info = {
                    'attribute': attr,
                    'group': str(group),
                    'size': int(group_size),
                    'percentage': float(group_size / len(y_true) * 100),
                    'accuracy': float(accuracy),
                    'precision': float(precision),
                    'recall': float(recall),
                    'vulnerability_score': float(vulnerability),
                    'needs_protection': vulnerability > 100  # Threshold for protection
                }
                
                discovered_subgroups.append(subgroup_info)
                vulnerability_scores[f"{attr}={group}"] = vulnerability
        
        # Sort by vulnerability
        discovered_subgroups.sort(key=lambda x: x['vulnerability_score'], reverse=True)
        
        # Identify groups needing protection
        protection_needed = [
            f"{sg['attribute']}={sg['group']}"
            for sg in discovered_subgroups
            if sg['needs_protection']
        ]
        
        # Generate insights
        insights = self._generate_subgroup_insights(discovered_subgroups)
        
        return SubgroupDiscovery(
            discovered_subgroups=discovered_subgroups,
            vulnerability_scores=vulnerability_scores,
            protection_needed=protection_needed,
            insights=insights
        )
    
    def _generate_subgroup_insights(
        self,
        subgroups: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate insights from subgroup analysis"""
        
        insights = []
        
        if not subgroups:
            return ["No subgroups analyzed."]
        
        # Overall vulnerability
        avg_vulnerability = np.mean([sg['vulnerability_score'] for sg in subgroups])
        insights.append(f"Average vulnerability score: {avg_vulnerability:.1f}")
        
        # Most vulnerable
        most_vulnerable = subgroups[0]
        insights.append(
            f"Most vulnerable: {most_vulnerable['attribute']}={most_vulnerable['group']} "
            f"(Accuracy: {most_vulnerable['accuracy']:.2%})"
        )
        
        # Count needing protection
        needs_protection = sum(1 for sg in subgroups if sg['needs_protection'])
        if needs_protection > 0:
            insights.append(
                f"{needs_protection} subgroups require additional protection measures"
            )
        
        # Size distribution
        small_groups = sum(1 for sg in subgroups if sg['percentage'] < 5)
        if small_groups > 0:
            insights.append(
                f"{small_groups} underrepresented groups detected (< 5% of data)"
            )
        
        return insights
    
    # ==================== TREND ANALYSIS ====================
    
    def analyze_fairness_trends(
        self,
        historical_metrics: List[Dict[str, Any]],
        time_periods: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze fairness trends over time
        
        Args:
            historical_metrics: List of metric dictionaries from different time periods
            time_periods: List of time period labels
        
        Returns:
            Trend analysis results
        """
        if len(historical_metrics) < 2:
            return {
                "error": "Need at least 2 time periods for trend analysis",
                "trend": "insufficient_data"
            }
        
        trends = {}
        
        # Extract common metrics across all periods
        common_metrics = set(historical_metrics[0].keys())
        for metrics in historical_metrics[1:]:
            common_metrics &= set(metrics.keys())
        
        for metric_name in common_metrics:
            values = [metrics[metric_name] for metrics in historical_metrics]
            
            # Calculate trend
            if len(values) >= 2:
                # Simple linear trend
                trend_direction = "improving" if values[-1] < values[0] else "worsening"
                change_pct = ((values[-1] - values[0]) / abs(values[0]) * 100) if values[0] != 0 else 0
                
                trends[metric_name] = {
                    "values": values,
                    "trend": trend_direction,
                    "change_percentage": change_pct,
                    "latest": values[-1],
                    "baseline": values[0]
                }
        
        return {
            "time_periods": time_periods,
            "trends": trends,
            "overall_trend": self._assess_overall_trend(trends)
        }
    
    def _assess_overall_trend(self, trends: Dict[str, Dict]) -> str:
        """Assess overall fairness trend"""
        
        if not trends:
            return "unknown"
        
        improving_count = sum(1 for t in trends.values() if t.get("trend") == "improving")
        worsening_count = sum(1 for t in trends.values() if t.get("trend") == "worsening")
        
        if improving_count > worsening_count * 1.5:
            return "improving"
        elif worsening_count > improving_count * 1.5:
            return "worsening"
        else:
            return "stable"
    
    # ==================== MODEL COMPARISON ====================
    
    def compare_models(
        self,
        models_results: List[Dict[str, Any]],
        model_names: List[str]
    ) -> Dict[str, Any]:
        """
        Compare fairness-performance tradeoffs across multiple models
        
        Args:
            models_results: List of result dictionaries for each model
            model_names: List of model names
        
        Returns:
            Comparison analysis
        """
        comparison = {
            "models": model_names,
            "performance": {},
            "fairness": {},
            "tradeoff_analysis": {},
            "recommendations": []
        }
        
        # Extract performance and fairness metrics
        for idx, (model_name, results) in enumerate(zip(model_names, models_results)):
            comparison["performance"][model_name] = {
                "accuracy": results.get("accuracy", 0),
                "precision": results.get("precision", 0),
                "recall": results.get("recall", 0)
            }
            
            comparison["fairness"][model_name] = {
                "demographic_parity": results.get("demographic_parity_diff", 0),
                "equalized_odds": results.get("equalized_odds_diff", 0),
                "equal_opportunity": results.get("equal_opportunity_diff", 0)
            }
        
        # Analyze tradeoffs
        comparison["tradeoff_analysis"] = self._analyze_tradeoffs(
            comparison["performance"],
            comparison["fairness"]
        )
        
        # Generate recommendations
        comparison["recommendations"] = self._generate_model_recommendations(
            comparison["tradeoff_analysis"]
        )
        
        return comparison
    
    def _analyze_tradeoffs(
        self,
        performance: Dict[str, Dict],
        fairness: Dict[str, Dict]
    ) -> Dict[str, Any]:
        """Analyze fairness-performance tradeoffs"""
        
        tradeoffs = {}
        
        for model_name in performance.keys():
            perf_score = performance[model_name]["accuracy"]
            fairness_score = 1.0 - np.mean([
                abs(fairness[model_name]["demographic_parity"]),
                abs(fairness[model_name]["equalized_odds"]),
                abs(fairness[model_name]["equal_opportunity"])
            ])
            
            # Combined score (weighted average)
            combined_score = 0.6 * perf_score + 0.4 * fairness_score
            
            tradeoffs[model_name] = {
                "performance_score": perf_score,
                "fairness_score": fairness_score,
                "combined_score": combined_score,
                "is_pareto_optimal": False  # Will be updated
            }
        
        # Identify Pareto optimal models
        # (models where no other model is better in both performance and fairness)
        for model in tradeoffs.keys():
            is_dominated = False
            for other_model in tradeoffs.keys():
                if model != other_model:
                    if (tradeoffs[other_model]["performance_score"] >= tradeoffs[model]["performance_score"] and
                        tradeoffs[other_model]["fairness_score"] >= tradeoffs[model]["fairness_score"] and
                        (tradeoffs[other_model]["performance_score"] > tradeoffs[model]["performance_score"] or
                         tradeoffs[other_model]["fairness_score"] > tradeoffs[model]["fairness_score"])):
                        is_dominated = True
                        break
            
            tradeoffs[model]["is_pareto_optimal"] = not is_dominated
        
        return tradeoffs
    
    def _generate_model_recommendations(
        self,
        tradeoffs: Dict[str, Dict]
    ) -> List[str]:
        """Generate model selection recommendations"""
        
        recommendations = []
        
        # Find best overall
        best_model = max(tradeoffs.items(), key=lambda x: x[1]["combined_score"])
        recommendations.append(
            f"Best overall model: {best_model[0]} "
            f"(Combined score: {best_model[1]['combined_score']:.3f})"
        )
        
        # Find Pareto optimal models
        pareto_models = [m for m, t in tradeoffs.items() if t["is_pareto_optimal"]]
        if pareto_models:
            recommendations.append(
                f"Pareto optimal models: {', '.join(pareto_models)}"
            )
        
        # Performance vs fairness tradeoff
        best_perf = max(tradeoffs.items(), key=lambda x: x[1]["performance_score"])
        best_fair = max(tradeoffs.items(), key=lambda x: x[1]["fairness_score"])
        
        if best_perf[0] != best_fair[0]:
            recommendations.append(
                f"Tradeoff: {best_perf[0]} has best performance, "
                f"{best_fair[0]} has best fairness"
            )
        
        return recommendations
    
    def _mock_intersectional_result(self) -> IntersectionalResult:
        """Fallback when Fairlearn not available"""
        return IntersectionalResult(
            attribute_combinations=[],
            subgroup_metrics={},
            worst_subgroups=[],
            disparity_matrix={},
            recommendations=["Fairlearn required for intersectional analysis"]
        )
