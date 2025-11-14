# Audit-IQ

**Détectez et corrigez les biais discriminatoires dans vos algorithmes métiers**

Application SaaS moderne permettant aux PME d'auditer leurs algorithmes de recrutement, scoring client, chatbot et recommandation produit pour détecter et corriger les biais discriminatoires.

## Démarrage Rapide

### Prérequis

- Node.js 18+ et pnpm installés
- PostgreSQL (local ou cloud)

### Installation

\`\`\`bash
# 1. Installer les dépendances
pnpm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local

# 3. Modifier .env.local avec votre base de données PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/audit_iq

# 4. Générer un secret pour Better Auth
# Sur Linux/Mac: openssl rand -base64 32
# Ajoutez-le dans BETTER_AUTH_SECRET

# 5. Initialiser la base de données
pnpm db:push

# 6. Lancer le serveur de développement
pnpm dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Configuration Base de Données

### Option 1: PostgreSQL Local

\`\`\`bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres psql
CREATE DATABASE audit_iq;
CREATE USER audit_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE audit_iq TO audit_user;
\q
\`\`\`

Votre `DATABASE_URL` sera:
\`\`\`
DATABASE_URL=postgresql://audit_user:votre_password@localhost:5432/audit_iq
\`\`\`

### Option 2: Services Cloud (Recommandé)

Services gratuits avec setup rapide:

- **Neon** (recommandé): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

Copiez simplement l'URL de connexion fournie dans `DATABASE_URL`.

## Variables d'Environnement

Fichier `.env.local` minimal requis:

\`\`\`env
# OBLIGATOIRE
DATABASE_URL=postgresql://user:password@host:5432/audit_iq
BETTER_AUTH_SECRET=votre-secret-genere-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# OPTIONNEL (OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
\`\`\`

Pour configurer OAuth, consultez [SETUP_AUTH.md](./SETUP_AUTH.md).

## Scripts Disponibles

\`\`\`bash
# Développement
pnpm dev              # Démarre le serveur de développement
pnpm build            # Build pour la production
pnpm start            # Démarre le serveur de production
pnpm lint             # Lint le code

# Base de données
pnpm db:push          # Applique le schéma à la DB (développement)
pnpm db:generate      # Génère les migrations
pnpm db:migrate       # Applique les migrations (production)
pnpm db:studio        # Interface visuelle pour la DB
\`\`\`

## Structure du Projet

\`\`\`
audit-iq/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard protégé
├── components/            # Composants React
│   ├── auth/             # Composants d'authentification
│   ├── landing/          # Composants landing page
│   └── ui/               # Composants UI (shadcn)
├── lib/                  # Utilitaires et configuration
│   ├── db/              # Schéma et connexion DB
│   ├── auth.ts          # Configuration Better Auth
│   └── auth-client.ts   # Client d'authentification
└── public/              # Assets statiques
\`\`\`

## Technologies

- **Framework**: Next.js 16 avec App Router et Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Database**: PostgreSQL avec Drizzle ORM
- **Authentication**: Better Auth (email + OAuth)
- **AI**: Vercel AI SDK
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Fonctionnalités

- Authentification complète (email, Google, GitHub)
- Gestion de compte et profil utilisateur
- Tableau de bord d'analyse des biais
- Import et analyse de données (CSV, Excel)
- Détection automatique des variables sensibles
- Visualisation des écarts statistiques
- Recommandations de correction
- Suivi temporel des améliorations
- Rapports mensuels de santé éthique

## Dépannage

### "Failed to fetch" lors de l'inscription
- Vérifiez que PostgreSQL est démarré
- Vérifiez que `DATABASE_URL` est correct dans `.env.local`
- Exécutez `pnpm db:push` pour créer les tables
- Redémarrez le serveur de dev (`pnpm dev`)

### Les tables n'existent pas
\`\`\`bash
pnpm db:push
\`\`\`

### Erreur de connexion à la base de données
- Testez votre `DATABASE_URL` avec: `psql <DATABASE_URL>`
- Vérifiez que l'utilisateur a les permissions nécessaires

### OAuth ne fonctionne pas
- OAuth est optionnel, l'authentification email fonctionne sans
- Consultez [SETUP_AUTH.md](./SETUP_AUTH.md) pour la configuration

## Déploiement

### Vercel (Recommandé)

1. Pushez votre code sur GitHub
2. Importez le projet sur Vercel
3. Connectez une base de données (Neon, Supabase)
4. Ajoutez les variables d'environnement
5. Déployez

### Variables d'environnement en production

\`\`\`env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=votre-secret-unique-production
BETTER_AUTH_URL=https://votre-domaine.vercel.app
\`\`\`

## Documentation

- [Configuration Authentification](./SETUP_AUTH.md)
- [Configuration OAuth](./OAUTH_SETUP.md)

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

## Licence

MIT
