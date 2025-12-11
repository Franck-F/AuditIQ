"""
Routeur pour l'entraînement automatique de modèles ML et l'upload de prédictions
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path
import pandas as pd
import io

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Dataset
from auth_middleware import get_current_user
from services.ml_training import train_model_on_dataset

router = APIRouter(prefix="/api/ml", tags=["ml"])
UPLOAD_DIR = Path("uploads")

# Pydantic Models
class AutoTrainRequest(BaseModel):
    target_column: str
    feature_columns: Optional[List[str]] = None  # Si None, utilise toutes les colonnes sauf target
    algorithm: Optional[str] = None  # 'logistic_regression' ou 'xgboost'. Si None, choix auto selon use_case
    use_case: Optional[str] = None  # Pour choix automatique de l'algorithme

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
            
            # Charger le fichier
            file_path = UPLOAD_DIR / dataset.filename
            if not file_path.exists():
                print(f"File {file_path} not found")
                return
            
            # Lire le fichier
            if dataset.mime_type == 'text/csv':
                df = pd.read_csv(file_path, encoding=dataset.encoding)
            else:
                df = pd.read_excel(file_path)
            
            print(f"Training model for dataset {dataset_id}...")
            print(f"  Target: {config['target_column']}")
            print(f"  Algorithm: {config.get('algorithm', 'auto')}")
            print(f"  Use case: {config.get('use_case', 'unknown')}")
            
            # Entraîner le modèle
            df_with_predictions, metrics = train_model_on_dataset(
                df=df,
                target_column=config['target_column'],
                feature_columns=config.get('feature_columns'),
                algorithm=config.get('algorithm'),
                use_case=config.get('use_case')
            )
            
            # Sauvegarder le fichier avec prédictions
            if dataset.mime_type == 'text/csv':
                df_with_predictions.to_csv(file_path, index=False, encoding=dataset.encoding)
            else:
                df_with_predictions.to_excel(file_path, index=False)
            
            # Mettre à jour les métadonnées du dataset
            dataset.has_predictions = True
            dataset.prediction_column = 'ml_prediction'
            dataset.probability_column = 'ml_probability'
            dataset.model_type = 'auto_trained'
            dataset.model_algorithm = metrics['algorithm']
            dataset.model_metrics = metrics
            
            await db.commit()
            
            print(f"✓ Model trained successfully for dataset {dataset_id}")
            print(f"  Test Accuracy: {metrics['test_accuracy']:.3f}")
            print(f"  Test F1: {metrics['test_f1']:.3f}")
            
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
    
    Le modèle sera choisi automatiquement selon le use_case :
    - scoring, recrutement → LogisticRegression
    - support_client, prediction → XGBoost
    """
    # Vérifier que le dataset existe et appartient à l'utilisateur
    stmt = select(Dataset).where(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Vérifier que le fichier existe
    file_path = UPLOAD_DIR / dataset.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found")
    
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
        "dataset_id": dataset_id,
        "algorithm": request.algorithm or f"auto (based on use_case: {request.use_case})"
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

@router.post("/datasets/{dataset_id}/upload-predictions")
async def upload_predictions(
    dataset_id: int,
    predictions_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload un fichier CSV contenant les prédictions pré-calculées
    
    Le fichier doit contenir les colonnes :
    - prediction (obligatoire)
    - probability (optionnel)
    """
    # Vérifier le dataset
    stmt = select(Dataset).where(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Lire le fichier de prédictions
    content = await predictions_file.read()
    try:
        pred_df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")
    
    # Vérifier colonnes requises
    if 'prediction' not in pred_df.columns:
        raise HTTPException(status_code=400, detail="Predictions file must contain 'prediction' column")
    
    # Charger le dataset original
    file_path = UPLOAD_DIR / dataset.filename
    if dataset.mime_type == 'text/csv':
        original_df = pd.read_csv(file_path, encoding=dataset.encoding)
    else:
        original_df = pd.read_excel(file_path)
    
    # Vérifier même nombre de lignes
    if len(pred_df) != len(original_df):
        raise HTTPException(
            status_code=400,
            detail=f"Predictions file must have same number of rows as dataset ({len(original_df)} rows)"
        )
    
    # Ajouter colonnes au dataset original
    original_df['ml_prediction'] = pred_df['prediction']
    if 'probability' in pred_df.columns:
        original_df['ml_probability'] = pred_df['probability']
    
    # Sauvegarder
    if dataset.mime_type == 'text/csv':
        original_df.to_csv(file_path, index=False, encoding=dataset.encoding)
    else:
        original_df.to_excel(file_path, index=False)
    
    # Mettre à jour métadonnées
    dataset.has_predictions = True
    dataset.prediction_column = 'ml_prediction'
    dataset.probability_column = 'ml_probability' if 'probability' in pred_df.columns else None
    dataset.model_type = 'uploaded'
    dataset.model_algorithm = 'user_provided'
    dataset.model_metrics = None
    
    await db.commit()
    
    return {
        "message": "Predictions uploaded successfully",
        "rows": len(pred_df),
        "has_probability": 'probability' in pred_df.columns
    }
