# Auto EDA - Configuration du Scheduler & Alertes

## Vue d'Ensemble

Le module Auto EDA inclut un système de planification automatique qui exécute des analyses nocturnes et envoie des alertes en cas d'anomalies critiques ou importantes.

## Configuration

### 1. Variables d'Environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```bash
# SMTP Email (pour alertes critiques)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_FROM_EMAIL=your-email@gmail.com

# Slack Webhook (pour toutes les alertes)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Configuration Scheduler
EDA_SCHEDULER_ENABLED=true
EDA_NIGHTLY_HOUR=3
EDA_TIMEZONE=Europe/Paris
```

### 2. Configuration Gmail (SMTP)

Pour utiliser Gmail comme serveur SMTP :

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez dans Paramètres Google → Sécurité
   - Sélectionnez "Mots de passe des applications"
   - Créez un nouveau mot de passe pour "Mail"
3. Utilisez ce mot de passe dans `SMTP_PASSWORD`

### 3. Configuration Slack

Pour recevoir des alertes sur Slack :

1. Créez une application Slack : https://api.slack.com/apps
2. Activez les "Incoming Webhooks"
3. Créez un nouveau webhook pour votre canal
4. Copiez l'URL du webhook dans `SLACK_WEBHOOK_URL`

## Fonctionnement

### Analyse Nocturne

- **Heure d'exécution** : 3h00 du matin (configurable via `EDA_NIGHTLY_HOUR`)
- **Fréquence** : Quotidienne
- **Cibles** : Toutes les sources de données actives

**Processus :**
1. Récupération des sources actives
2. Chargement des données
3. Détection d'anomalies
4. Analyse des causes profondes
5. Génération du rapport matinal
6. Envoi d'alertes si nécessaire

### Système d'Alertes

#### Alertes Critiques (severity: critical)
- **Canaux** : Email + Slack
- **Déclenchement** : Anomalies avec `severity='critical'`
- **Format** : Rapport complet avec top 3 anomalies

#### Alertes Importantes (severity: high)
- **Canaux** : Slack uniquement
- **Déclenchement** : Anomalies avec `severity='high'`
- **Format** : Résumé avec recommandations

## Gestion du Scheduler

### Démarrage Automatique

Le scheduler démarre automatiquement avec l'application :

```python
# Dans audit_iq_backend/__init__.py
@app.on_event("startup")
async def on_startup():
    from services.eda.scheduler import eda_scheduler
    eda_scheduler.start()
```

### Arrêt Propre

Le scheduler s'arrête proprement lors de l'arrêt de l'application :

```python
@app.on_event("shutdown")
async def on_shutdown():
    from services.eda.scheduler import eda_scheduler
    eda_scheduler.stop()
```

### Exécution Manuelle

Pour tester le scheduler manuellement :

```python
from services.eda.scheduler import eda_scheduler
import asyncio

# Exécuter l'analyse nocturne immédiatement
asyncio.run(eda_scheduler.run_nightly_analysis())
```

## Logs

Le scheduler génère des logs détaillés :

```
📅 EDA Scheduler started - Nightly analysis at 3:00 AM
🌙 Starting nightly EDA analysis...
Found 3 active data sources
Analyzing source: Sales Data (ID: 1)
✅ Analysis 42 completed - 5 anomalies found
🚨 Sending CRITICAL alert for source: Sales Data
✅ Email sent: 🚨 ALERTE CRITIQUE - Auto EDA: Sales Data
✅ Slack notification sent
✅ Nightly EDA analysis completed
```

## Troubleshooting

### Le scheduler ne démarre pas

**Vérifications :**
- Assurez-vous que `apscheduler` est installé : `pip install apscheduler>=3.10.0`
- Vérifiez les logs au démarrage de l'application
- Confirmez que `EDA_SCHEDULER_ENABLED=true`

### Les emails ne sont pas envoyés

**Vérifications :**
- Testez la connexion SMTP : `telnet smtp.gmail.com 587`
- Vérifiez les credentials SMTP dans `.env`
- Consultez les logs pour les erreurs SMTP
- Pour Gmail, assurez-vous d'utiliser un mot de passe d'application

### Les notifications Slack échouent

**Vérifications :**
- Testez le webhook manuellement avec `curl` :
  ```bash
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Test"}' \
    YOUR_WEBHOOK_URL
  ```
- Vérifiez que l'URL du webhook est correcte
- Assurez-vous que le webhook est actif dans Slack

### Les analyses ne s'exécutent pas

**Vérifications :**
- Vérifiez qu'il existe des sources de données actives (`is_active=True`)
- Consultez les logs pour les erreurs d'analyse
- Testez manuellement une analyse via l'API

## Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS le fichier `.env` avec vos credentials
- Utilisez des mots de passe d'application pour Gmail
- Limitez les permissions du webhook Slack
- Chiffrez les credentials en production

## Prochaines Améliorations

- [ ] Persistance des jobs (redémarrage)
- [ ] Configuration des seuils d'alerte par source
- [ ] Support de Microsoft Teams
- [ ] Dashboard de monitoring du scheduler
- [ ] Historique des alertes envoyées
