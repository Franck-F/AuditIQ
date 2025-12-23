import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class EDAService:
    """
    Service pour l'analyse exploratoire des données (EDA)
    Fournit des statistiques descriptives, des analyses de corrélation et des distributions.
    """

    def generate_eda_report(self, df: pd.DataFrame, target_column: Optional[str] = None, sensitive_attributes: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Génère un rapport EDA complet pour le dataset.
        """
        logger.info("Starting EDA report generation")
        
        # 1. Statistiques descriptives
        descriptive_stats = self._get_descriptive_stats(df)
        
        # 2. Qualité des données (Valeurs manquantes, doublons, etc.)
        data_quality = self._get_data_quality(df)
        
        # 3. Matrice de corrélation (uniquement numérique)
        correlation_matrix = self._get_correlation_matrix(df)
        
        # 4. Distributions (Top variables et target/sensitive)
        distributions = self._get_distributions(df, target_column, sensitive_attributes)
        
        report = {
            "summary": {
                "row_count": len(df),
                "col_count": len(df.columns),
                "memory_usage": df.memory_usage(deep=True).sum() / (1024 * 1024),  # MB
            },
            "descriptive_stats": descriptive_stats,
            "data_quality": data_quality,
            "correlation_matrix": correlation_matrix,
            "distributions": distributions
        }
        
        logger.info("EDA report generation completed")
        return report

    def _get_descriptive_stats(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Calcule les stats descriptives par colonne"""
        stats_list = []
        
        # Séparer colonnes numériques et catégorielles
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns
        
        for col in df.columns:
            col_data = df[col]
            stat = {
                "name": col,
                "type": str(col_data.dtype),
                "count": int(col_data.count()),
                "missing_count": int(col_data.isna().sum()),
                "missing_pct": float(col_data.isna().mean() * 100),
                "unique_count": int(col_data.nunique())
            }
            
            if col in numeric_cols:
                stat.update({
                    "mean": float(col_data.mean()) if not col_data.empty else 0,
                    "std": float(col_data.std()) if not col_data.empty else 0,
                    "min": float(col_data.min()) if not col_data.empty else 0,
                    "q25": float(col_data.quantile(0.25)) if not col_data.empty else 0,
                    "median": float(col_data.median()) if not col_data.empty else 0,
                    "q75": float(col_data.quantile(0.75)) if not col_data.empty else 0,
                    "max": float(col_data.max()) if not col_data.empty else 0,
                })
            else:
                top_val = col_data.value_counts().idxmax() if not col_data.empty else "N/A"
                stat.update({
                    "top": str(top_val),
                    "top_freq": int(col_data.value_counts().max()) if not col_data.empty else 0
                })
            
            stats_list.append(stat)
            
        return stats_list

    def _get_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyse la qualité globale du dataset"""
        return {
            "total_missing": int(df.isna().sum().sum()),
            "duplicate_rows": int(df.duplicated().sum()),
            "columns_with_missing": [col for col in df.columns if df[col].isna().any()],
            "constant_columns": [col for col in df.columns if df[col].nunique() <= 1]
        }

    def _get_correlation_matrix(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calcule la matrice de corrélation pour les variables numériques"""
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return {"columns": [], "data": []}
            
        corr = numeric_df.corr().round(4)
        return {
            "columns": list(corr.columns),
            "data": corr.values.tolist()
        }

    def _get_distributions(self, df: pd.DataFrame, target: Optional[str], sensitive_attrs: Optional[List[str]]) -> Dict[str, Any]:
        """Génère les données de distribution (histogrammes)"""
        dist_data = {}
        
        # Limiter aux 10 premières colonnes ou target/sensitive pour éviter l'explosion
        cols_to_plot = list(df.columns[:5]) # Par défaut premières colonnes
        if target and target in df.columns:
            cols_to_plot.append(target)
        if sensitive_attrs:
            for sa in sensitive_attrs:
                if sa in df.columns:
                    cols_to_plot.append(sa)
        
        cols_to_plot = list(set(cols_to_plot)) # Uniq
        
        for col in cols_to_plot:
            col_data = df[col].dropna()
            if df[col].dtype in [np.number]:
                # Histogramme pour numérique
                counts, bins = np.histogram(col_data, bins=10)
                dist_data[col] = {
                    "type": "numeric",
                    "counts": counts.tolist(),
                    "bins": bins.tolist(),
                    "labels": [f"{bins[i]:.2f}-{bins[i+1]:.2f}" for i in range(len(bins)-1)]
                }
            else:
                # Value counts pour catégoriel
                top_counts = col_data.value_counts().head(10)
                dist_data[col] = {
                    "type": "categorical",
                    "counts": top_counts.values.tolist(),
                    "labels": top_counts.index.astype(str).tolist()
                }
                
        return dist_data
