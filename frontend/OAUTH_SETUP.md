# Configuration OAuth pour Audit-IQ

Ce guide vous explique comment configurer l'authentification OAuth avec Google et GitHub.

## Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (Google+ API)
4. Allez dans "Identifiants" > "Créer des identifiants" > "ID client OAuth 2.0"
5. Configurez l'écran de consentement OAuth si ce n'est pas déjà fait
6. Pour le type d'application, sélectionnez "Application Web"
7. Ajoutez les URI de redirection autorisés :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.com/api/auth/callback/google` (production)
8. Copiez le Client ID et le Client Secret dans votre fichier `.env` :
   \`\`\`
   GOOGLE_CLIENT_ID=votre-client-id
   GOOGLE_CLIENT_SECRET=votre-client-secret
   \`\`\`

## GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Remplissez les informations :
   - **Application name**: Audit-IQ
   - **Homepage URL**: `http://localhost:3000` (ou votre domaine)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Cliquez sur "Register application"
5. Générez un nouveau Client Secret
6. Copiez le Client ID et le Client Secret dans votre fichier `.env` :
   \`\`\`
   GITHUB_CLIENT_ID=votre-client-id
   GITHUB_CLIENT_SECRET=votre-client-secret
   \`\`\`

## Configuration de Better Auth

Better Auth gère automatiquement les callbacks OAuth. Assurez-vous que :

1. Votre variable `BETTER_AUTH_URL` pointe vers votre domaine complet
2. Les URI de callback suivent le format : `{BETTER_AUTH_URL}/api/auth/callback/{provider}`

## URLs de callback

- **Google**: `{BETTER_AUTH_URL}/api/auth/callback/google`
- **GitHub**: `{BETTER_AUTH_URL}/api/auth/callback/github`

Remplacez `{BETTER_AUTH_URL}` par :
- `http://localhost:3000` en développement
- Votre domaine de production (ex: `https://audit-iq.com`)

## Vérification

Après configuration, les utilisateurs pourront se connecter avec les boutons "Continuer avec Google" et "Continuer avec GitHub" sur les pages de connexion et d'inscription.
