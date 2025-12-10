# Audit-IQ - Plateforme SaaS d'Audit de Fairness

<div align="center">

![Audit-IQ Logo](public/logo.png)

**Garantissez la conformité et l'équité de vos algorithmes décisionnels.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Code Style: Black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[Documentation](https://docs.audit-iq.com) • [Demo](https://demo.audit-iq.com) • [Signaler un Bug](https://github.com/Franck-F/AuditIQ/issues)

</div>

---

## 📋 À Propos

**Audit-IQ** est une solution SaaS complète conçue pour aider les entreprises à auditer leurs modèles d'intelligence artificielle. En conformité avec l'**AI Act** et le **RGPD**, notre plateforme permet de détecter, mesurer et atténuer les biais algorithmiques pour garantir des décisions justes et transparentes.

## 🚀 Fonctionnalités Clés

| Fonctionnalité | Description |
| :--- | :--- |
| **📊 Dashboard Intuitif** | Visualisez les performances et les métriques de fairness en temps réel. |
| **🔍 Audit de Fairness** | Calcul automatique de métriques (Demographic Parity, Equal Opportunity, etc.). |
| **🤖 Auto EDA** | Analyse exploratoire automatique avec détection d'anomalies et rapports matinaux. |
| **⚖️ Conformité AI Act** | Génération de rapports détaillés pour répondre aux exigences réglementaires. |
| **🛡️ Sécurité & Privacy** | Anonymisation des données et conformité RGPD native. |
| **📈 Détection de Biais** | Identification proactive des biais dans vos datasets et modèles. |
| **🔔 Alertes Intelligentes** | Notifications email et Slack pour anomalies critiques. |
| **👥 Gestion d'Équipe** | Collaboration facilitée avec gestion fine des permissions. |

## 🛠️ Stack Technique

### 🎨 Frontend (Client)
*   **Framework** : ![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white) (App Router)
*   **Langage** : ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
*   **Styling** : ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
*   **Composants UI** : ![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-000000?style=flat-square&logo=shadcnui&logoColor=white) (Radix UI)
*   **Animations** : Framer Motion, GSAP
*   **État & Formulaires** : Zustand, React Hook Form, Zod
*   **Visualisation** : Recharts
*   **HTTP Client** : Axios

### ⚙️ Backend (Server)
*   **Framework** : ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
*   **Langage** : ![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
*   **Base de Données** : ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) (via Supabase)
*   **ORM** : SQLAlchemy (Async) + Asyncpg
*   **Authentification** : JWT (PyJWT), OAuth2, Bcrypt
*   **Data Science & IA** :
    *   Pandas, NumPy (Traitement de données)
    *   Scikit-learn (Machine Learning)
    *   Fairlearn (Audit de biais)
    *   SciPy, Statsmodels (Analyse statistique EDA)
    *   Google Gemini AI (Génération de recommandations)
*   **Automation** : APScheduler (Analyses nocturnes)
*   **Alerting** : SMTP (Email), Slack Webhooks
*   **Reporting** : ReportLab (PDF), OpenPyXL (Excel)
*   **Sécurité** : Slowapi (Rate Limiting), CORS middleware

### 🚀 Déploiement & DevOps
*   **Frontend** : ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white) (CI/CD automatique)
*   **Backend** : ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white) (Dockerized)
*   **Conteneurisation** : ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
*   **Base de Données** : Supabase (Managed PostgreSQL)

## 🏗️ Architecture

```mermaid
graph TD
    User[Utilisateur] -->|HTTPS| Frontend[Next.js App]
    Frontend -->|API REST| Backend[FastAPI Backend]
    Backend -->|Auth| DB[(PostgreSQL)]
    Backend -->|Cache| Redis[(Redis)]
    Backend -->|ML Processing| ML[Fairness Engine]
    ML -->|Metrics| Backend
```

## ⚡ Installation Rapide

### Prérequis
*   Node.js 18+
*   Python 3.10+
*   npm ou yarn

### 1. Frontend

```bash
cd app
npm install
npm run dev
# Accessible sur http://localhost:3000
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# API accessible sur http://localhost:8000
# Docs: http://localhost:8000/docs
```

## ⚙️ Configuration

Créez les fichiers `.env` nécessaires :

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (`backend/.env`)**
```env
SECRET_KEY=votre_cle_secrete
DATABASE_URL=postgresql://user:pass@localhost/auditiq
```

## 📚 Documentation API

L'API est documentée automatiquement via Swagger UI. Une fois le backend lancé, visitez :
`http://localhost:8000/docs`

Principaux endpoints :
*   `/api/auth/*` : Authentification
*   `/api/audits/*` : Gestion des audits
*   `/api/eda/*` : Auto EDA (sources, analyses, rapports)
*   `/api/reports/*` : Génération de rapports

### 🤖 Module Auto EDA

Le module Auto EDA offre une analyse exploratoire automatique avec :
- **Détection d'anomalies** : Tests statistiques robustes (IQR, Z-score, ANOVA)
- **Analyse des causes** : Corrélations et identification des facteurs
- **Rapports automatiques** : Génération nocturne à 3h du matin
- **Alertes intelligentes** : Email (critiques) et Slack (importantes)

Configuration : Voir `backend/docs/EDA_SCHEDULER.md`

## 🤝 Contribuer

Les contributions sont les bienvenues ! Veuillez consulter notre [Guide de Contribution](CONTRIBUTING.md) pour commencer.

1.  Forkez le projet
2.  Créez votre branche (`git checkout -b feature/AmazingFeature`)
3.  Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4.  Pushez vers la branche (`git push origin feature/AmazingFeature`)
5.  Ouvrez une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

<div align="center">
  <p>Développé par Franck-F</p>
</div>
