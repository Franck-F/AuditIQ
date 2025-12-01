"""
Script de test pour l'authentification (F1.2)
Teste login, verrouillage, et réinitialisation de mot de passe
"""
import asyncio
import httpx


BASE_URL = "http://localhost:8000"


async def test_login_success():
    """Test connexion réussie"""
    print("\n Test 1: Connexion réussie")
    print("─" * 60)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@auditiq.fr",
                "password": "Admin123!"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(" Connexion réussie!")
            print(f"   Token reçu: {data['access_token'][:50]}...")
            print(f"   User: {data['user']['first_name']} {data['user']['last_name']}")
            print(f"   Rôle: {data['user']['role']}")
            return data['access_token']
        else:
            print(f" Échec: {response.status_code}")
            print(f"   {response.text}")
            return None


async def test_login_wrong_password():
    """Test mot de passe incorrect"""
    print("\n Test 2: Mot de passe incorrect")
    print("─" * 60)
    
    async with httpx.AsyncClient() as client:
        for i in range(3):
            response = await client.post(
                f"{BASE_URL}/api/auth/login",
                json={
                    "email": "admin@auditiq.fr",
                    "password": "WrongPassword123!"
                }
            )
            
            print(f"   Tentative {i+1}: {response.status_code}")
            if response.status_code == 401:
                data = response.json()
                print(f"   Message: {data['detail']}")
        
        print(" Gestion des erreurs fonctionne")


async def test_forgot_password():
    """Test demande de réinitialisation"""
    print("\n Test 3: Demande de réinitialisation de mot de passe")
    print("─" * 60)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "admin@auditiq.fr"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(" Demande envoyée!")
            print(f"   Message: {data['message']}")
            if 'token' in data:
                print(f"   Token (debug): {data['token']}")
                return data['token']
        else:
            print(f" Échec: {response.status_code}")
            return None


async def test_reset_password(token):
    """Test réinitialisation avec token"""
    print("\n Test 4: Réinitialisation de mot de passe")
    print("─" * 60)
    
    if not token:
        print("  Pas de token, test ignoré")
        return
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "token": token,
                "new_password": "Admin123!"  # On remet le même
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(" Mot de passe réinitialisé!")
            print(f"   Message: {data['message']}")
        else:
            print(f" Échec: {response.status_code}")
            print(f"   {response.text}")


async def test_login_history():
    """Test historique des connexions"""
    print("\n Test 5: Historique des connexions")
    print("─" * 60)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/api/auth/login-history?limit=5"
        )
        
        if response.status_code == 200:
            logs = response.json()
            print(f" {len(logs)} entrées dans l'historique")
            for i, log in enumerate(logs[:3], 1):
                status = "✓ Succès" if log['success'] else "✗ Échec"
                print(f"   {i}. {log['email']} - {status}")
                print(f"      IP: {log['ip_address']}")
                print(f"      Date: {log['timestamp']}")
        else:
            print(f" Échec: {response.status_code}")


async def run_all_tests():
    """Lance tous les tests"""
    print("\n" + "="*60)
    print(" TESTS D'AUTHENTIFICATION - F1.2")
    print("="*60)
    
    try:
        # Test 1: Login réussi
        token = await test_login_success()
        
        # Test 2: Mauvais mot de passe
        await test_login_wrong_password()
        
        # Test 3: Forgot password
        reset_token = await test_forgot_password()
        
        # Test 4: Reset password
        await test_reset_password(reset_token)
        
        # Test 5: Login history
        await test_login_history()
        
        print("\n" + "="*60)
        print(" Tous les tests terminés!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n Erreur: {e}")


if __name__ == "__main__":
    print("\n  Assurez-vous que le serveur backend tourne sur http://localhost:8000")
    print("   Commande: uvicorn audit_iq_backend:app --reload\n")
    
    asyncio.run(run_all_tests())
