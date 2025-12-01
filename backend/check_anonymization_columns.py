"""
Vérifier et ajouter les colonnes anonymized et anonymization_method si nécessaires
"""
import asyncio
from sqlalchemy import text
from db import AsyncSessionLocal

async def check_and_add_columns():
    async with AsyncSessionLocal() as session:
        # Vérifier les colonnes existantes
        check_query = text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'datasets'
            ORDER BY ordinal_position
        """)
        
        result = await session.execute(check_query)
        columns = result.fetchall()
        
        print("📋 Colonnes actuelles de la table datasets:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
        
        column_names = [col[0] for col in columns]
        
        # Vérifier anonymized
        if 'anonymized' not in column_names:
            print("\n⚠️ Colonne 'anonymized' manquante. Ajout...")
            add_anonymized = text("""
                ALTER TABLE datasets 
                ADD COLUMN anonymized BOOLEAN DEFAULT FALSE
            """)
            await session.execute(add_anonymized)
            await session.commit()
            print("✅ Colonne 'anonymized' ajoutée")
        else:
            print("\n✅ Colonne 'anonymized' existe")
        
        # Vérifier anonymization_method
        if 'anonymization_method' not in column_names:
            print("\n⚠️ Colonne 'anonymization_method' manquante. Ajout...")
            add_method = text("""
                ALTER TABLE datasets 
                ADD COLUMN anonymization_method VARCHAR(50)
            """)
            await session.execute(add_method)
            await session.commit()
            print("✅ Colonne 'anonymization_method' ajoutée")
        else:
            print("\n✅ Colonne 'anonymization_method' existe")
        
        # Re-vérifier
        result = await session.execute(check_query)
        columns = result.fetchall()
        
        print("\n📋 Colonnes finales de la table datasets:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")

if __name__ == "__main__":
    asyncio.run(check_and_add_columns())
