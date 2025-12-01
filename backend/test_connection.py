"""
Script de test de connexion à la base de données
Vérifie que la configuration est correcte
"""
import asyncio
import os
from sqlalchemy import text
from db import engine
from dotenv import load_dotenv

load_dotenv()


async def test_connection():
    """Test la connexion à la base de données"""
    
    print("\n Test de connexion à la base de données")
    print("=" * 60)
    
    # Afficher la config (masquer le mot de passe)
    db_url = os.getenv('DATABASE_URL', 'Non configuré')
    if '@' in db_url:
        parts = db_url.split('@')
        masked = parts[0].split(':')[0] + ':****@' + parts[1]
    else:
        masked = db_url
    
    print(f"Database URL: {masked}\n")
    
    try:
        # Test de connexion simple
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.scalar()
        
        print(" Connexion réussie!")
        
        # Récupérer des infos sur la base
        async with engine.begin() as conn:
            # Type de base
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            
            if 'PostgreSQL' in version:
                db_type = "PostgreSQL"
                print(f"\n Type: {db_type}")
                print(f"Version: {version.split(',')[0]}")
                
                # Compter les tables
                result = await conn.execute(text("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """))
                table_count = result.scalar()
                print(f"Tables: {table_count}")
                
                # Taille de la base
                result = await conn.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database()))
                """))
                db_size = result.scalar()
                print(f"Taille: {db_size}")
                
            else:
                db_type = "SQLite"
                print(f"\n Type: {db_type}")
                print(f"Version: {version}")
        
        print("\n" + "=" * 60)
        print(" Configuration correcte!")
        
        if db_type == "SQLite":
            print("\n  Vous utilisez SQLite (développement)")
            print("Pour passer à PostgreSQL:")
            print("  1. Créez un projet sur https://supabase.com")
            print("  2. Ajoutez DATABASE_URL dans backend/.env")
            print("  3. Relancez python init_postgres.py")
        else:
            print("\n Vous êtes connecté à PostgreSQL!")
            print("Prochaines étapes:")
            print("  - python init_postgres.py (si tables manquantes)")
            print("  - python create_test_user.py")
        
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f" Erreur de connexion: {e}\n")
        print("Vérifiez:")
        print("  1. Le fichier backend/.env existe")
        print("  2. DATABASE_URL est correctement configuré")
        print("  3. Le mot de passe est correct")
        print("  4. Le firewall autorise la connexion")
        print("  5. asyncpg est installé: pip install asyncpg")
        print()
        return False
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)
