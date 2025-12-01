"""
Tests pour les fonctionnalités F2.3 (Mapping des données)
"""
import requests
import json

API_URL = "http://localhost:8000"

# Connexion avec l'utilisateur test
def login():
    response = requests.post(
        f"{API_URL}/api/auth/login",
        json={
            "email": "test@auditiq.com",
            "password": "Test123456!"
        }
    )
    return response.cookies


def test_detect_proxies(cookies, dataset_id):
    """Test F2.3.3: Détection automatique variables proxy"""
    print("\n=== TEST F2.3.3: Détection variables proxy ===")
    
    response = requests.get(
        f"{API_URL}/api/upload/datasets/{dataset_id}/detect-proxies",
        cookies=cookies
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Détection réussie")
        print(f"   Total proxies: {data.get('total_proxies', 0)}")
        print(f"   Haut risque: {data.get('high_risk_count', 0)}")
        print(f"\n   Détails par attribut:")
        for attr, proxies in data.get('by_attribute', {}).items():
            print(f"   - {attr}: {len(proxies)} proxy(ies)")
            for p in proxies[:3]:  # Afficher les 3 premiers
                print(f"     * {p['column']}: {p['correlation']} ({p['method']})")
    else:
        print(f"❌ Erreur: {response.text}")
    
    return response.status_code == 200


def test_create_template(cookies):
    """Test F2.3.5: Création d'un template mapping"""
    print("\n=== TEST F2.3.5: Création template mapping ===")
    
    template_data = {
        "name": "Template RH Standard",
        "description": "Mapping standard pour données RH",
        "use_case": "recruitment",
        "column_mappings": {
            "nom": {
                "mapped_name": "employee_name",
                "expected_type": "string",
                "description": "Nom de l'employé"
            },
            "age": {
                "mapped_name": "employee_age",
                "expected_type": "number",
                "description": "Âge de l'employé"
            },
            "genre": {
                "mapped_name": "gender",
                "expected_type": "string",
                "description": "Genre"
            }
        },
        "default_target_column": "hired",
        "default_sensitive_attributes": ["gender", "employee_age"]
    }
    
    response = requests.post(
        f"{API_URL}/api/mapping/templates",
        json=template_data,
        cookies=cookies
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Template créé: {data['template']['name']}")
        print(f"   ID: {data['template']['id']}")
        return data['template']['id']
    else:
        print(f"❌ Erreur: {response.text}")
        return None


def test_list_templates(cookies):
    """Test: Liste des templates"""
    print("\n=== TEST: Liste des templates ===")
    
    response = requests.get(
        f"{API_URL}/api/mapping/templates",
        cookies=cookies
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        templates = data.get('templates', [])
        print(f"✅ {len(templates)} template(s) trouvé(s)")
        for t in templates:
            print(f"   - {t['name']} (ID: {t['id']}, usage: {t['usage_count']})")
    else:
        print(f"❌ Erreur: {response.text}")


def test_apply_mapping(cookies, dataset_id, template_id=None):
    """Test F2.3.4: Application d'un mapping"""
    print("\n=== TEST F2.3.4: Application mapping ===")
    
    request_data = {}
    if template_id:
        request_data["template_id"] = template_id
        print(f"Application du template ID: {template_id}")
    else:
        request_data["custom_mappings"] = {
            "salary": "employee_salary",
            "department": "dept_code"
        }
        print("Application de mappings personnalisés")
    
    response = requests.post(
        f"{API_URL}/api/mapping/datasets/{dataset_id}/apply-mapping",
        json=request_data,
        cookies=cookies
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Mapping appliqué")
        print(f"   Colonnes renommées: {data.get('columns_renamed', 0)}")
        print(f"   Nouvelles colonnes: {data.get('new_columns', [])[:5]}")
    else:
        print(f"❌ Erreur: {response.text}")


if __name__ == "__main__":
    print("🧪 Tests des fonctionnalités F2.3 (Mapping des données)")
    print("=" * 60)
    
    try:
        # Connexion
        print("\n1️⃣ Connexion...")
        cookies = login()
        print("✅ Connecté")
        
        # Note: Pour tester, vous devez avoir un dataset uploadé
        # Remplacez dataset_id par un ID réel de votre base
        dataset_id = 1  # À adapter selon votre base
        
        # Test détection proxy
        test_detect_proxies(cookies, dataset_id)
        
        # Test templates
        template_id = test_create_template(cookies)
        test_list_templates(cookies)
        
        # Test application mapping
        if template_id:
            test_apply_mapping(cookies, dataset_id, template_id)
        
        print("\n" + "=" * 60)
        print("✅ Tests terminés")
        
    except Exception as e:
        print(f"\n❌ Erreur lors des tests: {e}")
        import traceback
        traceback.print_exc()
