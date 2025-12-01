"""
Connecteur Google Sheets (F2.2.2)
"""
from typing import Dict, Any, Optional
import pandas as pd
from .base import BaseConnector
import gspread
from oauth2client.service_account import ServiceAccountCredentials


class GoogleSheetsConnector(BaseConnector):
    """
    Connecteur pour Google Sheets
    F2.2.2: Connecteur natif Google Sheets
    """
    
    def get_required_fields(self) -> list[str]:
        return ['spreadsheet_id', 'worksheet_name']
    
    async def test_connection(self) -> bool:
        """
        Teste la connexion à Google Sheets
        """
        try:
            client = self._get_client()
            spreadsheet_id = self.config.get('spreadsheet_id')
            spreadsheet = client.open_by_key(spreadsheet_id)
            return True
        except Exception as e:
            self.last_error = str(e)
            return False
    
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données depuis Google Sheets
        """
        try:
            client = self._get_client()
            spreadsheet_id = self.config.get('spreadsheet_id')
            worksheet_name = self.config.get('worksheet_name', 'Sheet1')
            
            spreadsheet = client.open_by_key(spreadsheet_id)
            worksheet = spreadsheet.worksheet(worksheet_name)
            
            # Récupérer toutes les valeurs
            data = worksheet.get_all_values()
            
            if not data:
                return pd.DataFrame()
            
            # Première ligne = headers
            headers = data[0]
            rows = data[1:]
            
            df = pd.DataFrame(rows, columns=headers)
            
            return df
            
        except Exception as e:
            self.last_error = str(e)
            raise Exception(f"Erreur lors de la récupération des données: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """
        Retourne le schéma de la feuille Google Sheets
        """
        try:
            client = self._get_client()
            spreadsheet_id = self.config.get('spreadsheet_id')
            worksheet_name = self.config.get('worksheet_name', 'Sheet1')
            
            spreadsheet = client.open_by_key(spreadsheet_id)
            worksheet = spreadsheet.worksheet(worksheet_name)
            
            # Récupérer la première ligne (headers)
            headers = worksheet.row_values(1)
            
            return {
                'columns': headers,
                'row_count': worksheet.row_count,
                'col_count': worksheet.col_count
            }
            
        except Exception as e:
            self.last_error = str(e)
            return {}
    
    def _get_client(self):
        """
        Crée un client Google Sheets authentifié
        """
        if not self.credentials:
            raise Exception("Credentials manquants pour Google Sheets")
        
        # Utiliser OAuth2 ou Service Account
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        
        if 'service_account_json' in self.credentials:
            # Service Account
            creds = ServiceAccountCredentials.from_json_keyfile_dict(
                self.credentials['service_account_json'],
                scope
            )
        else:
            # OAuth2 token
            # Implementation OAuth2 flow
            raise NotImplementedError("OAuth2 flow non implémenté")
        
        client = gspread.authorize(creds)
        return client
