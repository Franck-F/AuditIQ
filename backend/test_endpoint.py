import requests
import json

url = "http://localhost:8000/api/ai/chat"
try:
    # On envoie une requête sans token juste pour voir si on a 401 (ce qui veut dire que la route existe) ou 404
    response = requests.post(url, json={"message": "test"})
    print(f"Status Code: {response.status_code}")
    if response.status_code == 404:
        print("❌ Route not found")
    elif response.status_code == 401:
        print("✅ Route exists (Unauthorized as expected)")
    else:
        print(f"✅ Route exists (Status: {response.status_code})")
except Exception as e:
    print(f"❌ Connection failed: {e}")
