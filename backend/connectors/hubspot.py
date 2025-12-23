"""
Connecteur HubSpot (F2.2)
Implémentation via l'API REST de HubSpot (v3)
"""
from typing import Dict, Any, Optional, List
import pandas as pd
import httpx
from .base import BaseConnector
import logging

logger = logging.getLogger(__name__)

class HubSpotConnector(BaseConnector):
    """
    Connecteur pour HubSpot.
    Supporte l'authentification via Private App Access Token (Bearer).
    """
    
    def get_required_fields(self) -> List[str]:
        # On demande l'objet à synchroniser (contacts, companies, deals, etc.)
        return ['object_type']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à HubSpot
        """
        try:
            headers = self._build_headers()
            object_type = self.config.get('object_type', 'contacts')
            
            # On tente de lister quelques enregistrements pour tester le token
            url = f"https://api.hubapi.com/crm/v3/objects/{object_type}"
            params = {'limit': 1}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params, timeout=10.0)
                return response.status_code == 200
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"HubSpot connection test failed: {e}")
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données de HubSpot
        """
        try:
            headers = self._build_headers()
            object_type = self.config.get('object_type', 'contacts')
            
            # Propriétés à récupérer
            properties = self.config.get('properties', [])
            
            url = f"https://api.hubapi.com/crm/v3/objects/{object_type}"
            params = {
                'limit': self.config.get('limit', 100),
                'archived': 'false'
            }
            
            if properties:
                params['properties'] = ",".join(properties)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params, timeout=30.0)
                response.raise_for_status()
                
                results = response.json().get('results', [])
                
                # Aplanir les propriétés HubSpot
                flattened_data = []
                for item in results:
                    row = {
                        'hs_object_id': item.get('id'),
                        'hs_createdate': item.get('createdAt'),
                        'hs_updatedate': item.get('updatedAt')
                    }
                    # Ajouter les propriétés métier
                    row.update(item.get('properties', {}))
                    flattened_data.append(row)
                
                df = pd.DataFrame(flattened_data)
                return df
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"HubSpot fetch data failed: {e}")
            raise Exception(f"Erreur HubSpot: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """
        Retourne les informations configurées
        """
        return {
            'object_type': self.config.get('object_type'),
            'properties': self.config.get('properties', [])
        }
    
    def _build_headers(self) -> Dict[str, str]:
        """
        Construit les headers HubSpot (Bearer token recommandé)
        """
        if not self.credentials:
            raise Exception("Credentials HubSpot manquants")
            
        access_token = self.credentials.get('access_token')
        
        if not access_token:
            raise Exception("Access Token HubSpot (Private App) manquant")
            
        return {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
