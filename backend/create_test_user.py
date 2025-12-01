"""
Script de test pour créer un utilisateur et tester l'authentification
"""
import asyncio
from sqlalchemy import select
from db import AsyncSessionLocal
from models.user import User
import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')


async def create_test_user():
    """Crée un utilisateur de test pour les démonstrations"""
    async with AsyncSessionLocal() as session:
        # Vérifier si l'utilisateur existe déjà
        stmt = select(User).where(User.email == "admin@auditiq.fr")
        result = await session.execute(stmt)
        existing = result.scalars().first()
        
        if existing:
            print("✓ L'utilisateur admin@auditiq.fr existe déjà")
            print(f"  ID: {existing.id}")
            print(f"  Nom: {existing.first_name} {existing.last_name}")
            print(f"  Entreprise: {existing.company_name}")
            print(f"  Rôle: {existing.role}")
            print(f"  Plan: {existing.plan}")
            return
        
        # Créer un nouvel utilisateur
        user = User(
            email="admin@auditiq.fr",
            hashed_password=hash_password("Admin123!"),
            first_name="Admin",
            last_name="AuditIQ",
            company_name="AuditIQ SAS",
            sector="Technologie",
            company_size="1-10",
            plan="enterprise",
            role="admin",
            company_id="auditiq-001",
            onboarding_completed=4,
            use_case="recruitment",
            notifications_enabled=True,
            language="fr",
            timezone="Europe/Paris",
            is_active=True
        )
        
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        print(" Utilisateur de test créé avec succès!")
        print(f"\n Email: admin@auditiq.fr")
        print(f"Password: Admin123!")
        print(f"\n Informations:")
        print(f"   ID: {user.id}")
        print(f"   Nom: {user.first_name} {user.last_name}")
        print(f"   Entreprise: {user.company_name}")
        print(f"   Rôle: {user.role}")
        print(f"   Plan: {user.plan}")
        print(f"\n Vous pouvez maintenant tester la connexion!")


if __name__ == "__main__":
    asyncio.run(create_test_user())
