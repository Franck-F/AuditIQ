"""
Routeur pour l'upload et la gestion des datasets
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import chardet
import hashlib
import io
import os
from pathlib import Path
from utils.proxy_detection import (
    detect_proxy_variables,
    format_proxy_report,
    get_proxy_explanation
)
from utils.dataset_processing import detect_encoding, get_column_info, detect_column_types
from utils.anonymization import apply_anonymization, get_anonymization_methods
from utils.missing_values import analyze_missing_values, handle_missing_values, get_all_strategies_info
from services.supabase_storage import storage_service
from services.dataset_service import dataset_service
from models.user import User
from models.dataset import Dataset, Audit
from db import AsyncSessionLocal
from auth_middleware import get_current_user

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = {
    'freemium': 10_000,  # 10k lignes
    'pro': 100_000,      # 100k lignes
    'enterprise': 1_000_000  # 1M lignes
}
ALLOWED_MIME_TYPES = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
]


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic models
class DatasetConfigRequest(BaseModel):
    """Configuration de l'audit pour un dataset"""
    use_case: str
    target_column: str
    sensitive_attributes: List[str]
    fairness_metrics: Optional[List[str]] = []
    proxy_variables: Optional[List[str]] = []
    anonymization_method: Optional[str] = None
    missing_values_strategy: Optional[Dict[str, str]] = {}  # {column: strategy}


class MissingValuesRequest(BaseModel):
    """Options de traitement des valeurs manquantes"""
    strategy: Dict[str, str]  # {column_name: 'drop'|'mean'|'median'|'mode'|'forward_fill'|'constant'}


class DatasetPreview(BaseModel):
    dataset_id: int
    filename: str
    row_count: int
    column_count: int
    columns_info: List[Dict[str, Any]]
    preview_data: List[Dict[str, Any]]
    encoding: str
    file_size: int
    missing_values: Dict[str, int]
    detected_types: Dict[str, str]


