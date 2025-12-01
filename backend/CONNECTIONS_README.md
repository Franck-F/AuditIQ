# Module de Connexions de Données (F2.2)

## Vue d'ensemble

Ce module implémente les fonctionnalités F2.2.1 à F2.2.4 permettant de connecter des sources de données externes à AuditIQ.

## Fonctionnalités

### F2.2.1 : Connecteur API REST générique
- Support OAuth2, API Key, Basic Auth
- Configuration flexible (URL, méthode HTTP, headers, body)
- Test de connexion avant création

### F2.2.2 : Connecteurs natifs
- ✅ Google Sheets (OAuth2 / Service Account)
- ✅ API REST générique
- 🚧 Salesforce (à implémenter)
- 🚧 Workday (à implémenter)
- 🚧 BambooHR (à implémenter)
- 🚧 HubSpot (à implémenter)
- 🚧 Pipedrive (à implémenter)

### F2.2.3 : Sécurité
- Chiffrement des credentials avec Fernet (cryptography)
- Stockage sécurisé dans PostgreSQL
- Credentials jamais exposés dans les réponses API

### F2.2.4 : Synchronisation automatique
- Synchronisation manuelle via bouton
- Configuration de synchronisation automatique (quotidienne/hebdomadaire)
- Historique complet des synchronisations
- Gestion des erreurs avec logging détaillé

## Architecture

### Backend

```
backend/
├── connectors/
│   ├── __init__.py
│   ├── base.py              # Classe abstraite BaseConnector
│   ├── rest_api.py          # Connecteur API REST générique
│   └── google_sheets.py     # Connecteur Google Sheets
├── models/
│   └── data_connection.py   # Modèles DataConnection & SyncHistory
├── routers/
│   └── connections.py       # API endpoints
└── migrate_connections.py   # Script de migration DB
```

### Frontend

```
app/
└── dashboard/
    └── connections/
        └── page.tsx         # Interface de gestion des connexions
```

## API Endpoints

### GET /api/connections/types
Liste tous les types de connexions disponibles avec leurs configurations requises.

**Réponse:**
```json
[
  {
    "type": "rest_api",
    "name": "API REST",
    "description": "Connecteur générique pour API REST",
    "required_fields": ["url", "method"],
    "auth_types": ["api_key", "oauth2", "basic", "none"],
    "icon": "api"
  }
]
```

### POST /api/connections/test
Teste une connexion avant de la créer.

**Corps:**
```json
{
  "connection_type": "rest_api",
  "config": {
    "url": "https://api.example.com/data",
    "method": "GET"
  },
  "credentials": {
    "auth_type": "api_key",
    "api_key": "YOUR_API_KEY"
  }
}
```

### POST /api/connections/
Crée une nouvelle connexion.

**Corps:**
```json
{
  "connection_type": "rest_api",
  "name": "Mon API CRM",
  "config": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "data_path": "results"
  },
  "credentials": {
    "auth_type": "api_key",
    "api_key": "YOUR_API_KEY"
  },
  "auto_sync_enabled": false
}
```

### GET /api/connections/
Liste toutes les connexions de l'utilisateur.

### POST /api/connections/{id}/sync
Lance une synchronisation manuelle.

**Corps:**
```json
{
  "save_as_dataset": true,
  "dataset_name": "Données CRM"
}
```

### GET /api/connections/{id}/history
Récupère l'historique des synchronisations.

### DELETE /api/connections/{id}
Supprime une connexion.

## Exemples d'utilisation

### Connecteur API REST

```python
# Configuration
config = {
    "url": "https://api.example.com/customers",
    "method": "GET",
    "data_path": "data",  # Chemin vers les données dans la réponse JSON
    "params": {"limit": 1000}
}

credentials = {
    "auth_type": "api_key",
    "key_name": "X-API-Key",
    "api_key": "YOUR_API_KEY",
    "key_prefix": ""
}
```

### Connecteur Google Sheets

```python
# Configuration
config = {
    "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "worksheet_name": "Sheet1"
}

credentials = {
    "service_account_json": {
        "type": "service_account",
        "project_id": "your-project",
        "private_key_id": "key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\n...",
        "client_email": "your-sa@project.iam.gserviceaccount.com"
    }
}
```

## Dépendances

```
gspread              # Google Sheets API
oauth2client         # OAuth2 authentication
cryptography         # Chiffrement des credentials
httpx                # HTTP client asynchrone
```

## Installation

1. Installer les dépendances:
```bash
pip install -r requirements.txt
```

2. Exécuter la migration:
```bash
python migrate_connections.py
```

3. Démarrer le serveur:
```bash
uvicorn audit_iq_backend:app --reload
```

## Sécurité

- Les credentials sont chiffrés avec Fernet avant stockage
- La clé de chiffrement doit être stockée dans une variable d'environnement `ENCRYPTION_KEY`
- Les credentials ne sont jamais retournés dans les réponses API
- Authentification requise pour tous les endpoints

## Roadmap

- [ ] Implémenter Salesforce connector
- [ ] Implémenter Workday connector
- [ ] Implémenter BambooHR connector
- [ ] Implémenter HubSpot connector
- [ ] Implémenter Pipedrive connector
- [ ] Ajouter la synchronisation automatique programmée (cron jobs)
- [ ] Ajouter la détection automatique de schéma
- [ ] Ajouter la validation des données lors de la sync
- [ ] Ajouter des webhooks pour notifier les synchronisations

## Tests

```bash
# Tester le connecteur API REST
python -m pytest tests/test_rest_api_connector.py

# Tester le connecteur Google Sheets
python -m pytest tests/test_google_sheets_connector.py
```
