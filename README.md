# Audit-IQ - Plateforme SaaS d'Audit de Fairness

Audit-IQ est une plateforme complète permettant aux PME d'auditer leurs algorithmes décisionnels et de garantir la conformité avec l'AI Act et le RGPD.

## Architecture du Projet

\`\`\`
audit-iq/
├── frontend/                 # Application Next.js
│   ├── app/                 # Pages et routes
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Authentification
│   │   ├── signup/
│   │   └── dashboard/      # Interface principale
│   │       ├── page.tsx    # Dashboard
│   │       ├── audits/     # Gestion des audits
│   │       ├── upload/     # Upload de données
│   │       ├── reports/    # Rapports
│   │       ├── compliance/ # Conformité
│   │       ├── team/       # Gestion d'équipe
│   │       └── settings/   # Paramètres
│   ├── components/
│   │   ├── ui/             # Composants UI (shadcn)
│   │   └── dashboard/      # Composants dashboard
│   └── lib/                # Utilitaires
│
└── backend/                 # API FastAPI
    ├── main.py             # Point d'entrée
    ├── models/             # Modèles Pydantic
    ├── services/           # Logique métier
    │   ├── fairness/      # Calculs de fairness
    │   ├── auth/          # Authentification
    │   └── reports/       # Génération rapports
    └── requirements.txt    # Dépendances Python
\`\`\`

## Fonctionnalités Principales

### Frontend (Next.js 16)
- Landing page moderne avec design inspiré de Pinecone
- Système d'authentification complet (login/signup/forgot-password)
- Dashboard interactif avec KPIs et statistiques
- Module d'upload de données (drag & drop, CSV/Excel)
- Interface d'audit avec métriques de fairness détaillées
- Visualisations interactives des biais
- Génération de rapports de conformité (AI Act, RGPD)
- Gestion d'équipe et permissions
- Dark mode natif

### Backend (FastAPI)
- API REST complète
- Authentification JWT
- Upload et traitement de datasets
- Calcul de métriques de fairness :
  - Demographic Parity
  - Equal Opportunity
  - Equalized Odds
  - Predictive Parity
- Détection automatique de biais
- Génération de recommandations
- Rapports de conformité
- Anonymisation RGPD

## Installation

### Prérequis
- Node.js 18+
- Python 3.10+
- npm ou yarn

### Frontend

\`\`\`bash
# Installation des dépendances
npm install

# Lancement en développement
npm run dev

# Build pour production
npm run build
npm start
\`\`\`

Le frontend sera accessible sur `http://localhost:3000`

### Backend

\`\`\`bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
cd backend
pip install -r requirements.txt

# Lancer le serveur
python main.py
# ou
uvicorn main:app --reload
\`\`\`

L'API sera accessible sur `http://localhost:8000`

Documentation API : `http://localhost:8000/docs`

## Technologies Utilisées

### Frontend
- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styling moderne
- **shadcn/ui** - Composants UI
- **Lucide Icons** - Icônes
- **Recharts** - Visualisations
- **React Hook Form** - Gestion de formulaires

### Backend
- **FastAPI** - Framework API Python moderne
- **Pandas** - Manipulation de données
- **NumPy** - Calculs numériques
- **Scikit-learn** - Machine Learning
- **FairLearn** - Métriques de fairness
- **AIF360** - Audit de fairness avancé
- **PyJWT** - Authentification JWT
- **Bcrypt** - Hashing de mots de passe

## Configuration

### Variables d'Environnement

Créer un fichier `.env.local` à la racine du frontend :

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

Créer un fichier `.env` dans le dossier backend :

\`\`\`env
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost/auditiq
REDIS_URL=redis://localhost:6379
\`\`\`

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Audits
- `GET /api/audits` - Liste des audits
- `GET /api/audits/{id}` - Détails d'un audit
- `POST /api/audits/create` - Créer un audit
- `GET /api/audits/{id}/recommendations` - Recommandations

### Données
- `POST /api/data/upload` - Upload de dataset
- `GET /api/data/{id}` - Récupérer un dataset

### Rapports
- `GET /api/reports/generate/{audit_id}` - Générer un rapport
- `GET /api/reports/{id}/download` - Télécharger un rapport

### Conformité
- `GET /api/compliance/status` - État de conformité global

## Métriques de Fairness

### Demographic Parity
Mesure si les décisions sont distribuées équitablement entre les groupes.
\`\`\`
P(Ŷ=1|A=a) ≈ P(Ŷ=1|A=b)
\`\`\`

### Equal Opportunity
Vérifie l'égalité des taux de vrais positifs entre groupes.
\`\`\`
P(Ŷ=1|Y=1,A=a) ≈ P(Ŷ=1|Y=1,A=b)
\`\`\`

### Equalized Odds
Garantit l'égalité des TPR et FPR entre groupes.

### Predictive Parity
Assure que la précision des prédictions positives est similaire.

## Conformité Réglementaire

### AI Act (Règlement européen sur l'IA)
- Article 10 : Transparence et documentation
- Article 13 : Gouvernance des données
- Article 14 : Enregistrement des activités
- Article 15 : Précision et robustesse

### RGPD
- Article 22 : Décisions automatisées
- Article 5 : Minimisation des données
- Article 25 : Privacy by design
- Article 32 : Sécurité du traitement

## Sécurité

- Chiffrement AES-256 des données au repos
- TLS 1.3 pour les données en transit
- Authentification JWT avec refresh tokens
- Hashing bcrypt pour les mots de passe
- Anonymisation automatique des données sensibles
- Suppression automatique après 30 jours
- Logs d'audit complets

## Contribution

Ce projet est un prototype démontrant les capacités d'une plateforme d'audit de fairness.
Pour une utilisation en production, des améliorations sont nécessaires :

- Base de données PostgreSQL
- Cache Redis
- File d'attente Celery pour traitements longs
- Stockage S3 pour les fichiers
- Monitoring (Sentry, DataDog)
- Tests unitaires et d'intégration
- CI/CD Pipeline
- Documentation API complète

## Licence

MIT License - voir LICENSE

## Support

Pour toute question ou support :
- Email : support@audit-iq.com
- Documentation : https://docs.audit-iq.com

---

Développé avec ❤️ pour garantir l'équité des algorithmes IA
