"""
Connecteur BambooHR (F2.2)
Implémentation via l'API REST de BambooHR v1
"""
from typing import Dict, Any, Optional, List
import pandas as pd
import httpx
from .base import BaseConnector
import logging

logger = logging.getLogger(__name__)

class BambooHRConnector(BaseConnector):
    """
    Connecteur pour BambooHR.
    Utilise l'authentification par API Key (Basic Auth avec API Key comme username et 'x' comme password).
    """
    
    def get_required_fields(self) -> List[str]:
        return ['subdomain', 'report_id']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à BambooHR
        """
        try:
            headers = self._build_headers()
            subdomain = self.config.get('subdomain')
            
            # On tente de récupérer la liste des champs disponibles pour tester la connexion
            url = f"https://api.bamboohr.com/api/gateway.php/{subdomain}/v1/meta/fields"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                return response.status_code == 200
                
        except Exception as e:
            self.last_error = str(e)
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données de BambooHR (via un rapport personnalisé ou liste d'employés)
        """
        try:
            headers = self._build_headers()
            subdomain = self.config.get('subdomain')
            report_id = self.config.get('report_id', 'custom')
            
            if report_id == 'directory':
                url = f"https://api.bamboohr.com/api/gateway.php/{subdomain}/v1/employees/directory"
            else:
                # Rapport personnalisé (nécessite report_id)
                url = f"https://api.bamboohr.com/api/gateway.php/{subdomain}/v1/reports/{report_id}?format=JSON"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=30.0)
                response.raise_for_status()
                
                data = response.json()
                
                # BambooHR reports structure: {"employees": [...]}
                employees = data.get('employees', [])
                if not employees and isinstance(data, list):
                    employees = data
                
                df = pd.DataFrame(employees)
                return df
                
        except Exception as e:
            self.last_error = str(e)
            raise Exception(f"Erreur BambooHR: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        return {
            'subdomain': self.config.get('subdomain'),
            'report_id': self.config.get('report_id')
        }
    
    def _build_headers(self) -> Dict[str, str]:
        if not self.credentials:
            raise Exception("Credentials BambooHR manquants")
            
        api_key = self.credentials.get('api_key')
        if not api_key:
            raise Exception("API Key BambooHR manquante")
            
        import base64
        # BambooHR uses API KEY as username and 'x' as password
        auth = base64.b64encode(f"{api_key}:x".encode()).decode()
        
        return {
            'Authorization': f'Basic {auth}',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
