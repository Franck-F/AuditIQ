"""
Migration: Ajout des tables datasets, audits et data_connections
"""
import asyncio
from sqlalchemy import text
from db import AsyncSessionLocal, init_models


async def migrate():
    """Crée les nouvelles tables pour l'upload de données"""
    
    print("🔄 Démarrage de la migration datasets...")
    
    # Initialiser les modèles (créer les tables)
    await init_models()
    
    async with AsyncSessionLocal() as session:
        # Vérifier si les tables existent
        result = await session.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('datasets', 'audits', 'data_connections')
        """))
        existing_tables = [row[0] for row in result.fetchall()]
        
        if 'datasets' in existing_tables:
            print("✅ Table 'datasets' existe déjà")
        else:
            print("📋 Création de la table 'datasets'...")
        
        if 'audits' in existing_tables:
            print("✅ Table 'audits' existe déjà")
        else:
            print("📋 Création de la table 'audits'...")
        
        if 'data_connections' in existing_tables:
            print("✅ Table 'data_connections' existe déjà")
        else:
            print("📋 Création de la table 'data_connections'...")
        
        await session.commit()
    
    print("✅ Migration terminée avec succès!")
    print("\n📊 Nouvelles tables:")
    print("   - datasets: Stockage des fichiers uploadés")
    print("   - audits: Résultats des audits de fairness")
    print("   - data_connections: Connexions aux sources externes")


if __name__ == "__main__":
    asyncio.run(migrate())
