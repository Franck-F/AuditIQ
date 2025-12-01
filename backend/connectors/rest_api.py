"""
Connecteur API REST générique (F2.2.1)
"""
from typing import Dict, Any, Optional
import pandas as pd
from .base import BaseConnector
import httpx
import json


class RestApiConnector(BaseConnector):
    """
    Connecteur générique pour API REST
    F2.2.1: Connecteur API REST générique (OAuth/API Key)
    """
    
    def get_required_fields(self) -> list[str]:
        return ['url', 'method']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à l'API REST
        """
        try:
            headers = self._build_headers()
            url = self.config.get('url')
            method = self.config.get('method', 'GET').upper()
            
            async with httpx.AsyncClient() as client:
                if method == 'GET':
                    response = await client.get(url, headers=headers, timeout=10.0)
                elif method == 'POST':
                    response = await client.post(url, headers=headers, timeout=10.0)
                else:
                    return False
                
                return response.status_code in [200, 201]
                
        except Exception as e:
            self.last_error = str(e)
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données depuis l'API REST
        """
        try:
            headers = self._build_headers()
            url = self.config.get('url')
            method = self.config.get('method', 'GET').upper()
            body = self.config.get('body')
            params = self.config.get('params', {})
            
            async with httpx.AsyncClient() as client:
                if method == 'GET':
                    response = await client.get(url, headers=headers, params=params, timeout=30.0)
                elif method == 'POST':
                    response = await client.post(
                        url, 
                        headers=headers, 
                        params=params,
                        json=body if body else None,
                        timeout=30.0
                    )
                else:
                    raise Exception(f"Méthode HTTP non supportée: {method}")
                
                response.raise_for_status()
                data = response.json()
                
                # Extraire les données selon le chemin configuré
                data_path = self.config.get('data_path', '')
                if data_path:
                    for key in data_path.split('.'):
                        if key:
                            data = data.get(key, data)
                
                # Convertir en DataFrame
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                elif isinstance(data, dict):
                    df = pd.DataFrame([data])
                else:
                    raise Exception("Format de données non supporté")
                
                return df
                
        except Exception as e:
            self.last_error = str(e)
            raise Exception(f"Erreur lors de la récupération des données: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """
        Retourne le schéma de l'API (si disponible via OPTIONS ou documentation)
        """
        return {
            'url': self.config.get('url'),
            'method': self.config.get('method'),
            'authentication': self.credentials.get('auth_type') if self.credentials else None
        }
    
    def _build_headers(self) -> Dict[str, str]:
        """
        Construit les headers HTTP avec authentification
        """
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Ajouter les headers personnalisés
        custom_headers = self.config.get('headers', {})
        headers.update(custom_headers)
        
        # Authentification
        if self.credentials:
            auth_type = self.credentials.get('auth_type')
            
            if auth_type == 'api_key':
                # API Key authentication
                key_name = self.credentials.get('key_name', 'Authorization')
                key_value = self.credentials.get('api_key')
                prefix = self.credentials.get('key_prefix', 'Bearer')
                
                if prefix:
                    headers[key_name] = f"{prefix} {key_value}"
                else:
                    headers[key_name] = key_value
                    
            elif auth_type == 'oauth2':
                # OAuth2 Bearer token
                access_token = self.credentials.get('access_token')
                headers['Authorization'] = f"Bearer {access_token}"
                
            elif auth_type == 'basic':
                # Basic authentication
                import base64
                username = self.credentials.get('username')
                password = self.credentials.get('password')
                credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
                headers['Authorization'] = f"Basic {credentials}"
        
        return headers
