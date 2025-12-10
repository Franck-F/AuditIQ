"""
Root Cause Analyzer Service
Analyse les causes profondes des anomalies détectées
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class RootCauseAnalyzer:
    """
    Analyse les causes probables des anomalies
    Utilise des corrélations et analyses multivariées
    """
    
    async def analyze_root_cause(
        self,
        df: pd.DataFrame,
        anomaly: Dict[str, Any],
        all_dimensions: List[str]
    ) -> Dict[str, Any]:
        """
        Identifie la cause probable d'une anomalie
        
        Args:
            df: DataFrame complet
            anomaly: Anomalie à analyser
            all_dimensions: Toutes les dimensions disponibles
        
        Returns:
            {
                "probable_cause": str,
                "confidence": float,
                "correlated_factors": List[Dict]
            }
        """
        logger.info(f"Analyzing root cause for {anomaly['metric_name']}")
        
        # Filtrer les données pertinentes
        if anomaly['dimension'] and anomaly['dimension_value']:
            subset = df[df[anomaly['dimension']] == anomaly['dimension_value']]
        else:
            subset = df
        
        # Analyser les corrélations
        correlations = self._compute_correlations(
            subset,
            anomaly['metric_name'],
            all_dimensions
        )
        
        # Identifier le facteur principal
        if correlations:
            primary_factor = max(correlations, key=lambda x: x['correlation_strength'])
            
            # Générer explication
            explanation = self._generate_explanation(anomaly, primary_factor)
            
            return {
                "probable_cause": explanation,
                "confidence": primary_factor['correlation_strength'],
                "correlated_factors": correlations[:5]  # Top 5
            }
        else:
            return {
                "probable_cause": "Cause indéterminée - données insuffisantes",
                "confidence": 0.0,
                "correlated_factors": []
            }
    
    def _compute_correlations(
        self,
        df: pd.DataFrame,
        target_metric: str,
        dimensions: List[str]
    ) -> List[Dict]:
        """
        Calcule les corrélations entre le métrique cible et les dimensions
        """
        correlations = []
        
        for dimension in dimensions:
            if dimension not in df.columns:
                continue
            
            # Vérifier le type de dimension
            if df[dimension].dtype in ['object', 'category']:
                # Dimension catégorielle - utiliser ANOVA
                correlation_info = self._categorical_correlation(
                    df, target_metric, dimension
                )
            else:
                # Dimension numérique - utiliser corrélation de Pearson
                correlation_info = self._numerical_correlation(
                    df, target_metric, dimension
                )
            
            if correlation_info:
                correlations.append(correlation_info)
        
        # Trier par force de corrélation
        correlations.sort(key=lambda x: x['correlation_strength'], reverse=True)
        
        return correlations
    
    def _categorical_correlation(
        self,
        df: pd.DataFrame,
        metric: str,
        dimension: str
    ) -> Optional[Dict]:
        """
        Analyse la corrélation avec une dimension catégorielle (ANOVA)
        """
        try:
            # Grouper par dimension
            groups = [group[metric].dropna() for name, group in df.groupby(dimension)]
            
            # Filtrer les groupes vides
            groups = [g for g in groups if len(g) > 0]
            
            if len(groups) < 2:
                return None
            
            # Test ANOVA
            f_stat, p_value = stats.f_oneway(*groups)
            
            # Calculer eta-squared (taille d'effet)
            grand_mean = df[metric].mean()
            ss_between = sum(len(g) * (g.mean() - grand_mean)**2 for g in groups)
            ss_total = sum((df[metric] - grand_mean)**2)
            eta_squared = ss_between / ss_total if ss_total > 0 else 0
            
            return {
                'factor': dimension,
                'type': 'categorical',
                'correlation_strength': float(eta_squared),
                'p_value': float(p_value),
                'test_type': 'ANOVA'
            }
        except Exception as e:
            logger.error(f"Error in categorical correlation: {e}")
            return None
    
    def _numerical_correlation(
        self,
        df: pd.DataFrame,
        metric: str,
        dimension: str
    ) -> Optional[Dict]:
        """
        Analyse la corrélation avec une dimension numérique (Pearson)
        """
        try:
            # Supprimer les valeurs manquantes
            clean_df = df[[metric, dimension]].dropna()
            
            if len(clean_df) < 3:
                return None
            
            # Corrélation de Pearson
            corr, p_value = stats.pearsonr(clean_df[metric], clean_df[dimension])
            
            return {
                'factor': dimension,
                'type': 'numerical',
                'correlation_strength': float(abs(corr)),
                'correlation_direction': 'positive' if corr > 0 else 'negative',
                'p_value': float(p_value),
                'test_type': 'Pearson'
            }
        except Exception as e:
            logger.error(f"Error in numerical correlation: {e}")
            return None
    
    def _generate_explanation(
        self,
        anomaly: Dict,
        primary_factor: Dict
    ) -> str:
        """
        Génère une explication en langage naturel
        """
        metric = anomaly['metric_name']
        observed = anomaly['observed_value']
        expected = anomaly['expected_value']
        factor = primary_factor['factor']
        
        # Direction du changement
        if observed > expected:
            direction = "augmentation"
            change_pct = ((observed - expected) / expected * 100) if expected != 0 else 0
        else:
            direction = "diminution"
            change_pct = ((expected - observed) / expected * 100) if expected != 0 else 0
        
        # Construire l'explication
        if anomaly['dimension']:
            context = f"pour {anomaly['dimension']}={anomaly['dimension_value']}"
        else:
            context = "globalement"
        
        explanation = (
            f"{direction.capitalize()} de {change_pct:.1f}% de '{metric}' {context}. "
            f"Corrélation forte avec '{factor}' "
            f"(force: {primary_factor['correlation_strength']:.2f})."
        )
        
        return explanation
