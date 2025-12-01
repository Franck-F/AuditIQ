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
| **⚖️ Conformité AI Act** | Génération de rapports détaillés pour répondre aux exigences réglementaires. |
| **🛡️ Sécurité & Privacy** | Anonymisation des données et conformité RGPD native. |
| **📈 Détection de Biais** | Identification proactive des biais dans vos datasets et modèles. |
| **👥 Gestion d'Équipe** | Collaboration facilitée avec gestion fine des permissions. |

## 🛠️ Stack Technique

### Frontend
-   ![Next.js](https://img.shields.io/badge/-Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white) **Framework React**
-   ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) **Typage Statique**
-   ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) **Styling**
-   ![Shadcn/UI](https://img.shields.io/badge/-Shadcn/UI-000000?style=flat-square&logo=shadcnui&logoColor=white) **Composants UI**

### Backend
-   ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) **API Framework**
-   ![Python](https://img.shields.io/badge/-Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white) **Langage**
-   ![Pandas](https://img.shields.io/badge/-Pandas-150458?style=flat-square&logo=pandas&logoColor=white) **Data Processing**
-   ![Scikit-Learn](https://img.shields.io/badge/-Scikit_Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white) **Machine Learning**

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
*   `/api/reports/*` : Génération de rapports

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
  <p>Développé avec ❤️ par Franck-F</p>
</div>
