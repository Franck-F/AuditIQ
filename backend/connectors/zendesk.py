"""
Connecteur Zendesk (F2.2)
Implémentation via l'API REST de Zendesk Support
"""
from typing import Dict, Any, Optional, List
import pandas as pd
import httpx
from .base import BaseConnector
import logging

logger = logging.getLogger(__name__)

class ZendeskConnector(BaseConnector):
    """
    Connecteur pour Zendesk Support.
    Supporte l'authentification par API Token ou Password.
    """
    
    def get_required_fields(self) -> List[str]:
        return ['subdomain', 'object_type']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à Zendesk
        """
        try:
            headers = self._build_headers()
            subdomain = self.config.get('subdomain')
            
            # On tente de lister les groupes pour tester
            url = f"https://{subdomain}.zendesk.com/api/v2/groups.json"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                return response.status_code == 200
                
        except Exception as e:
            self.last_error = str(e)
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données de Zendesk (tickets, users, satisfaction_ratings)
        """
        try:
            headers = self._build_headers()
            subdomain = self.config.get('subdomain')
            object_type = self.config.get('object_type', 'tickets') # tickets, users, groups
            
            url = f"https://{subdomain}.zendesk.com/api/v2/{object_type}.json"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=30.0)
                response.raise_for_status()
                
                data = response.json()
                results = data.get(object_type, [])
                
                df = pd.DataFrame(results)
                return df
                
        except Exception as e:
            self.last_error = str(e)
            raise Exception(f"Erreur Zendesk: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        return {
            'subdomain': self.config.get('subdomain'),
            'object_type': self.config.get('object_type')
        }
    
    def _build_headers(self) -> Dict[str, str]:
        if not self.credentials:
            raise Exception("Credentials Zendesk manquants")
            
        import base64
        email = self.credentials.get('email')
        api_token = self.credentials.get('api_token')
        password = self.credentials.get('password')
        
        if email and api_token:
            # API Token auth: email_address/token:{api_token}
            auth_str = f"{email}/token:{api_token}"
        elif email and password:
            # Password auth
            auth_str = f"{email}:{password}"
        else:
            raise Exception("Auth Zendesk invalide (email+token ou email+pass requis)")
            
        auth = base64.b64encode(auth_str.encode()).decode()
        
        return {
            'Authorization': f'Basic {auth}',
            'Content-Type': 'application/json'
        }
