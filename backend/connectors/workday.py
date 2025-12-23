"""
Connecteur Workday (F2.2)
Implémentation via l'API REST de Workday (RaaS - Reports as a Service)
"""
from typing import Dict, Any, Optional, List
import pandas as pd
import httpx
from .base import BaseConnector
import logging
import io

logger = logging.getLogger(__name__)

class WorkdayConnector(BaseConnector):
    """
    Connecteur pour Workday.
    Supporte l'authentification OAuth2 ou Basic.
    Utilise généralement les rapports RaaS (JSON/CSV).
    """
    
    def get_required_fields(self) -> List[str]:
        return ['tenant_url', 'report_name', 'username']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à Workday (via le rapport RaaS)
        """
        try:
            headers = self._build_headers()
            url = self._get_report_url()
            
            async with httpx.AsyncClient() as client:
                # On fait un HEAD ou un GET limité pour tester
                response = await client.get(f"{url}?limit=1", headers=headers, timeout=10.0)
                return response.status_code == 200
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Workday connection test failed: {e}")
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données de Workday (RaaS)
        """
        try:
            headers = self._build_headers()
            url = self._get_report_url()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=60.0)
                response.raise_for_status()
                
                # Selon le format du rapport (JSON par défaut pour RaaS REST)
                data = response.json()
                
                # Chercher la liste d'entrées (souvent dans une clé 'Report_Entry' ou similaire)
                entries = data
                if isinstance(data, dict):
                    # Essayer de trouver une clé contenant une liste si ce n'est pas directement à la racine
                    for key in ['Report_Entry', 'entries', 'data', 'records']:
                        if key in data and isinstance(data[key], list):
                            entries = data[key]
                            break
                            
                if not isinstance(entries, list):
                    raise Exception("Format de rapport Workday non reconnu (liste attendue)")
                
                df = pd.DataFrame(entries)
                return df
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Workday fetch data failed: {e}")
            raise Exception(f"Erreur Workday: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        return {
            'tenant_url': self.config.get('tenant_url'),
            'report_name': self.config.get('report_name'),
            'format': 'JSON (RaaS)'
        }
    
    def _build_headers(self) -> Dict[str, str]:
        if not self.credentials:
            raise Exception("Credentials Workday manquants")
            
        headers = {'Accept': 'application/json'}
        
        # Authentification Basic (courante pour RaaS)
        username = self.credentials.get('username')
        password = self.credentials.get('password')
        
        if username and password:
            import base64
            auth = base64.b64encode(f"{username}:{password}".encode()).decode()
            headers['Authorization'] = f"Basic {auth}"
        
        # Authentification OAuth2
        access_token = self.credentials.get('access_token')
        if access_token:
            headers['Authorization'] = f"Bearer {access_token}"
            
        return headers

    def _get_report_url(self) -> str:
        """Construit l'URL du rapport Workday"""
        tenant_url = self.config.get('tenant_url').rstrip('/')
        report_name = self.config.get('report_name')
        # Format standard RaaS REST: https://{host}/ccx/service/customreport2/{tenant}/{owner}/{report_name}
        # Mais pour simplifier on peut demander l'URL complète du point d'entrée REST
        if 'ccx/service' in tenant_url:
            return f"{tenant_url}/{report_name}"
        return f"{tenant_url}/ccx/service/customreport2/tenant/owner/{report_name}"
