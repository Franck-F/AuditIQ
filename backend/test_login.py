"""
Script de test pour l'endpoint de login
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db import AsyncSessionLocal
from models.user import User

async def test_login():
    async with AsyncSessionLocal() as session:
        # Vérifier si l'utilisateur existe
        stmt = select(User).where(User.email == "admin@auditiq.fr")
        result = await session.execute(stmt)
        user = result.scalars().first()
        
        if user:
            print(f" Utilisateur trouvé: {user.email}")
            print(f"   ID: {user.id}")
            print(f"   Nom: {user.first_name} {user.last_name}")
            print(f"   Actif: {user.is_active}")
            print(f"   Tentatives échouées: {user.failed_login_attempts}")
            print(f"   Verrouillé jusqu'à: {user.locked_until}")
            print(f"   Hash du mot de passe: {user.hashed_password[:50]}...")
        else:
            print(" Utilisateur non trouvé")
            return
        
        # Test de validation du mot de passe
        import bcrypt
        test_password = "Admin123!"
        is_valid = bcrypt.checkpw(
            test_password.encode('utf-8'),
            user.hashed_password.encode('utf-8')
        )
        print(f"\n Test mot de passe '{test_password}': {'✅ Valide' if is_valid else ' Invalide'}")

if __name__ == "__main__":
    asyncio.run(test_login())
