"""
Test complet du flux d'upload avec authentification
"""
import asyncio
import httpx
from pathlib import Path

API_URL = "http://localhost:8000"

async def test_upload_flow():
    """Test complet : login, upload, configure"""
    
    async with httpx.AsyncClient() as client:
        # 1. Login pour obtenir le cookie
        print("1. 🔐 Connexion...")
        login_response = await client.post(
            f"{API_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "Test123!"
            }
        )
        
        if login_response.status_code != 200:
            print(f"❌ Échec de la connexion: {login_response.text}")
            print("\n💡 Créez d'abord un utilisateur test via l'interface web")
            return
        
        print(f"✅ Connecté: {login_response.json()}")
        cookies = login_response.cookies
        
        # 2. Upload du fichier
        print("\n2. 📤 Upload du fichier test_data.csv...")
        file_path = Path(__file__).parent / "test_data.csv"
        
        with open(file_path, "rb") as f:
            files = {"file": ("test_data.csv", f, "text/csv")}
            upload_response = await client.post(
                f"{API_URL}/api/upload/file",
                files=files,
                cookies=cookies
            )
        
        if upload_response.status_code != 200:
            print(f"❌ Échec de l'upload: {upload_response.text}")
            return
        
        preview = upload_response.json()
        dataset_id = preview["dataset_id"]
        print(f"✅ Fichier uploadé: ID={dataset_id}")
        print(f"   - {preview['row_count']} lignes")
        print(f"   - {preview['column_count']} colonnes")
        print(f"   - Encodage: {preview['encoding']}")
        print(f"   - Colonnes: {[c['name'] for c in preview['columns_info']]}")
        
        # 3. Configuration de l'audit
        print(f"\n3. ⚙️ Configuration de l'audit...")
        config = {
            "use_case": "recruitment",
            "target_column": "salary",
            "sensitive_attributes": ["gender", "age"],
            "fairness_metrics": ["demographic_parity", "equal_opportunity"]
        }
        
        config_response = await client.put(
            f"{API_URL}/api/upload/datasets/{dataset_id}/configure",
            json=config,
            cookies=cookies
        )
        
        if config_response.status_code != 200:
            print(f"❌ Échec de la configuration: {config_response.text}")
            return
        
        result = config_response.json()
        print(f"✅ Configuration enregistrée!")
        print(f"   - Cas d'usage: {result['use_case']}")
        print(f"   - Variable cible: {result['target_column']}")
        print(f"   - Attributs sensibles: {result['sensitive_attributes']}")
        print(f"   - Métriques: {result.get('fairness_metrics', [])}")
        
        # 4. Vérification de la base de données
        print(f"\n4. 🔍 Récupération des détails du dataset...")
        details_response = await client.get(
            f"{API_URL}/api/upload/datasets/{dataset_id}",
            cookies=cookies
        )
        
        if details_response.status_code != 200:
            print(f"❌ Échec de la récupération: {details_response.text}")
            return
        
        details = details_response.json()
        print(f"✅ Dataset récupéré depuis la base de données:")
        print(f"   - Status: {details['status']}")
        print(f"   - Configured: {details.get('use_case') is not None}")
        print(f"   - Created: {details['created_at']}")
        
        print("\n🎉 Test complet réussi!")
        print("\n📊 Résumé:")
        print(f"   Dataset ID: {dataset_id}")
        print(f"   Fichier: {details['original_filename']}")
        print(f"   Configuration: ✅ Enregistrée en base")
        print(f"   Prêt pour: Audit de fairness")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 TEST COMPLET DU FLUX D'UPLOAD")
    print("=" * 60)
    asyncio.run(test_upload_flow())