class DatasetInfo(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    row_count: int
    column_count: int
    status: str
    encoding: str
    created_at: datetime
    use_case: Optional[str] = None
    anonymized: bool



@router.post("/file", response_model=DatasetPreview)
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    F2.1.1 à F2.1.7: Upload d'un fichier CSV/Excel avec validation et prévisualisation
    """
    
    print(f"📤 UPLOAD: filename={file.filename}, content_type={file.content_type}")
    
    # F2.1.2: Validation du type MIME
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier non autorisé. Formats acceptés: CSV, Excel. Reçu: {file.content_type}"
        )
    
    # Lire le contenu du fichier
    content = await file.read()
    file_size = len(content)
    
    # F2.1.4: Détection automatique de l'encodage
    encoding = detect_encoding(content)
    
    # Calcul du hash SHA256 pour identification
    file_hash = calculate_file_hash(content)
    
    # Lire le fichier avec pandas
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), encoding=encoding, nrows=None)
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(content), nrows=None)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format de fichier non supporté"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERREUR LECTURE FICHIER: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la lecture du fichier: {str(e)}"
        )
    
    # F2.1.3: Vérifier la limite de lignes selon le plan
    user_plan = current_user.plan or 'freemium'
    max_rows = MAX_FILE_SIZE.get(user_plan, 10_000)
    
    if len(df) > max_rows:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Limite dépassée. Votre plan {user_plan} autorise {max_rows:,} lignes maximum. "
                   f"Ce fichier contient {len(df):,} lignes."
        )
    
    # F2.1.7: Gestion des valeurs manquantes
    missing_values = {col: int(df[col].isnull().sum()) for col in df.columns}
    
    # F2.1.5: Prévisualisation des 50 premières lignes
    preview_data = df.head(50).fillna('').to_dict('records')
    
    dataset = await dataset_service.create_dataset_from_df(
        db=db,
        df=df,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        original_filename=file.filename,
        mime_type=file.content_type,
        encoding=encoding
    )
    
    # Extraire les infos de colonnes depuis le dataset créé
    columns_info = dataset.columns_info.get('columns', []) if isinstance(dataset.columns_info, dict) else dataset.columns_info

    return DatasetPreview(
        dataset_id=dataset.id,
        filename=dataset.original_filename,
        row_count=dataset.row_count,
        column_count=dataset.column_count,
        columns_info=columns_info,
        preview_data=preview_data,
        encoding=dataset.encoding,
        file_size=dataset.file_size,
        missing_values=missing_values,
        detected_types=column_types
    )


@router.get("/datasets", response_model=List[DatasetInfo])
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste tous les datasets de l'utilisateur ou de son organisation"""
    if current_user.organization_id:
        stmt = select(Dataset).where(
            Dataset.organization_id == current_user.organization_id
        ).order_by(Dataset.created_at.desc())
    else:
        stmt = select(Dataset).where(
            Dataset.user_id == current_user.id
        ).order_by(Dataset.created_at.desc())
    
    result = await db.execute(stmt)
    datasets = result.scalars().all()
    
    return [
        DatasetInfo(
            id=d.id,
            filename=d.original_filename,
            original_filename=d.original_filename,
            file_size=d.file_size,
            row_count=d.row_count,
            column_count=d.column_count,
            status=d.status,
            encoding=d.encoding,
            created_at=d.created_at,
            use_case=d.use_case,
            anonymized=d.anonymized
        )
        for d in datasets
    ]


@router.get("/datasets/{dataset_id}")
async def get_dataset_details(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les détails d'un dataset avec prévisualisation des données"""
    if current_user.organization_id:
        stmt = select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.organization_id == current_user.organization_id
        )
    else:
        stmt = select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id
        )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    # Charger le fichier pour obtenir preview_data
    preview_data = []
    content = None
    
    # Tenter de charger depuis Supabase d'abord
    if storage_service.is_available():
        content = await storage_service.download_file(dataset.filename)
    
    # Sinon charger depuis le disque local
    if content is None:
        file_path = UPLOAD_DIR / dataset.filename
        if file_path.exists():
            with open(file_path, 'rb') as f:
                content = f.read()
    
    if content:
        try:
            # Lire le contenu
            if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(content), encoding=dataset.encoding)
            else:
                df = pd.read_excel(io.BytesIO(content))
            
            # Prévisualisation des 50 premières lignes
            preview_data = df.head(50).fillna('').to_dict('records')
        except Exception as e:
            print(f"Erreur lors du chargement du fichier: {e}")
    
    return {
        'id': dataset.id,
        'filename': dataset.original_filename,
        'file_size': dataset.file_size,
        'row_count': dataset.row_count,
        'column_count': dataset.column_count,
        'columns_info': dataset.columns_info,
        'preview_data': preview_data,  # Ajouté pour le refresh
        'status': dataset.status,
        'encoding': dataset.encoding,
        'use_case': dataset.use_case,
        'target_column': dataset.target_column,
        'sensitive_attributes': dataset.sensitive_attributes,
        'proxy_variables': dataset.proxy_variables,
        'anonymized': dataset.anonymized,
        'created_at': dataset.created_at,
        'retention_date': dataset.retention_date
    }


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprime un dataset"""
    if current_user.organization_id:
        # Seul l'admin ou le propriétaire peut supprimer ? 
        # Pour l'instant, check organisation simple
        stmt = select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.organization_id == current_user.organization_id
        )
    else:
        stmt = select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id
        )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    # Supprimer du stockage Supabase
    if storage_service.is_available():
        await storage_service.delete_file(dataset.filename)
    
    # Supprimer le fichier physique local (si existant)
    file_path = UPLOAD_DIR / dataset.filename
    if file_path.exists():
        file_path.unlink()
    
    # Supprimer de la base de données
    await db.delete(dataset)
    await db.commit()
    
    return {"message": "Dataset supprimé avec succès"}


@router.put("/datasets/{dataset_id}/configure")
async def configure_dataset(
    dataset_id: int,
    config: DatasetConfigRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Configure un dataset pour l'audit de fairness"""
    if current_user.organization_id:
        stmt = select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.organization_id == current_user.organization_id
        )
    else:
        stmt = select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id
        )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    # Extraire la liste des colonnes depuis columns_info
    columns_list = dataset.columns_info.get('columns', []) if isinstance(dataset.columns_info, dict) else dataset.columns_info
    
    # Validation de la variable cible
    if config.target_column not in [col['name'] for col in columns_list]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La colonne '{config.target_column}' n'existe pas dans le dataset"
        )
    
    # Validation des attributs sensibles
    for attr in config.sensitive_attributes:
        if attr not in [col['name'] for col in columns_list]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"L'attribut sensible '{attr}' n'existe pas dans le dataset"
            )
    
    # Validation de la méthode d'anonymisation
    if config.anonymization_method:
        valid_methods = ['hash', 'pseudonym', 'suppression', 'generalization']
        if config.anonymization_method not in valid_methods:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Méthode d'anonymisation invalide. Méthodes supportées : {valid_methods}"
            )
    
    # Appliquer l'anonymisation si demandée
    if config.anonymization_method and config.sensitive_attributes:
        try:
            # Charger le fichier original (filename contient déjà le chemin complet)
            file_path = Path(dataset.filename)
            if file_path.exists():
                # Déterminer le type de fichier et charger
                if dataset.mime_type == 'text/csv':
                    df = pd.read_csv(file_path, encoding=dataset.encoding)
                else:
                    df = pd.read_excel(file_path)
                
                # Appliquer l'anonymisation
                column_types = {col['name']: col['type'] for col in columns_list}
                df_anonymized = apply_anonymization(
                    df,
                    config.sensitive_attributes,
                    config.anonymization_method,
                    column_types
                )
                
                # Sauvegarder le fichier anonymisé (remplace l'original)
                if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
                    new_content = df_anonymized.to_csv(index=False, encoding=dataset.encoding).encode(dataset.encoding)
                else:
                    output = io.BytesIO()
                    df_anonymized.to_excel(output, index=False)
                    new_content = output.getvalue()
                
                if storage_service.is_available():
                    await storage_service.upload_file(dataset.filename, new_content, dataset.mime_type)
                else:
                    file_path = UPLOAD_DIR / dataset.filename
                    with open(file_path, 'wb') as f:
                        f.write(new_content)
                
                # Marquer comme anonymisé
                dataset.anonymized = True
                dataset.anonymization_method = config.anonymization_method
        
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de l'anonymisation : {str(e)}"
            )
    
    # Mettre à jour la configuration dans la base de données
    dataset.use_case = config.use_case
    dataset.target_column = config.target_column
    dataset.sensitive_attributes = config.sensitive_attributes
    dataset.proxy_variables = config.proxy_variables if config.proxy_variables else []
    dataset.status = 'ready'  # Prêt pour l'audit
    dataset.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(dataset)
    
    return {
        "message": "Configuration enregistrée avec succès",
        "dataset_id": dataset.id,
        "use_case": dataset.use_case,
        "target_column": dataset.target_column,
        "sensitive_attributes": dataset.sensitive_attributes,
        "fairness_metrics": config.fairness_metrics,
        "proxy_variables": dataset.proxy_variables,
        "status": dataset.status,
        "anonymized": dataset.anonymized,
        "anonymization_method": dataset.anonymization_method
    }


