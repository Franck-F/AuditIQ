"""
Test complet du flow upload + configuration avec anonymisation
"""
import asyncio
import json
from sqlalchemy import select
from db import AsyncSessionLocal
from models.dataset import Dataset
from models.user import User

# Simuler une requête de configuration
config_data = {
    "use_case": "scoring",
    "target_column": "credit_approuve",
    "sensitive_attributes": ["age", "genre"],
    "fairness_metrics": ["demographic_parity"],
    "anonymization_method": "hash"  # Tester avec hash
}

async def test_configure():
    async with AsyncSessionLocal() as session:
        # Récupérer le dernier dataset
        stmt = select(Dataset).order_by(Dataset.id.desc()).limit(1)
        result = await session.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            print("❌ Aucun dataset trouvé")
            return
        
        print(f"✅ Dataset trouvé: ID={dataset.id}, filename={dataset.filename}")
        print(f"   anonymized={dataset.anonymized}")
        print(f"   anonymization_method={dataset.anonymization_method}")
        
        # Simuler la mise à jour
        dataset.use_case = config_data["use_case"]
        dataset.target_column = config_data["target_column"]
        dataset.sensitive_attributes = config_data["sensitive_attributes"]
        dataset.anonymized = True
        dataset.anonymization_method = config_data["anonymization_method"]
        dataset.status = "ready"
        
        try:
            await session.commit()
            await session.refresh(dataset)
            
            print("\n✅ Configuration sauvegardée avec succès!")
            print(f"   use_case: {dataset.use_case}")
            print(f"   target_column: {dataset.target_column}")
            print(f"   sensitive_attributes: {dataset.sensitive_attributes}")
            print(f"   anonymized: {dataset.anonymized}")
            print(f"   anonymization_method: {dataset.anonymization_method}")
            print(f"   status: {dataset.status}")
            
        except Exception as e:
            print(f"\n❌ Erreur lors de la sauvegarde: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_configure())
