import pandas as pd
import chardet
import hashlib
from typing import Dict, List, Any
import io

def detect_encoding(file_content: bytes) -> str:
    """Détecte l'encodage du fichier"""
    result = chardet.detect(file_content)
    encoding = result['encoding']
    
    # Normaliser les encodages communs
    if encoding and encoding.lower() in ['ascii', 'utf-8', 'utf8']:
        return 'utf-8'
    elif encoding and 'iso-8859' in encoding.lower():
        return 'iso-8859-1'
    
    return encoding or 'utf-8'


def calculate_file_hash(content: bytes) -> str:
    """Calcule le hash SHA256 du fichier"""
    return hashlib.sha256(content).hexdigest()


def detect_column_types(df: pd.DataFrame) -> Dict[str, str]:
    """Détecte automatiquement les types de colonnes"""
    column_types = {}
    
    for col in df.columns:
        dtype = df[col].dtype
        
        # Essayer de détecter les dates
        if dtype == 'object':
            try:
                pd.to_datetime(df[col].dropna().head(100))
                column_types[col] = 'date'
                continue
            except:
                pass
        
        # Classification par type pandas
        if pd.api.types.is_numeric_dtype(dtype):
            if pd.api.types.is_integer_dtype(dtype):
                column_types[col] = 'numeric_integer'
            else:
                column_types[col] = 'numeric_float'
        elif pd.api.types.is_bool_dtype(dtype):
            column_types[col] = 'boolean'
        elif pd.api.types.is_categorical_dtype(dtype) or df[col].nunique() < 20:
            column_types[col] = 'categorical'
        else:
            column_types[col] = 'text'
    
    return column_types


def get_column_info(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Extrait les informations détaillées sur chaque colonne"""
    columns_info = []
    column_types = detect_column_types(df)
    
    for col in df.columns:
        null_count = df[col].isnull().sum()
        unique_count = df[col].nunique()
        
        info = {
            'name': col,
            'type': column_types[col],
            'null_count': int(null_count),
            'null_percentage': float(null_count / len(df) * 100),
            'unique_count': int(unique_count),
            'sample_values': df[col].dropna().head(5).tolist() if unique_count < 100 else []
        }
        
        # Ajouter des stats pour les colonnes numériques
        if column_types[col] in ['numeric_integer', 'numeric_float']:
            try:
                info['min'] = float(df[col].min()) if not pd.isna(df[col].min()) else None
                info['max'] = float(df[col].max()) if not pd.isna(df[col].max()) else None
                info['mean'] = float(df[col].mean()) if not pd.isna(df[col].mean()) else None
                info['median'] = float(df[col].median()) if not pd.isna(df[col].median()) else None
            except:
                pass
        
        columns_info.append(info)
    
    return columns_info
