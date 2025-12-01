"""
Détection automatique des variables proxy
F2.3.3: Détecte les variables corrélées aux attributs sensibles (corrélation > 0.7)
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple


def detect_proxy_variables(
    df: pd.DataFrame,
    sensitive_attributes: List[str],
    correlation_threshold: float = 0.7
) -> Dict[str, List[Dict[str, any]]]:
    """
    Détecte les variables proxy pour chaque attribut sensible
    
    Args:
        df: DataFrame contenant les données
        sensitive_attributes: Liste des colonnes sensibles
        correlation_threshold: Seuil de corrélation (défaut: 0.7)
    
    Returns:
        Dict avec pour chaque attribut sensible, la liste des proxies détectées
        Format: {
            'gender': [
                {'column': 'job_title', 'correlation': 0.85, 'method': 'cramers_v'},
                ...
            ]
        }
    """
    results = {}
    
    for sensitive_attr in sensitive_attributes:
        if sensitive_attr not in df.columns:
            continue
        
        proxies = []
        
        # Pour chaque autre colonne
        for col in df.columns:
            if col == sensitive_attr:
                continue
            
            # Calculer la corrélation appropriée selon les types
            correlation, method = calculate_correlation(df, sensitive_attr, col)
            
            if correlation is not None and abs(correlation) >= correlation_threshold:
                proxies.append({
                    'column': col,
                    'correlation': round(float(correlation), 3),
                    'method': method,
                    'risk_level': 'high' if abs(correlation) >= 0.85 else 'medium'
                })
        
        # Trier par corrélation décroissante
        proxies.sort(key=lambda x: abs(x['correlation']), reverse=True)
        results[sensitive_attr] = proxies
    
    return results


def calculate_correlation(
    df: pd.DataFrame, 
    col1: str, 
    col2: str
) -> Tuple[float, str]:
    """
    Calcule la corrélation entre deux colonnes avec la méthode appropriée
    
    Returns:
        Tuple (correlation_value, method_name)
    """
    # Supprimer les valeurs manquantes pour le calcul
    data = df[[col1, col2]].dropna()
    
    if len(data) < 10:  # Pas assez de données
        return None, None
    
    # Déterminer les types de colonnes
    is_col1_numeric = pd.api.types.is_numeric_dtype(data[col1])
    is_col2_numeric = pd.api.types.is_numeric_dtype(data[col2])
    
    try:
        # Cas 1: Deux variables numériques -> Corrélation de Pearson
        if is_col1_numeric and is_col2_numeric:
            corr = data[col1].corr(data[col2], method='pearson')
            return corr, 'pearson'
        
        # Cas 2: Deux variables catégorielles -> Cramér's V
        elif not is_col1_numeric and not is_col2_numeric:
            corr = cramers_v(data[col1], data[col2])
            return corr, 'cramers_v'
        
        # Cas 3: Une numérique et une catégorielle -> Correlation ratio (eta)
        else:
            if is_col1_numeric:
                corr = correlation_ratio(data[col1], data[col2])
            else:
                corr = correlation_ratio(data[col2], data[col1])
            return corr, 'correlation_ratio'
    
    except Exception:
        return None, None


def cramers_v(x: pd.Series, y: pd.Series) -> float:
    """
    Calcule le V de Cramér entre deux variables catégorielles
    Mesure d'association entre 0 (indépendance) et 1 (dépendance totale)
    """
    from scipy.stats import chi2_contingency
    
    # Créer la table de contingence
    confusion_matrix = pd.crosstab(x, y)
    
    # Test du chi2
    chi2 = chi2_contingency(confusion_matrix)[0]
    n = confusion_matrix.sum().sum()
    
    # Calcul du V de Cramér
    min_dim = min(confusion_matrix.shape) - 1
    if min_dim == 0:
        return 0.0
    
    v = np.sqrt(chi2 / (n * min_dim))
    return v


def correlation_ratio(numerical: pd.Series, categorical: pd.Series) -> float:
    """
    Calcule le rapport de corrélation (eta) entre une variable numérique et catégorielle
    Mesure la force de l'association entre 0 (aucune) et 1 (parfaite)
    """
    # Variance totale
    mean_total = numerical.mean()
    ss_total = ((numerical - mean_total) ** 2).sum()
    
    if ss_total == 0:
        return 0.0
    
    # Variance inter-groupes
    ss_between = 0
    for category in categorical.unique():
        group = numerical[categorical == category]
        if len(group) > 0:
            mean_group = group.mean()
            ss_between += len(group) * ((mean_group - mean_total) ** 2)
    
    # Rapport de corrélation
    eta_squared = ss_between / ss_total
    return np.sqrt(eta_squared)


def get_proxy_explanation(method: str) -> str:
    """Retourne une explication de la méthode de corrélation utilisée"""
    explanations = {
        'pearson': 'Corrélation linéaire entre deux variables numériques',
        'cramers_v': "V de Cramér : mesure d'association entre deux variables catégorielles",
        'correlation_ratio': 'Rapport de corrélation (eta) entre variable numérique et catégorielle'
    }
    return explanations.get(method, 'Méthode inconnue')


def format_proxy_report(proxy_results: Dict[str, List[Dict]]) -> Dict:
    """
    Formate les résultats de détection de proxy pour l'affichage
    
    Returns:
        {
            'total_proxies': int,
            'high_risk_count': int,
            'by_attribute': {...},
            'recommendations': [...]
        }
    """
    total_proxies = sum(len(proxies) for proxies in proxy_results.values())
    high_risk_count = sum(
        len([p for p in proxies if p['risk_level'] == 'high'])
        for proxies in proxy_results.values()
    )
    
    recommendations = []
    
    for attr, proxies in proxy_results.items():
        if proxies:
            high_risk_proxies = [p for p in proxies if p['risk_level'] == 'high']
            if high_risk_proxies:
                recommendations.append({
                    'type': 'warning',
                    'attribute': attr,
                    'message': f"⚠️ {len(high_risk_proxies)} variable(s) fortement corrélée(s) à '{attr}' détectée(s)",
                    'action': 'Considérez exclure ces variables du modèle ou appliquer une anonymisation'
                })
    
    if not recommendations:
        recommendations.append({
            'type': 'success',
            'message': '✅ Aucune variable proxy à haut risque détectée',
            'action': None
        })
    
    return {
        'total_proxies': total_proxies,
        'high_risk_count': high_risk_count,
        'by_attribute': proxy_results,
        'recommendations': recommendations
    }
