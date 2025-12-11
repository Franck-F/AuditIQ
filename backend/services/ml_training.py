"""
Service d'entraînement automatique de modèles ML pour les audits de fairness

Supporte :
- LogisticRegression (cas d'usage : scoring, recrutement)
- XGBoost (cas d'usage : prédiction complexe, support client)
"""

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
import pandas as pd
import numpy as np
from typing import Dict, Tuple, Optional, List
import warnings
warnings.filterwarnings('ignore')

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("Warning: XGBoost not installed. Only LogisticRegression will be available.")


class AutoMLTrainer:
    """
    Entraîne automatiquement un modèle ML sur les données
    
    Choix automatique de l'algorithme selon le cas d'usage :
    - scoring, recrutement → LogisticRegression (interprétable, rapide)
    - support_client, prediction → XGBoost (plus performant, gère non-linéarités)
    """
    
    # Mapping cas d'usage → algorithme recommandé
    USE_CASE_ALGORITHM_MAP = {
        'scoring': 'logistic_regression',
        'recrutement': 'logistic_regression',
        'recruitment': 'logistic_regression',
        'credit': 'logistic_regression',
        'support_client': 'xgboost',
        'customer_support': 'xgboost',
        'prediction': 'xgboost',
        'other': 'logistic_regression'  # Par défaut
    }
    
    def __init__(self, algorithm: Optional[str] = None, use_case: Optional[str] = None):
        """
        Args:
            algorithm: 'logistic_regression' ou 'xgboost'. Si None, choisi automatiquement selon use_case
            use_case: Cas d'usage pour choisir l'algorithme automatiquement
        """
        if algorithm:
            self.algorithm = algorithm
        elif use_case:
            self.algorithm = self.USE_CASE_ALGORITHM_MAP.get(use_case.lower(), 'logistic_regression')
        else:
            self.algorithm = 'logistic_regression'
        
        # Vérifier disponibilité XGBoost
        if self.algorithm == 'xgboost' and not XGBOOST_AVAILABLE:
            print("XGBoost not available, falling back to LogisticRegression")
            self.algorithm = 'logistic_regression'
        
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        
    def detect_problem_type(self, y: pd.Series) -> str:
        """Détecte si classification binaire, multi-classe ou régression"""
        unique_values = y.nunique()
        if unique_values == 2:
            return 'binary_classification'
        elif unique_values < 20:
            return 'multiclass_classification'
        else:
            return 'regression'
    
    def preprocess_features(self, X: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """
        Prétraite les features :
        - Encode les variables catégorielles
        - Normalise les variables numériques
        """
        X_processed = X.copy()
        
        for col in X_processed.columns:
            if X_processed[col].dtype == 'object':
                # Encoder les catégorielles
                if fit:
                    self.label_encoders[col] = LabelEncoder()
                    X_processed[col] = self.label_encoders[col].fit_transform(X_processed[col].astype(str))
                else:
                    X_processed[col] = self.label_encoders[col].transform(X_processed[col].astype(str))
        
        # Normaliser
        if fit:
            X_normalized = self.scaler.fit_transform(X_processed)
        else:
            X_normalized = self.scaler.transform(X_processed)
        
        return X_normalized
    
    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        """
        Entraîne le modèle
        
        Returns:
            Dict avec métriques de performance
        """
        problem_type = self.detect_problem_type(y)
        
        if problem_type == 'regression':
            raise ValueError("Regression not supported for fairness audits. Target must be categorical.")
        
        # Sauvegarder noms des features
        self.feature_names = X.columns.tolist()
        
        # Prétraiter features
        X_processed = self.preprocess_features(X, fit=True)
        
        # Encoder target si nécessaire
        if y.dtype == 'object':
            self.target_encoder = LabelEncoder()
            y_encoded = self.target_encoder.fit_transform(y)
        else:
            y_encoded = y.values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Choisir et configurer le modèle
        if self.algorithm == 'logistic_regression':
            self.model = LogisticRegression(
                max_iter=1000,
                random_state=42,
                class_weight='balanced'  # Gère les classes déséquilibrées
            )
        elif self.algorithm == 'xgboost':
            self.model = XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                use_label_encoder=False,
                eval_metric='logloss'
            )
        
        # Entraîner
        print(f"Training {self.algorithm} on {len(X_train)} samples...")
        self.model.fit(X_train, y_train)
        
        # Évaluer
        y_pred_train = self.model.predict(X_train)
        y_pred_test = self.model.predict(X_test)
        
        # Calculer métriques
        average = 'binary' if problem_type == 'binary_classification' else 'weighted'
        
        metrics = {
            'train_accuracy': float(accuracy_score(y_train, y_pred_train)),
            'test_accuracy': float(accuracy_score(y_test, y_pred_test)),
            'train_f1': float(f1_score(y_train, y_pred_train, average=average)),
            'test_f1': float(f1_score(y_test, y_pred_test, average=average)),
            'precision': float(precision_score(y_test, y_pred_test, average=average)),
            'recall': float(recall_score(y_test, y_pred_test, average=average)),
            'algorithm': self.algorithm,
            'problem_type': problem_type,
            'n_features': len(self.feature_names),
            'n_samples': len(X)
        }
        
        print(f"✓ Model trained successfully!")
        print(f"  Test Accuracy: {metrics['test_accuracy']:.3f}")
        print(f"  Test F1: {metrics['test_f1']:.3f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Génère prédictions et probabilités
        
        Returns:
            (predictions, probabilities)
        """
        if self.model is None:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Prétraiter
        X_processed = self.preprocess_features(X, fit=False)
        
        # Prédire
        predictions = self.model.predict(X_processed)
        
        # Décoder si nécessaire
        if hasattr(self, 'target_encoder'):
            predictions = self.target_encoder.inverse_transform(predictions)
        
        # Probabilités
        probabilities = None
        if hasattr(self.model, 'predict_proba'):
            proba = self.model.predict_proba(X_processed)
            # Pour binaire, prendre proba de la classe positive
            if proba.shape[1] == 2:
                probabilities = proba[:, 1]
            else:
                # Pour multi-classe, prendre max proba
                probabilities = np.max(proba, axis=1)
        
        return predictions, probabilities


def train_model_on_dataset(
    df: pd.DataFrame,
    target_column: str,
    feature_columns: Optional[List[str]] = None,
    algorithm: Optional[str] = None,
    use_case: Optional[str] = None
) -> Tuple[pd.DataFrame, Dict[str, float]]:
    """
    Fonction helper pour entraîner un modèle sur un dataset complet
    
    Args:
        df: DataFrame avec les données
        target_column: Nom de la colonne cible
        feature_columns: Liste des colonnes features (si None, utilise toutes sauf target)
        algorithm: 'logistic_regression' ou 'xgboost'
        use_case: Cas d'usage pour choix auto de l'algorithme
    
    Returns:
        (df_with_predictions, metrics)
    """
    # Préparer features
    if feature_columns is None:
        feature_columns = [col for col in df.columns if col != target_column]
    
    X = df[feature_columns]
    y = df[target_column]
    
    # Entraîner
    trainer = AutoMLTrainer(algorithm=algorithm, use_case=use_case)
    metrics = trainer.train(X, y)
    
    # Générer prédictions sur tout le dataset
    predictions, probabilities = trainer.predict(X)
    
    # Ajouter au DataFrame
    df_result = df.copy()
    df_result['ml_prediction'] = predictions
    if probabilities is not None:
        df_result['ml_probability'] = probabilities
    
    return df_result, metrics
