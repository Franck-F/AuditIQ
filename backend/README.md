# Audit-IQ Backend

Backend FastAPI pour la plateforme Audit-IQ d'audit d'équité IA.

## Installation avec uv

Ce projet utilise [uv](https://github.com/astral-sh/uv) pour la gestion des dépendances Python, offrant des installations ultra-rapides.

### Installation de uv

\`\`\`bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Ou avec pip
pip install uv
\`\`\`

### Installation du projet

\`\`\`bash
# Créer un environnement virtuel et installer les dépendances
uv venv
source .venv/bin/activate  # Sur Windows: .venv\Scripts\activate
uv pip install -e .

# Ou directement avec uv sync
uv sync
\`\`\`

### Mise à niveau des packages

\`\`\`bash
# Mettre à jour tous les packages
uv pip compile pyproject.toml -o requirements.txt --upgrade

# Installer les mises à jour
uv pip install -r requirements.txt

# Ou directement
uv pip install --upgrade fastapi uvicorn pandas numpy
\`\`\`

## Démarrage

\`\`\`bash
# Avec uv run (recommandé)
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ou dans l'environnement virtuel
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

L'API sera accessible sur http://localhost:8000
Documentation interactive : http://localhost:8000/docs

## Structure

\`\`\`
backend/
├── main.py              # Point d'entrée FastAPI
├── pyproject.toml       # Configuration uv et dépendances
├── requirements.txt     # Généré par uv pour compatibilité
└── .env                 # Variables d'environnement (à créer)
\`\`\`

## Variables d'environnement

Créez un fichier `.env` :

\`\`\`env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./audit_iq.db
ENVIRONMENT=development
