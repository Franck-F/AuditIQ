"""
Utilitaires pour le traitement des valeurs manquantes
F2.1.7: Gestion valeurs manquantes (signalement + options traitement)
"""
import pandas as pd
from typing import Dict, Any, List


def analyze_missing_values(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyse complète des valeurs manquantes dans un DataFrame
    
    Returns:
        Dict avec statistiques détaillées par colonne
    """
    missing_analysis = {}
    total_rows = len(df)
    
    for col in df.columns:
        null_count = df[col].isnull().sum()
        null_percentage = (null_count / total_rows) * 100
        
        if null_count > 0:
            missing_analysis[col] = {
                'count': int(null_count),
                'percentage': round(null_percentage, 2),
                'severity': get_severity(null_percentage),
                'recommended_strategy': recommend_strategy(df[col]),
                'available_strategies': get_available_strategies(df[col])
            }
    
    return missing_analysis


def get_severity(percentage: float) -> str:
    """Détermine la sévérité des valeurs manquantes"""
    if percentage < 5:
        return 'low'
    elif percentage < 20:
        return 'medium'
    elif percentage < 50:
        return 'high'
    else:
        return 'critical'


def recommend_strategy(series: pd.Series) -> str:
    """
    Recommande une stratégie de traitement selon le type de données.
    
    Règles:
    - Catégorielles: mode (valeur la plus fréquente)
    - Booléennes (0/1): mode
    - Numériques continues: mean ou median selon distribution
    """
    dtype = series.dtype
    null_percentage = (series.isnull().sum() / len(series)) * 100
    
    # Si trop de valeurs manquantes, recommander suppression colonne
    if null_percentage > 50:
        return 'drop_column'
    
    # Si très peu, supprimer les lignes
    if null_percentage < 5:
        return 'drop_rows'
    
    # Détecter variables booléennes (0/1 ou True/False)
    unique_vals = series.dropna().unique()
    if len(unique_vals) <= 2:
        # Booléenne ou binaire -> utiliser mode
        if set(unique_vals).issubset({0, 1, True, False, 0.0, 1.0}):
            return 'mode'
    
    # Variables catégorielles
    if pd.api.types.is_categorical_dtype(dtype) or pd.api.types.is_object_dtype(dtype):
        return 'mode'
    
    # Variables catégorielles numériques (peu de valeurs uniques)
    if series.nunique() < 20:
        return 'mode'
    
    # Variables numériques continues
    if pd.api.types.is_numeric_dtype(dtype):
        # Vérifier si distribution normale (skewness proche de 0)
        try:
            skewness = series.skew()
            if abs(skewness) < 1:
                return 'mean'  # Distribution symétrique
            else:
                return 'median'  # Distribution asymétrique ou avec outliers
        except:
            return 'median'  # Par défaut pour numérique
    
    # Par défaut
    return 'constant'


def get_available_strategies(series: pd.Series) -> List[str]:
    """Retourne les stratégies disponibles selon le type de colonne"""
    dtype = series.dtype
    strategies = ['drop_rows', 'drop_column']
    
    if pd.api.types.is_numeric_dtype(dtype):
        strategies.extend(['mean', 'median', 'forward_fill', 'constant'])
    elif pd.api.types.is_categorical_dtype(dtype) or series.nunique() < 50:
        strategies.extend(['mode', 'constant'])
    else:
        strategies.extend(['constant', 'forward_fill'])
    
    return strategies


def handle_missing_values(
    df: pd.DataFrame,
    strategy: Dict[str, str]
) -> pd.DataFrame:
    """
    Applique les stratégies de traitement des valeurs manquantes
    
    Args:
        df: DataFrame à traiter
        strategy: Dict {column_name: strategy}
            Strategies:
                - 'drop_rows': Supprimer lignes avec NaN dans cette colonne
                - 'drop_column': Supprimer la colonne entière
                - 'mean': Remplacer par moyenne (numérique)
                - 'median': Remplacer par médiane (numérique)
                - 'mode': Remplacer par mode (catégoriel)
                - 'forward_fill': Propagation avant
                - 'constant': Remplacer par valeur par défaut
    
    Returns:
        DataFrame traité (copie)
    """
    df_clean = df.copy()
    columns_to_drop = []
    
    for col, strat in strategy.items():
        if col not in df_clean.columns:
            continue
        
        if strat == 'drop_column':
            columns_to_drop.append(col)
        
        elif strat == 'drop_rows':
            df_clean = df_clean.dropna(subset=[col])
        
        elif strat == 'mean':
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                df_clean[col].fillna(df_clean[col].mean(), inplace=True)
        
        elif strat == 'median':
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                df_clean[col].fillna(df_clean[col].median(), inplace=True)
        
        elif strat == 'mode':
            mode_val = df_clean[col].mode()
            if len(mode_val) > 0:
                df_clean[col].fillna(mode_val[0], inplace=True)
        
        elif strat == 'forward_fill':
            df_clean[col].fillna(method='ffill', inplace=True)
            # Si encore des NaN au début, backfill
            df_clean[col].fillna(method='bfill', inplace=True)
        
        elif strat == 'constant':
            # Valeur par défaut selon le type
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                df_clean[col].fillna(0, inplace=True)
            else:
                df_clean[col].fillna('Unknown', inplace=True)
    
    # Supprimer colonnes marquées
    if columns_to_drop:
        df_clean = df_clean.drop(columns=columns_to_drop)
    
    return df_clean


def get_strategy_description(strategy: str) -> Dict[str, str]:
    """Retourne la description d'une stratégie"""
    descriptions = {
        'drop_rows': {
            'name': 'Supprimer les lignes',
            'description': 'Supprime toutes les lignes contenant des valeurs manquantes',
            'use_case': 'Peu de valeurs manquantes (<5%)',
            'pros': 'Simple, pas de biais introduit',
            'cons': 'Perte de données'
        },
        'drop_column': {
            'name': 'Supprimer la colonne',
            'description': 'Supprime complètement la colonne',
            'use_case': 'Beaucoup de valeurs manquantes (>50%)',
            'pros': 'Évite imputation incertaine',
            'cons': 'Perte de feature potentiellement importante'
        },
        'mean': {
            'name': 'Moyenne',
            'description': 'Remplace par la moyenne de la colonne',
            'use_case': 'Données numériques avec distribution normale',
            'pros': 'Conserve la moyenne générale',
            'cons': 'Réduit la variance'
        },
        'median': {
            'name': 'Médiane',
            'description': 'Remplace par la médiane de la colonne',
            'use_case': 'Données numériques avec outliers',
            'pros': 'Robuste aux valeurs extrêmes',
            'cons': 'Moins représentatif si distribution normale'
        },
        'mode': {
            'name': 'Mode',
            'description': 'Remplace par la valeur la plus fréquente',
            'use_case': 'Données catégorielles',
            'pros': 'Conserve distribution catégorielle',
            'cons': 'Peut sur-représenter catégorie majoritaire'
        },
        'forward_fill': {
            'name': 'Propagation avant',
            'description': 'Propage la dernière valeur valide',
            'use_case': 'Séries temporelles',
            'pros': 'Conserve tendances temporelles',
            'cons': 'Suppose continuité temporelle'
        },
        'constant': {
            'name': 'Valeur constante',
            'description': 'Remplace par une valeur par défaut (0 ou "Unknown")',
            'use_case': 'Quand manque signifie "non applicable"',
            'pros': 'Simple, explicite',
            'cons': 'Peut créer des patterns artificiels'
        }
    }
    return descriptions.get(strategy, {})


def get_all_strategies_info() -> Dict[str, Dict[str, str]]:
    """Retourne toutes les stratégies disponibles avec descriptions"""
    strategies = [
        'drop_rows', 'drop_column', 'mean', 'median',
        'mode', 'forward_fill', 'constant'
    ]
    return {s: get_strategy_description(s) for s in strategies}
