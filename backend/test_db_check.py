"""
Script pour vérifier directement les données dans PostgreSQL
"""
import asyncio
from sqlalchemy import select
from db import AsyncSessionLocal
from models.user import User

async def check_user():
    async with AsyncSessionLocal() as session:
        # Récupérer l'utilisateur avec ID 1
        stmt = select(User).where(User.id == 1)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            print(f" Utilisateur trouvé dans la DB:")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   First Name: {user.first_name}")
            print(f"   Last Name: {user.last_name}")
            print(f"   Language: {user.language}")
            print(f"   Timezone: {user.timezone}")
            print(f"   Notifications: {user.notifications_enabled}")
        else:
            print(" Utilisateur non trouvé")

if __name__ == "__main__":
    asyncio.run(check_user())
