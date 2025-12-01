"""
Fonctions d'anonymisation RGPD pour les datasets
"""
import hashlib
import pandas as pd
from typing import List, Dict, Any
import string
import random


def anonymize_hash(value: str) -> str:
    """
    Anonymisation par hachage SHA256
    Irréversible et déterministe
    """
    if pd.isna(value) or value == '':
        return ''
    return hashlib.sha256(str(value).encode()).hexdigest()[:16]


def anonymize_pseudonym(value: str, column_name: str) -> str:
    """
    Anonymisation par pseudonyme
    Génère un pseudonyme cohérent basé sur le hash
    """
    if pd.isna(value) or value == '':
        return ''
    
    # Utiliser le hash pour générer un ID unique
    hash_val = hashlib.sha256(str(value).encode()).hexdigest()
    numeric_id = int(hash_val[:8], 16) % 100000
    
    # Générer un pseudonyme selon le type de colonne
    if 'name' in column_name.lower() or 'nom' in column_name.lower():
        return f"User_{numeric_id}"
    elif 'email' in column_name.lower():
        return f"user{numeric_id}@example.com"
    elif 'id' in column_name.lower():
        return f"ID_{numeric_id}"
    else:
        return f"Anon_{numeric_id}"


def anonymize_suppression(value: str) -> str:
    """
    Anonymisation par suppression
    Remplace par ***
    """
    if pd.isna(value) or value == '':
        return ''
    return '***'


def anonymize_generalization(value: Any, column_type: str) -> str:
    """
    Anonymisation par généralisation
    Réduit la précision des données
    """
    if pd.isna(value):
        return ''
    
    # Pour les âges : groupes de 10 ans
    if column_type == 'age' or 'age' in str(column_type).lower():
        try:
            age = int(value)
            age_group = (age // 10) * 10
            return f"{age_group}-{age_group + 9}"
        except:
            return str(value)
    
    # Pour les dates : année seulement
    elif 'date' in str(column_type).lower():
        try:
            return str(value)[:4]
        except:
            return str(value)
    
    # Pour les codes postaux : 2 premiers chiffres
    elif 'postal' in str(column_type).lower() or 'zip' in str(column_type).lower():
        try:
            return str(value)[:2] + 'XXX'
        except:
            return str(value)
    
    return str(value)


def apply_anonymization(
    df: pd.DataFrame,
    sensitive_columns: List[str],
    method: str = 'hash',
    column_types: Dict[str, str] = None
) -> pd.DataFrame:
    """
    Applique l'anonymisation sur un DataFrame
    
    Args:
        df: DataFrame à anonymiser
        sensitive_columns: Liste des colonnes sensibles à anonymiser
        method: Méthode d'anonymisation ('hash', 'pseudonym', 'suppression', 'generalization')
        column_types: Types des colonnes pour la généralisation
    
    Returns:
        DataFrame anonymisé (copie)
    """
    df_anonymized = df.copy()
    
    for col in sensitive_columns:
        if col not in df_anonymized.columns:
            continue
        
        if method == 'hash':
            df_anonymized[col] = df_anonymized[col].apply(anonymize_hash)
        
        elif method == 'pseudonym':
            df_anonymized[col] = df_anonymized[col].apply(
                lambda x: anonymize_pseudonym(x, col)
            )
        
        elif method == 'suppression':
            df_anonymized[col] = df_anonymized[col].apply(anonymize_suppression)
        
        elif method == 'generalization':
            col_type = column_types.get(col, '') if column_types else ''
            df_anonymized[col] = df_anonymized[col].apply(
                lambda x: anonymize_generalization(x, col_type)
            )
    
    return df_anonymized


def get_anonymization_methods() -> Dict[str, Dict[str, str]]:
    """
    Retourne les méthodes d'anonymisation disponibles
    """
    return {
        'hash': {
            'name': 'Hachage (SHA256)',
            'description': 'Transformation irréversible en hash cryptographique',
            'reversible': False,
            'use_case': 'Données sensibles nécessitant une anonymisation forte'
        },
        'pseudonym': {
            'name': 'Pseudonymisation',
            'description': 'Remplacement par des pseudonymes cohérents',
            'reversible': False,
            'use_case': 'Identifiants, noms, emails - maintient la cohérence'
        },
        'suppression': {
            'name': 'Suppression',
            'description': 'Remplacement par ***',
            'reversible': False,
            'use_case': 'Données très sensibles à masquer complètement'
        },
        'generalization': {
            'name': 'Généralisation',
            'description': 'Réduction de la précision (âges en tranches, etc.)',
            'reversible': False,
            'use_case': 'Données numériques, dates, codes postaux'
        }
    }
