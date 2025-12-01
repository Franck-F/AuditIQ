# Documentation F2.3: Mapping des Données

## Vue d'ensemble

Les fonctionnalités F2.3 permettent de configurer et mapper les données avant l'audit:

- **F2.3.1**: Identification de la colonne cible (target) ✅
- **F2.3.2**: Sélection des attributs sensibles ✅
- **F2.3.3**: Détection automatique des variables proxy ✅ **NOUVEAU**
- **F2.3.4**: Mapping colonnes personnalisé ✅ **NOUVEAU**
- **F2.3.5**: Templates mapping réutilisables ✅ **NOUVEAU**

---

## F2.3.3: Détection Automatique des Variables Proxy

### Endpoint

```
GET /api/upload/datasets/{dataset_id}/detect-proxies
```

### Description

Détecte automatiquement les variables corrélées aux attributs sensibles avec un seuil de corrélation > 0.7.

### Méthodes de corrélation utilisées

- **Pearson**: Pour deux variables numériques (corrélation linéaire)
- **Cramér's V**: Pour deux variables catégorielles
- **Correlation Ratio (eta)**: Pour une variable numérique et une catégorielle

### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/upload/datasets/1/detect-proxies" \
  -H "Cookie: access_token=YOUR_TOKEN"
```

### Réponse

```json
{
  "message": "Détection des variables proxy terminée",
  "dataset_id": 1,
  "sensitive_attributes": ["gender", "age"],
  "correlation_threshold": 0.7,
  "total_proxies": 3,
  "high_risk_count": 1,
  "by_attribute": {
    "gender": [
      {
        "column": "job_title",
        "correlation": 0.85,
        "method": "cramers_v",
        "risk_level": "high"
      }
    ],
    "age": [
      {
        "column": "years_experience",
        "correlation": 0.92,
        "method": "pearson",
        "risk_level": "high"
      }
    ]
  },
  "recommendations": [
    {
      "type": "warning",
      "attribute": "gender",
      "message": "⚠️ 1 variable(s) fortement corrélée(s) à 'gender' détectée(s)",
      "action": "Considérez exclure ces variables du modèle ou appliquer une anonymisation"
    }
  ],
  "explanations": {
    "cramers_v": "V de Cramér : mesure d'association entre deux variables catégorielles",
    "pearson": "Corrélation linéaire entre deux variables numériques"
  }
}
```

### Niveaux de risque

- **high**: Corrélation >= 0.85 (risque élevé de biais indirect)
- **medium**: Corrélation >= 0.7 et < 0.85

---

## F2.3.4: Mapping Colonnes Personnalisé

### Endpoint

```
POST /api/mapping/datasets/{dataset_id}/apply-mapping
```

### Description

Renomme les colonnes d'un dataset pour assurer la compatibilité avec les modèles standard.

### Body

```json
{
  "template_id": 1,  // OU
  "custom_mappings": {
    "nom": "employee_name",
    "age": "employee_age",
    "salaire": "salary"
  }
}
```

### Exemple de requête

```bash
curl -X POST "http://localhost:8000/api/mapping/datasets/1/apply-mapping" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{
    "custom_mappings": {
      "nom": "name",
      "age": "employee_age"
    }
  }'
```

### Réponse

```json
{
  "message": "Mapping appliqué avec succès",
  "dataset_id": 1,
  "mappings_applied": {
    "nom": "name",
    "age": "employee_age"
  },
  "columns_renamed": 2,
  "new_columns": ["name", "employee_age", "salary", "department"]
}
```

---

## F2.3.5: Templates Mapping Réutilisables

### 1. Créer un template

```
POST /api/mapping/templates
```

**Body:**

```json
{
  "name": "Template RH Standard",
  "description": "Mapping standard pour données RH",
  "use_case": "recruitment",
  "column_mappings": {
    "nom": {
      "mapped_name": "employee_name",
      "expected_type": "string",
      "description": "Nom de l'employé"
    },
    "age": {
      "mapped_name": "employee_age",
      "expected_type": "number",
      "description": "Âge de l'employé"
    }
  },
  "default_target_column": "hired",
  "default_sensitive_attributes": ["gender", "employee_age"]
}
```

**Réponse:**

```json
{
  "message": "Template créé avec succès",
  "template": {
    "id": 1,
    "name": "Template RH Standard",
    "description": "Mapping standard pour données RH",
    "use_case": "recruitment"
  }
}
```

### 2. Lister les templates

```
GET /api/mapping/templates?use_case=recruitment
```

**Réponse:**

```json
{
  "templates": [
    {
      "id": 1,
      "name": "Template RH Standard",
      "description": "Mapping standard pour données RH",
      "use_case": "recruitment",
      "column_mappings": {...},
      "usage_count": 5,
      "created_at": "2024-01-15T10:00:00"
    }
  ]
}
```

### 3. Récupérer un template

```
GET /api/mapping/templates/{template_id}
```

### 4. Mettre à jour un template

```
PUT /api/mapping/templates/{template_id}
```

**Body:**

```json
{
  "name": "Nouveau nom",
  "column_mappings": {...}
}
```

### 5. Supprimer un template

```
DELETE /api/mapping/templates/{template_id}
```

---

## Workflow complet

### 1. Upload d'un dataset

```bash
# Upload fichier CSV
curl -X POST "http://localhost:8000/api/upload/datasets" \
  -F "file=@data.csv"
