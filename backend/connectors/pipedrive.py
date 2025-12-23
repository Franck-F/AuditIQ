"""
Connecteur Pipedrive (F2.2)
Implémentation via l'API REST de Pipedrive
"""
from typing import Dict, Any, Optional, List
import pandas as pd
import httpx
from .base import BaseConnector
import logging

logger = logging.getLogger(__name__)

class PipedriveConnector(BaseConnector):
    """
    Connecteur pour Pipedrive CRM.
    Utilise l'authentification par API Token (via query param api_token).
    """
    
    def get_required_fields(self) -> List[str]:
        return ['company_domain', 'object_type']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à Pipedrive
        """
        try:
            api_token = self.credentials.get('api_token')
            domain = self.config.get('company_domain')
            
            # Lister les utilisateurs pour tester le token
            url = f"https://{domain}.pipedrive.com/api/v1/users"
            params = {'api_token': api_token}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                return response.status_code == 200
                
        except Exception as e:
            self.last_error = str(e)
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données de Pipedrive (deals, persons, organizations, etc.)
        """
        try:
            api_token = self.credentials.get('api_token')
            domain = self.config.get('company_domain')
            object_type = self.config.get('object_type', 'deals') # deals, persons, organizations
            
            url = f"https://{domain}.pipedrive.com/api/v1/{object_type}"
            params = {'api_token': api_token, 'limit': self.config.get('limit', 100)}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=30.0)
                response.raise_for_status()
                
                data = response.json()
                results = data.get('data', [])
                
                if results is None:
                    results = []
                    
                df = pd.DataFrame(results)
                return df
                
        except Exception as e:
            self.last_error = str(e)
            raise Exception(f"Erreur Pipedrive: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        return {
            'company_domain': self.config.get('company_domain'),
            'object_type': self.config.get('object_type')
        }
