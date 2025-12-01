"""
Classe de base pour les connecteurs de données externes
F2.2.1 à F2.2.4
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import pandas as pd
from datetime import datetime


class BaseConnector(ABC):
    """
    Classe abstraite pour tous les connecteurs de données
    """
    
    def __init__(self, config: Dict[str, Any], credentials: Optional[Dict[str, Any]] = None):
        """
        Initialise le connecteur
        
        Args:
            config: Configuration du connecteur
            credentials: Credentials décryptés
        """
        self.config = config
        self.credentials = credentials
        self.last_error = None
    
    @abstractmethod
    async def test_connection(self) -> bool:
        """
        Teste la connexion à la source de données
        
        Returns:
            True si connexion réussie, False sinon
        """
        pass
    
    @abstractmethod
    async def fetch_data(self) -> pd.DataFrame:
        """
        Récupère les données depuis la source
        
        Returns:
            DataFrame avec les données
        """
        pass
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """
        Retourne le schéma des données disponibles
        
        Returns:
            Dictionnaire décrivant les colonnes et types
        """
        pass
    
    def validate_config(self) -> tuple[bool, Optional[str]]:
        """
        Valide la configuration du connecteur
        
        Returns:
            (is_valid, error_message)
        """
        required_fields = self.get_required_fields()
        
        for field in required_fields:
            if field not in self.config:
                return False, f"Champ requis manquant: {field}"
        
        return True, None
    
    @abstractmethod
    def get_required_fields(self) -> list[str]:
        """
        Retourne la liste des champs requis pour la configuration
        """
        pass
    
    def get_display_name(self) -> str:
        """
        Retourne le nom d'affichage du connecteur
        """
        return self.__class__.__name__.replace("Connector", "")
