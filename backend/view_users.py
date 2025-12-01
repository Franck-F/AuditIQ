"""
Script pour afficher tous les utilisateurs de la base de données
"""
import asyncio
from sqlalchemy import select
from db import AsyncSessionLocal
from models.user import User


async def view_users():
    """Affiche tous les utilisateurs avec leurs informations"""
    async with AsyncSessionLocal() as session:
        # Récupérer tous les utilisateurs
        stmt = select(User)
        result = await session.execute(stmt)
        users = result.scalars().all()
        
        if not users:
            print(" Aucun utilisateur trouvé dans la base de données")
            return
        
        print(f"\n{'='*80}")
        print(f" BASE DE DONNÉES UTILISATEURS - {len(users)} utilisateur(s) trouvé(s)")
        print(f"{'='*80}\n")
        
        for i, user in enumerate(users, 1):
            print(f"👤 Utilisateur #{i}")
            print(f"{'─'*80}")
            print(f"  ID:                  {user.id}")
            print(f"  Nom:                 {user.first_name} {user.last_name}")
            print(f"  Email:               {user.email}")
            print(f"  Entreprise:          {user.company_name}")
            print(f"  Secteur:             {user.sector}")
            print(f"  Taille entreprise:   {user.company_size}")
            print(f"  Plan:                {user.plan}")
            print(f"  Rôle:                {user.role or 'Non défini'}")
            print(f"  Company ID:          {user.company_id or 'Non assigné'}")
            print(f"  Langue:              {user.language or 'fr'}")
            print(f"  Timezone:            {user.timezone or 'Europe/Paris'}")
            print(f"  Notifications:       {'✓ Activées' if user.notifications_enabled else '✗ Désactivées'}")
            print(f"  Compte actif:        {'✓ Oui' if user.is_active else '✗ Non'}")
            print(f"  Onboarding:          {user.onboarding_completed}/4")
            print(f"  Use case:            {user.use_case or 'Non défini'}")
            print(f"  Créé le:             {user.created_at}")
            print(f"  Dernière connexion:  {user.last_login or 'Jamais'}")
            print(f"  Supprimé le:         {user.deleted_at or 'N/A'}")
            
            # Infos entreprise étendues
            if user.siret or user.company_address or user.dpo_contact:
                print(f"\n   Informations entreprise étendues:")
                if user.siret:
                    print(f"     SIRET:            {user.siret}")
                if user.company_address:
                    print(f"     Adresse:          {user.company_address}")
                if user.dpo_contact:
                    print(f"     DPO:              {user.dpo_contact}")
            
            print(f"\n")
        
        print(f"{'='*80}\n")


if __name__ == "__main__":
    asyncio.run(view_users())
