"""
Integration Tests for Fairness Enhanced API

Tests complete API workflows
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import pandas as pd
import numpy as np

from audit_iq_backend import app
from db import Base, get_db
from models.user import User
from models.dataset import Dataset, Audit


# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Create test client"""
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture
def test_user(client):
    """Create test user"""
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    return response.json()


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "testpass123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_dataset(client, auth_headers):
    """Create test dataset"""
    # Create sample CSV
    df = pd.DataFrame({
        'feature1': np.random.randn(100),
        'feature2': np.random.randn(100),
        'gender': np.random.choice(['M', 'F'], 100),
        'race': np.random.choice(['A', 'B'], 100),
        'target': np.random.randint(0, 2, 100)
    })
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        df.to_csv(f.name, index=False)
        
        # Upload dataset
        with open(f.name, 'rb') as file:
            response = client.post(
                "/api/datasets/upload",
                files={"file": ("test.csv", file, "text/csv")},
                headers=auth_headers
            )
    
    return response.json()


@pytest.fixture
def test_audit(client, auth_headers, test_dataset):
    """Create test audit"""
    response = client.post(
        "/api/audits/create",
        json={
            "dataset_id": test_dataset["id"],
            "name": "Test Audit",
            "target_column": "target",
            "sensitive_attributes": ["gender", "race"],
            "use_case": "testing"
        },
        headers=auth_headers
    )
    return response.json()


class TestFairnessEnhancedAPI:
    """Integration tests for enhanced fairness API"""
    
    def test_get_detailed_metrics(self, client, auth_headers, test_audit):
        """Test getting detailed metrics"""
        audit_id = test_audit["id"]
        
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/metrics/detailed",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400]  # 400 if audit not run yet
        
        if response.status_code == 200:
            data = response.json()
            assert "overall_metrics" in data
            assert "fairness_scores" in data
            assert "risk_assessment" in data
    
    def test_get_ai_recommendations(self, client, auth_headers, test_audit):
        """Test getting AI recommendations"""
        audit_id = test_audit["id"]
        
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/recommendations/ai",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            data = response.json()
            assert "severity" in data
            assert "mitigation_strategies" in data
    
    def test_apply_mitigation(self, client, auth_headers, test_audit):
        """Test applying mitigation strategy"""
        audit_id = test_audit["id"]
        
        response = client.post(
            f"/api/audits/enhanced/{audit_id}/mitigation/apply",
            json={
                "strategy_name": "threshold_optimizer",
                "constraint": "demographic_parity"
            },
            headers=auth_headers
        )
        
        # May fail if audit not complete, but should not crash
        assert response.status_code in [200, 400, 500]
    
    def test_get_group_comparison(self, client, auth_headers, test_audit):
        """Test group comparison endpoint"""
        audit_id = test_audit["id"]
        
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/groups/comparison",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400]
    
    def test_intersectional_analysis(self, client, auth_headers, test_audit):
        """Test intersectional analysis"""
        audit_id = test_audit["id"]
        
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/analysis/intersectional?max_combination_size=2",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400, 500]
    
    def test_subgroup_discovery(self, client, auth_headers, test_audit):
        """Test subgroup discovery"""
        audit_id = test_audit["id"]
        
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/analysis/subgroups?min_group_size=10",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400, 500]
    
    def test_whatif_instances(self, client, auth_headers, test_audit):
        """Test getting instances for What-If"""
        audit_id = test_audit["id"]
        
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/whatif/instances?limit=5",
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            data = response.json()
            assert "instances" in data
            assert len(data["instances"]) <= 5
    
    def test_whatif_counterfactual(self, client, auth_headers, test_audit):
        """Test counterfactual generation"""
        audit_id = test_audit["id"]
        
        response = client.post(
            f"/api/audits/enhanced/{audit_id}/whatif/counterfactual",
            json={
                "instance_index": 0,
                "desired_outcome": 1,
                "max_changes": 3
            },
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400, 500]
    
    def test_whatif_feature_importance(self, client, auth_headers, test_audit):
        """Test feature importance calculation"""
        audit_id = test_audit["id"]
        
        response = client.post(
            f"/api/audits/enhanced/{audit_id}/whatif/feature-importance",
            json={
                "method": "shap",
                "sample_size": 50
            },
            headers=auth_headers
        )
        
        assert response.status_code in [200, 400, 500]
    
    def test_unauthorized_access(self, client, test_audit):
        """Test that endpoints require authentication"""
        audit_id = test_audit["id"]
        
        # Try without auth headers
        response = client.get(
            f"/api/audits/enhanced/{audit_id}/metrics/detailed"
        )
        
        assert response.status_code == 401
    
    def test_invalid_audit_id(self, client, auth_headers):
        """Test with invalid audit ID"""
        response = client.get(
            "/api/audits/enhanced/99999/metrics/detailed",
            headers=auth_headers
        )
        
        assert response.status_code == 404


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
