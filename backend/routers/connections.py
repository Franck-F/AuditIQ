"""
Routeur pour la gestion des connexions de données externes
F2.2.1 à F2.2.4
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from db import AsyncSessionLocal
from models.user import User
from models.data_connection import DataConnection, SyncHistory
from models.dataset import Dataset
from auth_middleware import get_current_user
from connectors.base import BaseConnector
from connectors.rest_api import RestApiConnector
from connectors.google_sheets import GoogleSheetsConnector
import pandas as pd
from cryptography.fernet import Fernet
import json
import os

router = APIRouter(prefix="/api/connections", tags=["connections"])

# Clé de chiffrement (à stocker en variable d'environnement en production)
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY)


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic models
class ConnectionTypeInfo(BaseModel):
    """Information sur un type de connexion disponible"""
    type: str
    name: str
    description: str
    required_fields: List[str]
    auth_types: List[str]
    icon: str


class CreateConnectionRequest(BaseModel):
    """Requête de création de connexion"""
    connection_type: str
    name: str
    config: Dict[str, Any]
    credentials: Optional[Dict[str, Any]] = None
    auto_sync_enabled: bool = False
    sync_frequency: Optional[str] = None


class UpdateConnectionRequest(BaseModel):
    """Requête de mise à jour de connexion"""
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    credentials: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    auto_sync_enabled: Optional[bool] = None
    sync_frequency: Optional[str] = None


class ConnectionResponse(BaseModel):
    """Réponse avec informations de connexion"""
    id: int
    connection_type: str
    name: str
    config: Dict[str, Any]
    is_active: bool
    last_sync: Optional[datetime]
    last_sync_status: Optional[str]
    auto_sync_enabled: bool
    sync_frequency: Optional[str]
    created_at: datetime


class TestConnectionRequest(BaseModel):
    """Requête de test de connexion"""
    connection_type: str
    config: Dict[str, Any]
    credentials: Optional[Dict[str, Any]] = None


class SyncRequest(BaseModel):
    """Requête de synchronisation manuelle"""
    save_as_dataset: bool = True
    dataset_name: Optional[str] = None


def encrypt_credentials(credentials: Dict[str, Any]) -> str:
    """F2.2.3: Chiffre les credentials"""
    json_credentials = json.dumps(credentials)
    encrypted = cipher_suite.encrypt(json_credentials.encode())
    return encrypted.decode()


def decrypt_credentials(encrypted: str) -> Dict[str, Any]:
    """F2.2.3: Déchiffre les credentials"""
    decrypted = cipher_suite.decrypt(encrypted.encode())
    return json.loads(decrypted.decode())


def get_connector(connection_type: str, config: Dict[str, Any], credentials: Optional[Dict[str, Any]] = None) -> BaseConnector:
    """Factory pour créer le connecteur approprié"""
    connectors = {
        'rest_api': RestApiConnector,
        'google_sheets': GoogleSheetsConnector,
        # Ajouter d'autres connecteurs ici
    }
    
    connector_class = connectors.get(connection_type)
    if not connector_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de connexion non supporté: {connection_type}"
        )
    
    return connector_class(config, credentials)


@router.get("/types", response_model=List[ConnectionTypeInfo])
async def list_connection_types():
    """
    F2.2.1 & F2.2.2: Liste tous les types de connexions disponibles
    """
    return [
        ConnectionTypeInfo(
            type="rest_api",
            name="API REST",
            description="Connecteur générique pour API REST avec support OAuth/API Key",
            required_fields=["url", "method"],
            auth_types=["api_key", "oauth2", "basic", "none"],
            icon="api"
        ),
        ConnectionTypeInfo(
            type="google_sheets",
            name="Google Sheets",
            description="Importer des données depuis Google Sheets",
            required_fields=["spreadsheet_id", "worksheet_name"],
            auth_types=["oauth2", "service_account"],
            icon="google-sheets"
        ),
        ConnectionTypeInfo(
            type="salesforce",
            name="Salesforce",
            description="Connecteur pour Salesforce (scoring clients)",
            required_fields=["instance_url", "api_version"],
            auth_types=["oauth2"],
            icon="salesforce"
        ),
        ConnectionTypeInfo(
            type="workday",
            name="Workday",
            description="Connecteur pour Workday (données RH)",
            required_fields=["tenant_url", "api_version"],
            auth_types=["oauth2", "basic"],
            icon="workday"
        ),
        ConnectionTypeInfo(
            type="bamboohr",
            name="BambooHR",
            description="Connecteur pour BambooHR (données RH)",
            required_fields=["subdomain"],
            auth_types=["api_key"],
            icon="bamboohr"
        ),
        ConnectionTypeInfo(
            type="hubspot",
            name="HubSpot",
            description="Connecteur pour HubSpot CRM",
            required_fields=["portal_id"],
            auth_types=["api_key", "oauth2"],
            icon="hubspot"
        ),
        ConnectionTypeInfo(
            type="pipedrive",
            name="Pipedrive",
            description="Connecteur pour Pipedrive CRM",
            required_fields=["company_domain"],
            auth_types=["api_key"],
            icon="pipedrive"
        )
    ]


@router.post("/test")
async def test_connection(
    request: TestConnectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Teste une connexion avant de la créer
    """
    try:
        connector = get_connector(request.connection_type, request.config, request.credentials)
        
        # Valider la configuration
        is_valid, error = connector.validate_config()
        if not is_valid:
            return {
                "success": False,
                "error": error
            }
        
        # Tester la connexion
        is_connected = await connector.test_connection()
        
        if is_connected:
            # Essayer de récupérer le schéma
            try:
                schema = connector.get_schema()
                return {
                    "success": True,
                    "message": "Connexion réussie",
                    "schema": schema
                }
            except:
                return {
                    "success": True,
                    "message": "Connexion réussie"
                }
        else:
            return {
                "success": False,
                "error": connector.last_error or "Impossible de se connecter"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/", response_model=ConnectionResponse)
async def create_connection(
    request: CreateConnectionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.2.1 à F2.2.3: Crée une nouvelle connexion
    """
    # F2.2.3: Chiffrer les credentials
    encrypted_creds = None
    if request.credentials:
        encrypted_creds = encrypt_credentials(request.credentials)
    
    connection = DataConnection(
        user_id=current_user.id,
        connection_type=request.connection_type,
        name=request.name,
        config=request.config,
        encrypted_credentials=encrypted_creds,
        auto_sync_enabled=request.auto_sync_enabled,
        sync_frequency=request.sync_frequency
    )
    
    db.add(connection)
    await db.commit()
    await db.refresh(connection)
    
    return ConnectionResponse(
        id=connection.id,
        connection_type=connection.connection_type,
        name=connection.name,
        config=connection.config,
        is_active=connection.is_active,
        last_sync=connection.last_sync,
        last_sync_status=connection.last_sync_status,
        auto_sync_enabled=connection.auto_sync_enabled,
        sync_frequency=connection.sync_frequency,
        created_at=connection.created_at
    )


@router.get("/", response_model=List[ConnectionResponse])
async def list_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Liste toutes les connexions de l'utilisateur
    """
    stmt = select(DataConnection).where(
        DataConnection.user_id == current_user.id
    ).order_by(DataConnection.created_at.desc())
    
    result = await db.execute(stmt)
    connections = result.scalars().all()
    
    return [
        ConnectionResponse(
            id=c.id,
            connection_type=c.connection_type,
            name=c.name,
            config=c.config,
            is_active=c.is_active,
            last_sync=c.last_sync,
            last_sync_status=c.last_sync_status,
            auto_sync_enabled=c.auto_sync_enabled,
            sync_frequency=c.sync_frequency,
            created_at=c.created_at
        )
        for c in connections
    ]


@router.get("/{connection_id}", response_model=ConnectionResponse)
async def get_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère les détails d'une connexion
    """
    stmt = select(DataConnection).where(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id
    )
    result = await db.execute(stmt)
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connexion introuvable"
        )
    
    return ConnectionResponse(
        id=connection.id,
        connection_type=connection.connection_type,
        name=connection.name,
        config=connection.config,
        is_active=connection.is_active,
        last_sync=connection.last_sync,
        last_sync_status=connection.last_sync_status,
        auto_sync_enabled=connection.auto_sync_enabled,
        sync_frequency=connection.sync_frequency,
        created_at=connection.created_at
    )


@router.put("/{connection_id}", response_model=ConnectionResponse)
async def update_connection(
    connection_id: int,
    request: UpdateConnectionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Met à jour une connexion existante
    """
    stmt = select(DataConnection).where(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id
    )
    result = await db.execute(stmt)
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connexion introuvable"
        )
    
    # Mettre à jour les champs
    if request.name is not None:
        connection.name = request.name
    if request.config is not None:
        connection.config = request.config
    if request.credentials is not None:
        connection.encrypted_credentials = encrypt_credentials(request.credentials)
    if request.is_active is not None:
        connection.is_active = request.is_active
    if request.auto_sync_enabled is not None:
        connection.auto_sync_enabled = request.auto_sync_enabled
    if request.sync_frequency is not None:
        connection.sync_frequency = request.sync_frequency
    
    connection.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(connection)
    
    return ConnectionResponse(
        id=connection.id,
        connection_type=connection.connection_type,
        name=connection.name,
        config=connection.config,
        is_active=connection.is_active,
        last_sync=connection.last_sync,
        last_sync_status=connection.last_sync_status,
        auto_sync_enabled=connection.auto_sync_enabled,
        sync_frequency=connection.sync_frequency,
        created_at=connection.created_at
    )


@router.delete("/{connection_id}")
async def delete_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Supprime une connexion
    """
    stmt = select(DataConnection).where(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id
    )
    result = await db.execute(stmt)
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connexion introuvable"
        )
    
    await db.delete(connection)
    await db.commit()
    
    return {"message": "Connexion supprimée"}


@router.post("/{connection_id}/sync")
async def sync_connection(
    connection_id: int,
    request: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.2.4: Synchronise manuellement une connexion et crée un dataset
    """
    # Récupérer la connexion
    stmt = select(DataConnection).where(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id
    )
    result = await db.execute(stmt)
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connexion introuvable"
        )
    
    # Créer l'historique de sync
    sync_history = SyncHistory(
        connection_id=connection_id,
        sync_started_at=datetime.utcnow(),
        status='pending'
    )
    db.add(sync_history)
    await db.commit()
    
    try:
        # Déchiffrer les credentials
        credentials = None
        if connection.encrypted_credentials:
            credentials = decrypt_credentials(connection.encrypted_credentials)
        
        # Créer le connecteur
        connector = get_connector(connection.connection_type, connection.config, credentials)
        
        # Récupérer les données
        df = await connector.fetch_data()
        
        if df.empty:
            raise Exception("Aucune donnée récupérée")
        
        # Mettre à jour l'historique
        sync_history.sync_completed_at = datetime.utcnow()
        sync_history.status = 'success'
        sync_history.rows_fetched = len(df)
        
        # Mettre à jour la connexion
        connection.last_sync = datetime.utcnow()
        connection.last_sync_status = 'success'
        
        await db.commit()
        
        return {
            "success": True,
            "rows_fetched": len(df),
            "columns": list(df.columns),
            "preview": df.head(5).to_dict('records')
        }
        
    except Exception as e:
        # Mettre à jour l'historique avec l'erreur
        sync_history.sync_completed_at = datetime.utcnow()
        sync_history.status = 'error'
        sync_history.error_message = str(e)
        
        connection.last_sync = datetime.utcnow()
        connection.last_sync_status = 'error'
        connection.last_sync_error = str(e)
        
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de synchronisation: {str(e)}"
        )


@router.get("/{connection_id}/history")
async def get_sync_history(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère l'historique de synchronisation
    """
    # Vérifier que la connexion appartient à l'utilisateur
    stmt = select(DataConnection).where(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id
    )
    result = await db.execute(stmt)
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connexion introuvable"
        )
    
    # Récupérer l'historique
    stmt = select(SyncHistory).where(
        SyncHistory.connection_id == connection_id
    ).order_by(SyncHistory.sync_started_at.desc()).limit(50)
    
    result = await db.execute(stmt)
    history = result.scalars().all()
    
    return [
        {
            "id": h.id,
            "sync_started_at": h.sync_started_at,
            "sync_completed_at": h.sync_completed_at,
            "status": h.status,
            "error_message": h.error_message,
            "rows_fetched": h.rows_fetched,
            "data_size_bytes": h.data_size_bytes
        }
        for h in history
    ]