@router.get("/anonymization-methods")
async def get_anonymization_methods_endpoint():
    """
    Récupère les méthodes d'anonymisation disponibles
    """
    return get_anonymization_methods()


@router.get("/datasets/{dataset_id}/missing-values")
async def get_missing_values_analysis(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.1.7: Analyse détaillée des valeurs manquantes d'un dataset
    Retourne les statistiques et recommandations de traitement
    """
    stmt = select(Dataset).where(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    # Récupérer le contenu du fichier
    content = None
    if storage_service.is_available():
        content = await storage_service.download_file(dataset.filename)
    
    if content is None:
        file_path = UPLOAD_DIR / dataset.filename
        if file_path.exists():
            with open(file_path, 'rb') as f:
                content = f.read()
    
    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier dataset introuvable"
        )
    
    # Lire le fichier
    if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(content), encoding=dataset.encoding)
    else:
        df = pd.read_excel(io.BytesIO(content))
    
    # Analyser les valeurs manquantes
    missing_analysis = analyze_missing_values(df)
    
    # Récupérer toutes les stratégies disponibles
    strategies_info = get_all_strategies_info()
    
    return {
        "dataset_id": dataset_id,
        "filename": dataset.original_filename,
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "missing_analysis": missing_analysis,
        "has_missing_values": len(missing_analysis) > 0,
        "columns_with_missing": list(missing_analysis.keys()),
        "available_strategies": strategies_info
    }


@router.post("/datasets/{dataset_id}/handle-missing-values")
async def apply_missing_values_treatment(
    dataset_id: int,
    request: MissingValuesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.1.7: Applique les stratégies de traitement des valeurs manquantes
    """
    stmt = select(Dataset).where(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    # Charger le fichier
    file_path = UPLOAD_DIR / dataset.filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier dataset introuvable"
        )
    
    try:
        # Lire le fichier
        if dataset.mime_type == 'text/csv':
            df = pd.read_csv(file_path, encoding=dataset.encoding)
        else:
            df = pd.read_excel(file_path)
        
        # Appliquer le traitement
        df_clean = handle_missing_values(df, request.strategy)
        
        # Sauvegarder le fichier nettoyé (Supabase ou Local)
        if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
            new_content = df_clean.to_csv(index=False, encoding=dataset.encoding).encode(dataset.encoding)
        else:
            output = io.BytesIO()
            df_clean.to_excel(output, index=False)
            new_content = output.getvalue()
        
        if storage_service.is_available():
            await storage_service.upload_file(dataset.filename, new_content, dataset.mime_type)
        else:
            file_path = UPLOAD_DIR / dataset.filename
            with open(file_path, 'wb') as f:
                f.write(new_content)
        
        # Mettre à jour les statistiques
        dataset.row_count = len(df_clean)
        dataset.column_count = len(df_clean.columns)
        dataset.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(dataset)
        
        # Re-analyser
        missing_analysis = analyze_missing_values(df_clean)
        
        return {
            "message": "Traitement des valeurs manquantes appliqué avec succès",
            "dataset_id": dataset_id,
            "rows_before": len(df),
            "rows_after": len(df_clean),
            "rows_removed": len(df) - len(df_clean),
            "columns_before": len(df.columns),
            "columns_after": len(df_clean.columns),
            "remaining_missing": missing_analysis,
            "strategies_applied": request.strategy
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement : {str(e)}"
        )


@router.get("/missing-values/strategies")
async def get_missing_values_strategies():
    """
    F2.1.7: Récupère toutes les stratégies disponibles avec descriptions
    """
    return get_all_strategies_info()


@router.get("/datasets/{dataset_id}/detect-proxies")
async def detect_proxy_variables_endpoint(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.3.3: Détecte automatiquement les variables proxy corrélées 
    aux attributs sensibles (corrélation > 0.7)
    
    Retourne les variables proxy détectées avec:
    - Coefficient de corrélation
    - Méthode de calcul utilisée
    - Niveau de risque
    - Recommandations
    """
    stmt = select(Dataset).where(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    if not dataset.sensitive_attributes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun attribut sensible configuré."
        )
    
    # Charger le contenu du fichier
    content = None
    if storage_service.is_available():
        content = await storage_service.download_file(dataset.filename)
    
    if content is None:
        file_path = UPLOAD_DIR / dataset.filename
        if file_path.exists():
            with open(file_path, 'rb') as f:
                content = f.read()
    
    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier dataset introuvable"
        )
    
    try:
        # Lire le fichier
        if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), encoding=dataset.encoding)
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Détecter les variables proxy
        proxy_results = detect_proxy_variables(
            df,
            dataset.sensitive_attributes,
            correlation_threshold=0.7
        )
        
        # Mettre à jour la base avec les proxies détectées
        all_proxies = []
        for attr, proxies in proxy_results.items():
            all_proxies.extend([p['column'] for p in proxies])
        
        dataset.proxy_variables = list(set(all_proxies))
        await db.commit()
        await db.refresh(dataset)
        
        # Formater le rapport
        report = format_proxy_report(proxy_results)
        
        return {
            "message": "Détection des variables proxy terminée",
            "dataset_id": dataset_id,
            "sensitive_attributes": dataset.sensitive_attributes,
            "correlation_threshold": 0.7,
            **report,
            "explanations": {
                method: get_proxy_explanation(method)
                for method in set(
                    p['method'] for proxies in proxy_results.values() 
                    for p in proxies
                )
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la détection : {str(e)}"
        )
