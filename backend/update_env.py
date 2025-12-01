content = """DATABASE_URL=postgresql+asyncpg://postgres:postgres@db.qpgwotsodziznwigpjey.supabase.co:5432/postgres
SECRET_KEY=votre-secret-key-super-secure-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
"""
with open(".env", "w") as f:
    f.write(content)
print("Updated .env")
