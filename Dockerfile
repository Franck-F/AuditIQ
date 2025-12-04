# Utiliser une image Python légère
FROM python:3.10-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY backend/requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code du backend
COPY backend/ .

# Exposer le port (Render utilise la variable d'environnement PORT)
ENV PORT=10000
EXPOSE $PORT

# Commande de démarrage
# On utilise sh -c pour permettre l'expansion de la variable $PORT
CMD ["sh", "-c", "uvicorn audit_iq_backend:app --host 0.0.0.0 --port ${PORT}"]
