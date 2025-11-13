# Configuration de l'Authentification Audit-IQ

## Prérequis

L'authentification Better Auth nécessite une base de données PostgreSQL. Vous devez configurer une base de données avant de pouvoir utiliser les fonctionnalités d'inscription et de connexion.

## Configuration Rapide

### 1. Base de Données PostgreSQL (OBLIGATOIRE)

#### Option A : PostgreSQL Local
\`\`\`bash
# Installation sur Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE audit_iq;
CREATE USER audit_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE audit_iq TO audit_user;
\q
\`\`\`

#### Option B : Services Cloud (Recommandé)
- **Neon** : https://neon.tech (Gratuit, rapide à configurer)
- **Supabase** : https://supabase.com (Gratuit + fonctionnalités supplémentaires)
- **Railway** : https://railway.app
- **Vercel Postgres** : https://vercel.com/storage/postgres

### 2. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

\`\`\`bash
cp .env.example .env.local
\`\`\`

Modifiez `.env.local` avec vos valeurs :

\`\`\`env
# REQUIS : Votre URL de connexion PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/audit_iq

# REQUIS : Secret pour Better Auth (min 32 caractères)
# Générez avec: openssl rand -base64 32
BETTER_AUTH_SECRET=votre_secret_genere_ici

# URL de base (en développement)
BETTER_AUTH_URL=http://localhost:3000
\`\`\`

### 3. Initialisation de la Base de Données

\`\`\`bash
# Installer les dépendances
pnpm install

# Générer les migrations Drizzle
pnpm drizzle-kit generate

# Appliquer les migrations
pnpm drizzle-kit push
\`\`\`

### 4. Démarrer l'Application

\`\`\`bash
pnpm dev
\`\`\`

Vous pouvez maintenant vous inscrire sur http://localhost:3000/sign-up

## Configuration OAuth (Optionnel)

### Google OAuth

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet ou sélectionnez-en un
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URI de redirection autorisés :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.com/api/auth/callback/google` (production)
6. Copiez Client ID et Client Secret dans `.env.local`

\`\`\`env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
\`\`\`

### GitHub OAuth

1. Allez sur https://github.com/settings/developers
2. Cliquez "New OAuth App"
3. Remplissez :
   - Application name: Audit-IQ
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Créez l'app et générez un Client Secret
5. Copiez Client ID et Client Secret dans `.env.local`

\`\`\`env
GITHUB_CLIENT_ID=votre_client_id
GITHUB_CLIENT_SECRET=votre_client_secret
\`\`\`

## Scripts Drizzle Utiles

\`\`\`bash
# Voir la base de données dans le navigateur
pnpm drizzle-kit studio

# Générer de nouvelles migrations après modification du schéma
pnpm drizzle-kit generate

# Appliquer les migrations
pnpm drizzle-kit push
\`\`\`

## Dépannage

### Erreur "Failed to fetch"
- Vérifiez que PostgreSQL est bien démarré
- Vérifiez que DATABASE_URL est correct dans `.env.local`
- Vérifiez que les migrations ont été appliquées avec `pnpm drizzle-kit push`

### Erreur "relation does not exist"
- Exécutez `pnpm drizzle-kit push` pour créer les tables

### OAuth ne fonctionne pas
- Vérifiez que les URIs de redirection sont correctement configurés
- Vérifiez que les Client ID et Secret sont corrects
- OAuth est optionnel, l'authentification email/password fonctionne sans

## Mode Production

Pour déployer sur Vercel :

1. Configurez une base de données PostgreSQL (Neon, Supabase, etc.)
2. Ajoutez les variables d'environnement dans Vercel Dashboard
3. Mettez à jour BETTER_AUTH_URL avec votre domaine production
4. Générez un nouveau BETTER_AUTH_SECRET pour la production
5. Mettez à jour les URIs de redirection OAuth avec votre domaine

\`\`\`env
BETTER_AUTH_URL=https://votre-domaine.vercel.app
