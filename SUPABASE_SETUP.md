# Guide de migration vers PostgreSQL Supabase

## 📋 Étape 1: Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Attendez ~2 minutes que la base soit provisionnée

## 📋 Étape 2: Récupérer la chaîne de connexion

1. Dans votre projet Supabase, allez dans **Settings** > **Database**
2. Trouvez la section **Connection string**
3. Sélectionnez l'onglet **URI** (pas Transaction mode)
4. Copiez la connexion qui ressemble à :
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
5. **IMPORTANT**: Remplacez `[PASSWORD]` par votre mot de passe de base de données

## 📋 Étape 3: Installer les dépendances PostgreSQL

Dans le terminal backend, exécutez :

```bash
cd backend
.venv\Scripts\activate
pip install asyncpg python-dotenv
```

## 📋 Étape 4: Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Database PostgreSQL Supabase
DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# JWT Secret (générez-en un nouveau avec openssl rand -hex 32)
SECRET_KEY=votre-secret-key-super-securisee-changez-moi

# API Configuration
CORS_ORIGINS=http://localhost:3000,https://votre-domaine.com
```

**Exemple concret :**
```env
DATABASE_URL=postgresql+asyncpg://postgres.abcdefghijklmnop:MonMotDePasse123!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## 📋 Étape 5: Mettre à jour le code

Le fichier `db.py` est déjà configuré ! Il lit automatiquement `DATABASE_URL`.

Mettez à jour `backend/audit_iq_backend/__init__.py` pour charger les variables :

```python
from dotenv import load_dotenv
load_dotenv()  # Ajouter au début du fichier
```

## 📋 Étape 6: Créer les tables

Exécutez les migrations :

```bash
cd backend
.venv\Scripts\activate

# Créer toutes les tables
python init_db.py

# Ou exécutez les migrations spécifiques
python migrate_auth.py
python migrate_profile_management.py
```

## 📋 Étape 7: Créer un utilisateur de test

```bash
python create_test_user.py
```

## 📋 Étape 8: Démarrer l'application

```bash
# Backend
cd backend
.venv\Scripts\python.exe -m uvicorn audit_iq_backend:app --reload --port 8000

# Frontend (nouveau terminal)
cd ..
pnpm run dev
```

## ✅ Vérification

1. Allez sur Supabase > Table Editor
2. Vous devriez voir les tables : `users`, `login_logs`, `password_reset_tokens`
3. Testez la connexion sur http://localhost:3000/login

## 🔒 Sécurité

### Variables à JAMAIS commiter :
- `.env` doit être dans `.gitignore`
- Ne partagez JAMAIS votre `DATABASE_URL`
- Changez le `SECRET_KEY` en production

### Générer une clé secrète sécurisée :

**PowerShell :**
```powershell
$bytes = New-Object Byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.Convert]::ToBase64String($bytes)
```

**Python :**
```python
import secrets
print(secrets.token_hex(32))
```

## 🌐 Déploiement en production

### Pour Vercel (Frontend) :

1. Dans Vercel, ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_API_URL=https://votre-backend.com`

### Pour Railway/Render (Backend) :

1. Ajoutez les variables d'environnement :
   - `DATABASE_URL=postgresql+asyncpg://...`
   - `SECRET_KEY=...`
   - `CORS_ORIGINS=https://votre-frontend.vercel.app`

## 📊 Avantages Supabase

✅ PostgreSQL géré (pas de maintenance)
✅ Backups automatiques
✅ Connection pooling
✅ 500 MB gratuit
✅ Dashboard SQL intégré
✅ Row Level Security (RLS)
✅ APIs temps réel (bonus)

## 🐛 Dépannage

**Erreur "password authentication failed" :**
- Vérifiez que vous avez remplacé `[PASSWORD]` dans l'URL
- Le mot de passe est celui du projet, pas de votre compte Supabase

**Erreur "SSL required" :**
- Ajoutez `?sslmode=require` à la fin de l'URL :
  ```
  postgresql+asyncpg://...postgres?sslmode=require
  ```

**Erreur "Module asyncpg not found" :**
```bash
pip install asyncpg
```

**Connexion lente :**
- Utilisez le connection pooler (port 6543)
- Pas le direct connection (port 5432)

## 📝 Migration des données existantes

Si vous avez des données dans SQLite à migrer :

```bash
# Exporter depuis SQLite
python backend/export_sqlite_data.py

# Importer dans PostgreSQL
python backend/import_to_postgres.py
```

(Scripts à créer si besoin)