```

### 2. Configuration initiale (F2.3.1 & F2.3.2)

```bash
curl -X POST "http://localhost:8000/api/upload/datasets/1/configure" \
  -H "Content-Type: application/json" \
  -d '{
    "use_case": "recruitment",
    "target_column": "hired",
    "sensitive_attributes": ["gender", "age"],
    "fairness_metrics": ["demographic_parity"]
  }'
```

### 3. Détection des variables proxy (F2.3.3)

```bash
curl -X GET "http://localhost:8000/api/upload/datasets/1/detect-proxies"
```

### 4. Application d'un mapping (F2.3.4)

```bash
# Option A: Utiliser un template existant
curl -X POST "http://localhost:8000/api/mapping/datasets/1/apply-mapping" \
  -d '{"template_id": 1}'

# Option B: Mapping personnalisé
curl -X POST "http://localhost:8000/api/mapping/datasets/1/apply-mapping" \
  -d '{
    "custom_mappings": {
      "nom": "name",
      "age": "employee_age"
    }
  }'
```

### 5. Sauvegarder comme template (F2.3.5)

```bash
curl -X POST "http://localhost:8000/api/mapping/templates" \
  -d '{
    "name": "Mon Template",
    "column_mappings": {...}
  }'
```

---

## Modèles de données

### MappingTemplate

```python
{
  "id": int,
  "user_id": int,
  "name": str,
  "description": str | None,
  "use_case": str | None,
  "column_mappings": {
    "original_name": {
      "mapped_name": str,
      "expected_type": "string" | "number" | "date" | "boolean",
      "description": str
    }
  },
  "default_target_column": str | None,
  "default_sensitive_attributes": list[str],
  "usage_count": int,
  "created_at": datetime,
  "updated_at": datetime | None
}
```

### Dataset (champs ajoutés)

```python
{
  ...
  "column_mappings": dict | None,  # Mappings appliqués
  "mapping_template_id": int | None,  # Template utilisé
  "proxy_variables": list[str]  # Variables proxy détectées
}
```

---

## Tests

Exécutez le script de test complet:

```bash
cd backend
python test_mapping_features.py
```

---

## Cas d'usage typiques

### Cas 1: Dataset RH avec colonnes non standardisées

```json
// Données originales: "Nom", "Âge", "Genre"
// Mapping vers: "name", "age", "gender"

{
  "custom_mappings": {
    "Nom": "name",
    "Âge": "age",
    "Genre": "gender"
  }
}
```

### Cas 2: Détection automatique de proxy gender

```
gender → job_title (0.85) → ALERTE
gender → department (0.72) → Avertissement
```

### Cas 3: Template réutilisable pour scoring crédit

```json
{
  "name": "Template Scoring Crédit",
  "column_mappings": {
    "revenu_mensuel": {
      "mapped_name": "monthly_income",
      "expected_type": "number"
    },
    "historique_credit": {
      "mapped_name": "credit_score",
      "expected_type": "number"
    }
  },
  "default_target_column": "credit_approved",
  "default_sensitive_attributes": ["age", "gender"]
}
```

---

## Erreurs courantes

### Erreur 400: Aucun attribut sensible configuré

```json
{
  "detail": "Aucun attribut sensible configuré. Veuillez d'abord configurer les attributs sensibles."
}
```

**Solution**: Appelez d'abord `/datasets/{id}/configure` avec `sensitive_attributes`.

### Erreur 404: Template introuvable

```json
{
  "detail": "Template introuvable"
}
```

**Solution**: Vérifiez que le `template_id` existe et appartient à l'utilisateur.

### Erreur 400: Template déjà existant

```json
{
  "detail": "Un template nommé 'Mon Template' existe déjà"
}
```

**Solution**: Choisissez un nom unique ou mettez à jour le template existant avec `PUT`.

---

## Dépendances Python

Les nouvelles fonctionnalités nécessitent:

```
pandas
numpy
scipy  # Pour chi2_contingency dans Cramér's V
```

Installez avec:

```bash
pip install scipy
```

---

## Performance

### Détection proxy

- **Temps**: ~1-5 secondes pour 10 000 lignes
- **Complexité**: O(n × m) où n = lignes, m = colonnes
- **Optimisation**: Échantillonnage automatique pour datasets > 50 000 lignes

### Application mapping

- **Temps**: ~0.5-2 secondes pour renommer colonnes
- **Impact**: Sauvegarde du fichier avec nouveaux noms
- **Réversible**: Non (sauvegardez avant si nécessaire)

---

## Roadmap

### Améliorations futures

- [ ] Validation automatique des types après mapping
- [ ] Suggestions de mapping basées sur l'IA
- [ ] Templates communautaires partagés
- [ ] Historique des mappings appliqués
- [ ] Détection proxy avec seuil configurable
- [ ] Export des résultats de détection proxy en CSV

---

## Support

Pour toute question sur les fonctionnalités F2.3:

1. Consultez `/docs` (Swagger UI) pour tester les endpoints
2. Exécutez `test_mapping_features.py` pour des exemples
3. Vérifiez les logs backend pour les erreurs détaillées
