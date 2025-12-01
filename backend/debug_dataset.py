"""
Debug: Vérifier la structure columns_info du dataset 6
"""
import asyncio
from sqlalchemy import select
from db import AsyncSessionLocal
from models.dataset import Dataset

async def check_dataset():
    async with AsyncSessionLocal() as session:
        stmt = select(Dataset).where(Dataset.id == 6)
        result = await session.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            print("❌ Dataset 6 n'existe pas")
            return
        
        print(f"✅ Dataset trouvé: {dataset.filename}")
        print(f"\nType de columns_info: {type(dataset.columns_info)}")
        print(f"\nContenu columns_info:")
        print(dataset.columns_info)
        
        # Tester l'extraction
        if isinstance(dataset.columns_info, dict):
            columns_list = dataset.columns_info.get('columns', [])
            print(f"\n✅ columns_list extrait: {len(columns_list)} colonnes")
            print(f"Première colonne: {columns_list[0] if columns_list else 'Aucune'}")
        else:
            print(f"\n⚠️ columns_info n'est pas un dict, c'est un {type(dataset.columns_info)}")

if __name__ == "__main__":
    asyncio.run(check_dataset())
