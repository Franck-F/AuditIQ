"""
Migration pour ajouter les fonctionnalités d'authentification et sécurité (F1.2)
"""
import asyncio
from sqlalchemy import text
from db import engine, Base
from models.user import User
from models.auth import LoginLog, PasswordResetToken


async def migrate_auth_features():
    """Ajoute les colonnes de sécurité et crée les nouvelles tables"""
    
    async with engine.begin() as conn:
        print(" Début de la migration F1.2 - Authentification & Sécurité\n")
        
        # Vérifier et ajouter les colonnes à users
        result = await conn.execute(text("PRAGMA table_info(users)"))
        existing_columns = {row[1] for row in result}
        
        columns_to_add = {
            'failed_login_attempts': 'ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0',
            'locked_until': 'ALTER TABLE users ADD COLUMN locked_until TIMESTAMP',
            'last_login': 'ALTER TABLE users ADD COLUMN last_login TIMESTAMP',
            'last_login_ip': 'ALTER TABLE users ADD COLUMN last_login_ip VARCHAR'
        }
        
        for column_name, alter_statement in columns_to_add.items():
            if column_name in existing_columns:
                print(f"○ Colonne '{column_name}' existe déjà")
            else:
                try:
                    await conn.execute(text(alter_statement))
                    print(f"✓ Colonne '{column_name}' ajoutée")
                except Exception as e:
                    print(f"✗ Erreur lors de l'ajout de '{column_name}': {e}")
        
        print("\n Création des nouvelles tables...\n")
        
        # Créer les nouvelles tables
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Tables 'login_logs' et 'password_reset_tokens' créées")
        
        print("\n Migration F1.2 terminée avec succès!\n")


if __name__ == "__main__":
    asyncio.run(migrate_auth_features())
