"""
Script pour initialiser/mettre à jour la base de données avec les nouveaux champs
"""
import asyncio
from db import init_models

async def main():
    print(" Initialisation de la base de données...")
    await init_models()
    print(" Base de données initialisée avec succès!")
    print("   - Champs ajoutés: siret, company_address, dpo_contact, plan, onboarding_completed, use_case")

if __name__ == "__main__":
    asyncio.run(main())
