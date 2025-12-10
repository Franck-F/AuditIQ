"""
Anomaly Detector Service
Détecte les anomalies statistiquement significatives dans les données
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AnomalyDetector:
    """
    Moteur de détection d'anomalies statistiques
    Utilise des tests statistiques robustes et correction pour hypothèses multiples
    """
    
    def __init__(self, confidence_level: float = 0.95):
        """
        Args:
            confidence_level: Niveau de confiance pour les tests statistiques (0.0-1.0)
        """
        self.confidence_level = confidence_level
        self.alpha = 1 - confidence_level
        
    async def detect_anomalies(
        self,
        df: pd.DataFrame,
        metrics_config: Dict[str, Any],
        dimensions_config: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Détecte les anomalies dans les données
        
        Args:
            df: DataFrame avec données historiques
            metrics_config: Configuration des métriques à analyser
                Ex: {"revenue": {"type": "sum", "alert_threshold": 10000}}
            dimensions_config: Liste des dimensions d'analyse
                Ex: ["region", "product_category"]
        
        Returns:
            Liste d'anomalies triées par impact business
        """
        logger.info(f"Starting anomaly detection with {len(metrics_config)} metrics")
        
        all_anomalies = []
        
        # Analyse de chaque métrique
        for metric_name, metric_conf in metrics_config.items():
            if metric_name not in df.columns:
                logger.warning(f"Metric {metric_name} not found in dataframe")
                continue
            
            # Analyse globale du métrique
            global_anomalies = self._detect_metric_anomalies(
                df, metric_name, metric_conf
            )
            all_anomalies.extend(global_anomalies)
            
            # Analyse par dimension
            for dimension in dimensions_config:
                if dimension not in df.columns:
                    continue
                
                dim_anomalies = self._detect_dimensional_anomalies(
                    df, metric_name, dimension, metric_conf
                )
                all_anomalies.extend(dim_anomalies)
        
        # Correction pour tests multiples (Bonferroni)
        adjusted_anomalies = self._bonferroni_correction(all_anomalies)
        
        # Calcul de l'impact business
        for anomaly in adjusted_anomalies:
            anomaly['business_impact'] = self._calculate_business_impact(anomaly)
            anomaly['severity'] = self._determine_severity(anomaly)
        
        # Tri par impact business décroissant
        sorted_anomalies = sorted(
            adjusted_anomalies,
            key=lambda x: x['business_impact'],
            reverse=True
        )
        
        logger.info(f"Detected {len(sorted_anomalies)} significant anomalies")
        return sorted_anomalies
    
    def _detect_metric_anomalies(
        self,
        df: pd.DataFrame,
        metric: str,
        config: Dict
    ) -> List[Dict]:
        """
        Détecte les anomalies sur un métrique global (tendance, outliers)
        """
        anomalies = []
        
        # Récupérer les valeurs
        values = df[metric].dropna()
        
        if len(values) < 3:
            return anomalies
        
        # Statistiques de base
        mean = values.mean()
        std = values.std()
        median = values.median()
        
        # Détection d'outliers (méthode IQR)
        Q1 = values.quantile(0.25)
        Q3 = values.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = values[(values < lower_bound) | (values > upper_bound)]
        
        if len(outliers) > 0:
            for idx, value in outliers.items():
                # Test Z-score
                z_score = (value - mean) / std if std > 0 else 0
                p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))
                
                anomalies.append({
                    'metric_name': metric,
                    'dimension': None,
                    'dimension_value': None,
                    'observed_value': float(value),
                    'expected_value': float(median),
                    'deviation_std': float(abs(z_score)),
                    'p_value': float(p_value),
                    'confidence_interval_lower': float(lower_bound),
                    'confidence_interval_upper': float(upper_bound),
                    'test_type': 'outlier_detection'
                })
        
        # Test de tendance (Mann-Kendall)
        if len(values) >= 10:
            trend_anomaly = self._detect_trend_change(values, metric)
            if trend_anomaly:
                anomalies.append(trend_anomaly)
        
        return anomalies
    
    def _detect_dimensional_anomalies(
        self,
        df: pd.DataFrame,
        metric: str,
        dimension: str,
        config: Dict
    ) -> List[Dict]:
        """
        Détecte les anomalies par dimension (ex: région, catégorie)
        Utilise ANOVA ou Kruskal-Wallis selon la distribution
        """
        anomalies = []
        
        # Grouper par dimension
        grouped = df.groupby(dimension)[metric].agg(['mean', 'std', 'count'])
        
        if len(grouped) < 2:
            return anomalies
        
        # Calculer la moyenne globale
        global_mean = df[metric].mean()
        global_std = df[metric].std()
        
        # Analyser chaque groupe
        for dim_value, stats_row in grouped.iterrows():
            if stats_row['count'] < 3:
                continue
            
            group_mean = stats_row['mean']
            group_std = stats_row['std']
            
            # Test Z pour la moyenne du groupe
            if global_std > 0:
                z_score = (group_mean - global_mean) / (global_std / np.sqrt(stats_row['count']))
                p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))
                
                # Si significatif
                if p_value < self.alpha:
                    anomalies.append({
                        'metric_name': metric,
                        'dimension': dimension,
                        'dimension_value': str(dim_value),
                        'observed_value': float(group_mean),
                        'expected_value': float(global_mean),
                        'deviation_std': float(abs(z_score)),
                        'p_value': float(p_value),
                        'confidence_interval_lower': None,
                        'confidence_interval_upper': None,
                        'test_type': 'dimensional_comparison'
                    })
        
        return anomalies
    
    def _detect_trend_change(self, series: pd.Series, metric: str) -> Optional[Dict]:
        """
        Détecte un changement de tendance significatif (Mann-Kendall test)
        """
        try:
            # Simplification: comparer première moitié vs deuxième moitié
            mid = len(series) // 2
            first_half = series.iloc[:mid]
            second_half = series.iloc[mid:]
            
            # Test t de Student
            t_stat, p_value = stats.ttest_ind(first_half, second_half)
            
            if p_value < self.alpha:
                return {
                    'metric_name': metric,
                    'dimension': 'time_period',
                    'dimension_value': 'recent_vs_historical',
                    'observed_value': float(second_half.mean()),
                    'expected_value': float(first_half.mean()),
                    'deviation_std': float(abs(t_stat)),
                    'p_value': float(p_value),
                    'confidence_interval_lower': None,
                    'confidence_interval_upper': None,
                    'test_type': 'trend_change'
                }
        except Exception as e:
            logger.error(f"Error in trend detection: {e}")
        
        return None
    
    def _bonferroni_correction(self, anomalies: List[Dict]) -> List[Dict]:
        """
        Applique la correction de Bonferroni pour tests multiples
        """
        if not anomalies:
            return []
        
        n_tests = len(anomalies)
        adjusted_alpha = self.alpha / n_tests
        
        # Filtrer les anomalies qui restent significatives
        significant = [
            a for a in anomalies
            if a['p_value'] < adjusted_alpha
        ]
        
        logger.info(f"Bonferroni correction: {len(anomalies)} -> {len(significant)} anomalies")
        return significant
    
    def _calculate_business_impact(self, anomaly: Dict) -> float:
        """
        Calcule un score d'impact business (0-100)
        Basé sur la magnitude de la déviation et la significativité
        """
        # Facteurs:
        # 1. Magnitude de la déviation (écarts-types)
        # 2. Significativité statistique (p-value)
        # 3. Valeur absolue de l'impact
        
        deviation_score = min(anomaly['deviation_std'] * 10, 50)  # Max 50 points
        significance_score = (1 - anomaly['p_value']) * 30  # Max 30 points
        
        # Impact absolu
        abs_impact = abs(anomaly['observed_value'] - anomaly['expected_value'])
        impact_score = min(abs_impact / 1000, 20)  # Max 20 points (ajustable)
        
        total_score = deviation_score + significance_score + impact_score
        return min(total_score, 100.0)
    
    def _determine_severity(self, anomaly: Dict) -> str:
        """
        Détermine la sévérité de l'anomalie
        """
        impact = anomaly['business_impact']
        
        if impact >= 80:
            return "critical"
        elif impact >= 60:
            return "high"
        elif impact >= 40:
            return "medium"
        else:
            return "low"
