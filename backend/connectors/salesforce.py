"""
Connecteur Salesforce (F2.2)
Implémentation via l'API REST de Salesforce (SOQL)
"""
from typing import Dict, Any, Optional, List
import pandas as pd
import httpx
from .base import BaseConnector
import logging

logger = logging.getLogger(__name__)

class SalesforceConnector(BaseConnector):
    """
    Connecteur pour Salesforce.
    Supporte l'authentification Username/Password + Token ou OAuth2.
    """
    
    def get_required_fields(self) -> List[str]:
        # En mode simple, on demande l'instance URL et l'objet à synchroniser
        return ['instance_url', 'object_type']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à Salesforce
        """
        try:
            # On tente de récupérer les métadonnées de l'objet pour tester la connexion
            headers = await self._get_auth_headers()
            instance_url = self.config.get('instance_url').rstrip('/')
            object_type = self.config.get('object_type')
            
            url = f"{instance_url}/services/data/v57.0/sobjects/{object_type}/describe"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                return response.status_code == 200
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Salesforce connection test failed: {e}")
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données de Salesforce via SOQL
        """
        try:
            headers = await self._get_auth_headers()
            instance_url = self.config.get('instance_url').rstrip('/')
            object_type = self.config.get('object_type')
            fields = self.config.get('fields', '*') # '*' sera remplacé par les champs réels
            
            # Si fields est '*', on récupère tous les champs via describe
            if fields == '*':
                fields_list = await self._get_object_fields(headers, instance_url, object_type)
                query_fields = ", ".join(fields_list)
            else:
                query_fields = fields
            
            query = f"SELECT {query_fields} FROM {object_type}"
            limit = self.config.get('limit', 1000)
            query += f" LIMIT {limit}"
            
            url = f"{instance_url}/services/data/v57.0/query/"
            params = {'q': query}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params, timeout=30.0)
                response.raise_for_status()
                
                records = response.json().get('records', [])
                
                # Nettoyer les enregistrements (supprimer la clé 'attributes')
                clean_records = []
                for rec in records:
                    rec_copy = dict(rec)
                    rec_copy.pop('attributes', None)
                    clean_records.append(rec_copy)
                
                df = pd.DataFrame(clean_records)
                return df
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Salesforce fetch data failed: {e}")
            raise Exception(f"Erreur Salesforce: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """
        Retourne les informations configurées
        """
        return {
            'instance_url': self.config.get('instance_url'),
            'object_type': self.config.get('object_type'),
            'fields': self.config.get('fields', '*')
        }
    
    async def _get_auth_headers(self) -> Dict[str, str]:
        """
        Gère l'obtention du token d'accès
        """
        if not self.credentials:
            raise Exception("Credentials Salesforce manquants")
            
        access_token = self.credentials.get('access_token')
        
        # Si on a un client_id/secret/username/password, on peut tenter d'initier un token
        # Pour cet exemple simplifié, on suppose que le frontend ou le middleware a déjà fourni l'access_token
        # ou qu'il est stocké dans les credentials.
        
        if not access_token:
            # Tentative de login via Username/Password + Security Token (OAuth2 Resource Owner Password Flow)
            # Note: Salesforce recommande le JWT flow en production.
            username = self.credentials.get('username')
            password = self.credentials.get('password')
            client_id = self.credentials.get('client_id')
            client_secret = self.credentials.get('client_secret')
            
            if username and password and client_id and client_secret:
                token_url = f"{self.config.get('instance_url')}/services/oauth2/token"
                payload = {
                    'grant_type': 'password',
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'username': username,
                    'password': password
                }
                async with httpx.AsyncClient() as client:
                    resp = await client.post(token_url, data=payload)
                    if resp.status_code == 200:
                        access_token = resp.json().get('access_token')
            
        if not access_token:
            raise Exception("Impossible d'obtenir un token d'accès Salesforce")
            
        return {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    async def _get_object_fields(self, headers: Dict[str, str], instance_url: str, object_type: str) -> List[str]:
        """Récupère la liste des champs d'un objet"""
        url = f"{instance_url}/services/data/v57.0/sobjects/{object_type}/describe"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            fields = response.json().get('fields', [])
            # On ne prend que les champs simples (pas les relations complexes pour l'instant)
            return [f.get('name') for f in fields if f.get('type') not in ['address', 'location']]
