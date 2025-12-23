from datetime import datetime, timedelta
import pandas as pd
import io
import os
from sqlalchemy.ext.asyncio import AsyncSession
from models.dataset import Dataset
from services.supabase_storage import storage_service
from utils.dataset_processing import calculate_file_hash, get_column_info
from typing import Optional, Dict, Any

class DatasetService:
    """
    Service centralisé pour la création et la gestion des datasets.
    """
    
    @staticmethod
    async def create_dataset_from_df(
        db: AsyncSession,
        df: pd.DataFrame,
        user_id: int,
        original_filename: str,
        mime_type: str = "text/csv",
        encoding: str = "utf-8",
        organization_id: Optional[int] = None,
        connection_id: Optional[int] = None
    ) -> Dataset:
        """
        Crée un dataset à partir d'un DataFrame pandas.
        Gère le stockage, le calcul des métadonnées et l'enregistrement en DB.
        """
        
        # 1. Calculer les statistiques et infos de colonnes
        row_count = len(df)
        column_count = len(df.columns)
        columns_info = get_column_info(df)
        
        # 2. Préparer le contenu pour le stockage
        if mime_type == "text/csv" or original_filename.endswith(".csv"):
            content = df.to_csv(index=False, encoding=encoding).encode(encoding)
        else:
            output = io.BytesIO()
            df.to_excel(output, index=False)
            content = output.getvalue()
            
        file_size = len(content)
        file_hash = calculate_file_hash(content)
        
        # 3. Sauvegarder dans le stockage (Supabase ou Local fallback)
        safe_filename = f"{user_id}_{datetime.utcnow().timestamp()}_{original_filename}"
        
        storage_success = False
        if storage_service.is_available():
            storage_path = await storage_service.upload_file(safe_filename, content, mime_type)
            if storage_path:
                storage_success = True
        
        if not storage_success:
            # Fallback local
            upload_dir = os.path.join("uploads")
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            local_path = os.path.join(upload_dir, safe_filename)
            with open(local_path, "wb") as f:
                f.write(content)
        
        # 4. Créer l'entrée en base de données
        dataset = Dataset(
            user_id=user_id,
            organization_id=organization_id,
            connection_id=connection_id,
            filename=safe_filename,
            original_filename=original_filename,
            file_size=file_size,
            file_hash=file_hash,
            mime_type=mime_type,
            encoding=encoding,
            row_count=row_count,
            column_count=column_count,
            columns_info={'columns': columns_info},
            status='ready',
            retention_date=datetime.utcnow() + timedelta(days=30)
        )
        
        db.add(dataset)
        await db.commit()
        await db.refresh(dataset)
        
        return dataset

    @staticmethod
    async def get_dataset_df(dataset: Dataset) -> pd.DataFrame:
        """
        Charge un dataset depuis le stockage (Supabase ou Local) et retourne un DataFrame.
        """
        content = None
        
        # 1. Tenter le téléchargement depuis Supabase
        if storage_service.is_available():
            content = await storage_service.download_file(dataset.filename)
        
        # 2. Fallback local si nécessaire
        if content is None:
            upload_dir = os.path.join("uploads")
            local_path = os.path.join(upload_dir, dataset.filename)
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    content = f.read()
        
        if content is None:
            raise FileNotFoundError(f"Dataset file {dataset.filename} not found in storage or local.")
            
        # 3. Charger en DataFrame
        if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
            return pd.read_csv(io.BytesIO(content), encoding=dataset.encoding)
        else:
            return pd.read_excel(io.BytesIO(content))

    @staticmethod
    async def save_dataset_df(dataset: Dataset, df: pd.DataFrame) -> bool:
        """
        Sauvegarde un DataFrame mis à jour dans le stockage d'origine.
        """
        # 1. Convertir le DataFrame en bytes
        if dataset.mime_type == 'text/csv' or dataset.filename.endswith('.csv'):
            content = df.to_csv(index=False, encoding=dataset.encoding).encode(dataset.encoding)
        else:
            output = io.BytesIO()
            df.to_excel(output, index=False)
            content = output.getvalue()
            
        # 2. Sauvegarder dans le stockage (Supabase et Local pour synchro)
        upload_success = False
        
        # Supabase
        if storage_service.is_available():
            path = await storage_service.upload_file(dataset.filename, content, dataset.mime_type)
            if path:
                upload_success = True
                
        # Local (toujours garder une copie locale si possible)
        upload_dir = os.path.join("uploads")
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        local_path = os.path.join(upload_dir, dataset.filename)
        try:
            with open(local_path, "wb") as f:
                f.write(content)
            if not storage_service.is_available():
                upload_success = True # Succès local si Supabase off
        except Exception as e:
            print(f"❌ Local Save Error: {e}")
            
        return upload_success

dataset_service = DatasetService()
