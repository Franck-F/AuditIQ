# Installation Audit-IQ

## Prérequis

- Node.js 18+ 
- pnpm
- PostgreSQL (local ou distant)

## Installation

### 1. Créer le projet Next.js

\`\`\`bash
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --turbopack --import-alias "@/*"
\`\`\`

Options:
- ✅ TypeScript: YES
- ✅ ESLint: YES
- ✅ Tailwind CSS: YES
- ✅ src/ directory: YES
- ✅ App Router: YES
- ✅ Turbopack: YES
- ❌ React Compiler: NO
- ✅ Import alias: YES (@/*)

### 2. Installer les dépendances

\`\`\`bash
# Composants shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label toast sonner skeleton

# Dépendances principales
pnpm add better-auth drizzle-orm @neondatabase/serverless postgres
pnpm add -D drizzle-kit

# Dépendances additionnelles
pnpm add axios react-dropzone recharts date-fns lucide-react

# Vercel AI SDK
pnpm add ai @ai-sdk/openai
\`\`\`

### 3. Configuration de l'environnement

Créer un fichier `.env.local`:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auditiq"

# Better Auth
BETTER_AUTH_SECRET="votre_secret_ici_minimum_32_caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# OpenAI (optionnel)
OPENAI_API_KEY="votre_clé_openai"
\`\`\`

### 4. Créer la base de données

\`\`\`bash
# Générer les migrations
pnpm drizzle-kit generate

# Appliquer les migrations
pnpm drizzle-kit push
\`\`\`

### 5. Lancer le projet

\`\`\`bash
pnpm dev --turbopack
\`\`\`

Le site sera accessible sur `http://localhost:3000`

## Structure du projet

\`\`\`
audit-iq/
├── app/
│   ├── api/auth/[...all]/     # Routes d'authentification
│   ├── dashboard/             # Dashboard protégé
│   ├── sign-in/               # Page de connexion
│   ├── sign-up/               # Page d'inscription
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── auth/                  # Composants d'authentification
│   ├── landing/               # Composants landing page
│   └── ui/                    # Composants shadcn/ui
├── lib/
│   ├── db/                    # Configuration database
│   ├── auth.ts                # Configuration Better Auth
│   ├── auth-client.ts         # Client Better Auth
│   └── utils.ts
└── drizzle.config.ts          # Configuration Drizzle
\`\`\`

## Fonctionnalités

- ✅ Landing page moderne inspirée de Pinecone
- ✅ Authentification avec Better Auth
- ✅ Dashboard protégé
- ✅ Base de données PostgreSQL avec Drizzle ORM
- ✅ Design responsive avec Tailwind CSS
- ✅ Composants UI avec shadcn/ui
- ✅ Dark mode support

## Commandes utiles

\`\`\`bash
# Développement avec Turbopack
pnpm dev --turbopack

# Build production
pnpm build

# Générer les types TypeScript depuis la DB
pnpm drizzle-kit introspect

# Studio Drizzle (interface visuelle)
pnpm drizzle-kit studio
\`\`\`

## Déploiement sur Vercel

1. Push votre code sur GitHub
2. Connectez votre repository sur Vercel
3. Ajoutez les variables d'environnement
4. Déployez !

Vercel détectera automatiquement Next.js et configurera le build.
