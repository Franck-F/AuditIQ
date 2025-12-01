import asyncio
import httpx
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_EMAIL = "test_audit_engine@example.com"
TEST_PASSWORD = "password123"

async def verify_backend():
    print("Starting Full Backend Verification...")
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Authentication
        print("\n1. Testing Authentication...")
        # Register
        try:
            resp = await client.post("/auth/register", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "first_name": "Test",
                "last_name": "User",
                "company_name": "TestCorp",
                "sector": "Technology",
                "company_size": "10-50"
            })
            if resp.status_code == 200:
                print("   - Register success")
            elif resp.status_code == 400 and "already registered" in resp.text:
                print("   - User already registered")
            else:
                print(f"   - Register failed: {resp.text}")
                return
        except Exception as e:
            print(f"   - Connection failed: {e}")
            return

        # Login
        resp = await client.post("/auth/login", data={
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if resp.status_code != 200:
            print(f"   - Login failed: {resp.text}")
            return
        
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("   - Login success")

        # 2. Upload Dataset
        print("\n2. Testing Dataset Upload...")
        # Create a dummy CSV
        dummy_csv = "gender,age,score,hired\nM,25,80,1\nF,30,85,0\nM,40,70,1\nF,22,90,1\n"
        files = {"file": ("test_data.csv", dummy_csv, "text/csv")}
        
        resp = await client.post("/upload/file", files=files, headers=headers)
        if resp.status_code != 200:
            print(f"   - Upload failed: {resp.text}")
            return
        
        dataset_id = resp.json()["id"]
        print(f"   - Upload success (ID: {dataset_id})")

        # 3. Create Audit
        print("\n3. Testing Audit Creation...")
        audit_payload = {
            "dataset_id": dataset_id,
            "name": "Full Verification Audit",
            "target_column": "hired",
            "sensitive_attributes": ["gender"],
            "metrics": ["demographic_parity"],
            "use_case": "recruitment"
        }
        
        resp = await client.post("/audits/create", json=audit_payload, headers=headers)
        if resp.status_code != 200:
            print(f"   - Audit creation failed: {resp.text}")
            return
            
        audit_id = resp.json()["id"]
        print(f"   - Audit created (ID: {audit_id})")
        
        # Wait for background task
        print("   - Waiting for audit processing...")
        await asyncio.sleep(2) 
        
        # Get Audit Results
        resp = await client.get(f"/audits/{audit_id}", headers=headers)
        audit_data = resp.json()
        if audit_data["status"] == "completed":
            print("   - Audit completed successfully")
            print(f"   - Score: {audit_data['score']}")
        else:
            print(f"   - Audit status: {audit_data['status']}")

        # 4. Generate Report
        print("\n4. Testing Report Generation...")
        resp = await client.get(f"/reports/generate/{audit_id}", headers=headers)
        if resp.status_code != 200:
            print(f"   - Report generation failed: {resp.text}")
        else:
            print("   - Report generation triggered")
            
            # Download Report
            resp = await client.get(f"/reports/{audit_id}/download", headers=headers)
            if resp.status_code == 200:
                print("   - Report download success (PDF content received)")
            else:
                print(f"   - Report download failed: {resp.status_code}")

    print("\n- Full Backend Verification Completed!")

if __name__ == "__main__":
    asyncio.run(verify_backend())
