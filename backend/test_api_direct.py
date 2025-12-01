"""
Test direct de l'API via httpx
"""
import httpx
import asyncio

async def test_login():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8000/api/auth/login",
                json={
                    "email": "admin@auditiq.fr",
                    "password": "Admin123!"
                },
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status: {response.status_code}")
            print(f"Headers: {response.headers}")
            print(f"Body: {response.text}")
            
            if response.status_code == 422:
                print("\n Erreur de validation:")
                try:
                    error_detail = response.json()
                    import json
                    print(json.dumps(error_detail, indent=2))
                except:
                    pass
                    
        except Exception as e:
            print(f" Erreur: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
