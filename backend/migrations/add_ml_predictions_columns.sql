-- Migration SQL pour ajouter les colonnes ML predictions au modèle Dataset
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes de prédictions ML à la table datasets
ALTER TABLE datasets
ADD COLUMN IF NOT EXISTS has_predictions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS prediction_column VARCHAR(255),
ADD COLUMN IF NOT EXISTS probability_column VARCHAR(255),
ADD COLUMN IF NOT EXISTS model_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS model_algorithm VARCHAR(100),
ADD COLUMN IF NOT EXISTS model_metrics JSONB;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN datasets.has_predictions IS 'Indique si le dataset contient des prédictions ML';
COMMENT ON COLUMN datasets.prediction_column IS 'Nom de la colonne contenant les prédictions';
COMMENT ON COLUMN datasets.probability_column IS 'Nom de la colonne contenant les probabilités';
COMMENT ON COLUMN datasets.model_type IS 'Type de modèle: uploaded ou auto_trained';
COMMENT ON COLUMN datasets.model_algorithm IS 'Algorithme utilisé: logistic_regression, xgboost, etc.';
COMMENT ON COLUMN datasets.model_metrics IS 'Métriques de performance du modèle (accuracy, F1, etc.)';

-- Créer un index sur has_predictions pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_datasets_has_predictions ON datasets(has_predictions);

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'datasets'
AND column_name IN ('has_predictions', 'prediction_column', 'probability_column', 'model_type', 'model_algorithm', 'model_metrics')
ORDER BY column_name;
