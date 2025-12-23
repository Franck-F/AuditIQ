from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import io

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset
from auth_middleware import get_current_user
from services.ml_training import train_model_on_dataset
from services.dataset_service import dataset_service

router = APIRouter(prefix="/api/ml", tags=["ml"])


# Pydantic Models
class AutoTrainRequest(BaseModel):
    target_column: str
    feature_columns: Optional[List[str]] = None
    algorithm: Optional[str] = None
    use_case: Optional[str] = None

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def train_model_background_task(dataset_id: int, config: dict):
    """Tâche d'arrière-plan pour entraîner le modèle"""
    async with AsyncSessionLocal() as db:
        try:
            # Récupérer le dataset
            stmt = select(Dataset).where(Dataset.id == dataset_id)
            result = await db.execute(stmt)
            dataset = result.scalar_one_or_none()
            
            if not dataset:
                print(f"Dataset {dataset_id} not found")
                return
            
            # Charger les données via le service (supporte Supabase/Local)
            df = await dataset_service.get_dataset_df(dataset)
            
            print(f"Training model for dataset {dataset_id}...")
            
            # Entraîner le modèle
            df_with_predictions, metrics = train_model_on_dataset(
                df=df,
                target_column=config['target_column'],
                feature_columns=config.get('feature_columns'),
                algorithm=config.get('algorithm'),
                use_case=config.get('use_case')
            )
            
            # Sauvegarder les données mises à jour via le service
            await dataset_service.save_dataset_df(dataset, df_with_predictions)
            
            # Mettre à jour les métadonnées du dataset
            dataset.has_predictions = True
            dataset.prediction_column = 'ml_prediction'
            dataset.probability_column = 'ml_probability' if 'ml_probability' in df_with_predictions.columns else None
            dataset.model_type = 'auto_trained'
            dataset.model_algorithm = metrics['algorithm']
            dataset.model_metrics = metrics
            
            await db.commit()
            print(f"✓ Model trained successfully for dataset {dataset_id}")
            
        except Exception as e:
            print(f"Error training model for dataset {dataset_id}: {e}")
            import traceback
            traceback.print_exc()

@router.post("/datasets/{dataset_id}/auto-train")
async def auto_train_model(
    dataset_id: int,
    request: AutoTrainRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lance l'entraînement automatique d'un modèle ML
    """
    # Vérifier que le dataset existe et appartient à l'utilisateur
    stmt = select(Dataset).where(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Lancer l'entraînement en arrière-plan
    config = {
        'target_column': request.target_column,
        'feature_columns': request.feature_columns,
        'algorithm': request.algorithm,
        'use_case': request.use_case
    }
    
    background_tasks.add_task(train_model_background_task, dataset_id, config)
    
    return {
        "message": "Model training started",
        "status": "training",
        "dataset_id": dataset_id
    }

@router.get("/datasets/{dataset_id}/training-status")
async def get_training_status(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère le statut de l'entraînement du modèle"""
    stmt = select(Dataset).where(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not dataset.has_predictions:
        return {
            "status": "not_started",
            "has_predictions": False
        }
    
    return {
        "status": "completed",
        "has_predictions": True,
        "model_type": dataset.model_type,
        "model_algorithm": dataset.model_algorithm,
        "model_metrics": dataset.model_metrics,
        "prediction_column": dataset.prediction_column,
        "probability_column": dataset.probability_column
    }

import chardet

@router.post("/datasets/{dataset_id}/upload-predictions")
async def upload_predictions(
    dataset_id: int,
    predictions_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload un fichier CSV contenant les prédictions pré-calculées
    """
    # Vérifier le dataset
    stmt = select(Dataset).where(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Lire le contenu pour détecter l'encodage
    content = await predictions_file.read()
    detection = chardet.detect(content)
    encoding = detection['encoding'] or 'utf-8'
    
    try:
        pred_df = pd.read_csv(io.BytesIO(content), encoding=encoding)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file or encoding ({encoding}): {str(e)}")
    
    # 1. Validation des colonnes
    if 'prediction' not in pred_df.columns:
        raise HTTPException(status_code=400, detail="Predictions file must contain 'prediction' column")
    
    # 2. Validation du nombre de lignes
    original_df = await dataset_service.get_dataset_df(dataset)
    if len(pred_df) != len(original_df):
        raise HTTPException(
            status_code=400,
            detail=f"Predictions file must have same number of rows as dataset ({len(original_df)} rows, got {len(pred_df)})"
        )
    
    # 3. Validation de la qualité des données (pas de NaN dans prediction)
    if pred_df['prediction'].isnull().any():
        nan_count = pred_df['prediction'].isnull().sum()
        raise HTTPException(status_code=400, detail=f"Prediction column contains {nan_count} missing values (NaN).")

    # 4. Validation des probabilités
    has_prob = 'probability' in pred_df.columns
    if has_prob:
        # Forcer en float et vérifier les bornes
        try:
            pred_df['probability'] = pd.to_numeric(pred_df['probability'])
            if not pred_df['probability'].between(0, 1).all():
                raise HTTPException(status_code=400, detail="Probability values must be between 0 and 1.")
        except ValueError:
            raise HTTPException(status_code=400, detail="Probability column must contain numeric values.")
    
    # 5. Intégration dans le dataset original
    original_df['ml_prediction'] = pred_df['prediction']
    if has_prob:
        original_df['ml_probability'] = pred_df['probability']
    
    # Sauvegarder via le service
    await dataset_service.save_dataset_df(dataset, original_df)
    
    # Mettre à jour métadonnées
    dataset.has_predictions = True
    dataset.prediction_column = 'ml_prediction'
    dataset.probability_column = 'ml_probability' if has_prob else None
    dataset.model_type = 'uploaded'
    dataset.model_algorithm = 'user_provided'
    dataset.model_metrics = {
        'source': 'upload',
        'encoding': encoding,
        'has_probability': has_prob,
        'unique_predictions': int(pred_df['prediction'].nunique())
    }
    
    await db.commit()
    
    return {
        "message": "Predictions uploaded successfully",
        "details": {
            "rows": len(pred_df),
            "encoding_detected": encoding,
            "has_probability": has_prob,
            "prediction_column": "ml_prediction"
        }
    }
