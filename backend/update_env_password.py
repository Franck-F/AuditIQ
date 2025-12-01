import urllib.parse

password = "postgresql@2025"
encoded_password = urllib.parse.quote_plus(password)
# Reconstruct the URL with the encoded password
db_url = f"postgresql+asyncpg://postgres:{encoded_password}@db.qpgwotsodziznwigpjey.supabase.co:5432/postgres"

content = f"""DATABASE_URL={db_url}
SECRET_KEY=votre-secret-key-super-secure-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
"""

with open(".env", "w") as f:
    f.write(content)
print(f"Updated .env with DATABASE_URL starting with: {db_url[:20]}...")
