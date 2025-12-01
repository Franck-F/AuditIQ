"""
Script d'initialisation complète de la base de données PostgreSQL
Crée toutes les tables nécessaires pour AuditIQ
"""
import asyncio
from sqlalchemy import text
from db import engine, Base
from models.user import User
from models.auth import LoginLog, PasswordResetToken


async def init_database():
    """Initialise toutes les tables dans la base de données"""
    
    print(" Initialisation de la base de données AuditIQ")
    print("=" * 60)
    
    try:
        # Test de connexion
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✓ Connexion PostgreSQL établie")
            print(f"  Version: {version[:50]}...")
            
        print("\n Création des tables...")
        
        # Créer toutes les tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✓ Tables créées avec succès:")
        print("  - users")
        print("  - login_logs")
        print("  - password_reset_tokens")
        
        # Vérifier les tables créées
        async with engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
        
        print(f"\n Tables présentes dans la base:")
        for table in tables:
            print(f"  - {table}")
        
        # Afficher la structure de la table users
        print("\n Structure de la table 'users':")
        async with engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """))
            columns = result.fetchall()
            
        for col in columns:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            print(f"  - {col[0]:<30} {col[1]:<20} {nullable}")
        
        print("\n" + "=" * 60)
        print(" Base de données initialisée avec succès!")
        print("\nProchaines étapes:")
        print("  1. Créez un utilisateur: python create_test_user.py")
        print("  2. Démarrez le serveur: uvicorn audit_iq_backend:app --reload")
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\n Erreur lors de l'initialisation: {e}")
        print("\nVérifiez:")
        print("  - La variable DATABASE_URL dans .env")
        print("  - La connexion réseau à Supabase")
        print("  - Les credentials de la base de données")
        raise


if __name__ == "__main__":
    asyncio.run(init_database())
