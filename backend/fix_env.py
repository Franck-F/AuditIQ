content = """DATABASE_URL=postgresql+asyncpg://postgres.qpgwotsodziznwigpjey:postgresql%402025@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
SECRET_KEY=votre-secret-key-super-secure-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

GEMINI_API_KEY=AIzaSyAkeELXFVStDUdwpbRJce4tvCOT8EsqbsY
"""

with open('.env', 'w') as f:
    f.write(content)

print("Fixed .env file")
