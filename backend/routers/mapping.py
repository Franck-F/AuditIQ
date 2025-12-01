"""
Routeur pour la gestion des templates de mapping (F2.3.4 & F2.3.5)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

from db import AsyncSessionLocal
from models.user import User
from models.mapping_template import MappingTemplate
from models.dataset import Dataset
from auth_middleware import get_current_user
import pandas as pd
from pathlib import Path

router = APIRouter(prefix="/api/mapping", tags=["mapping"])
UPLOAD_DIR = Path("uploads")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


class MappingTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    use_case: Optional[str] = None
    column_mappings: Dict[str, Dict[str, str]]
    default_target_column: Optional[str] = None
    default_sensitive_attributes: Optional[List[str]] = []


class MappingTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    column_mappings: Optional[Dict[str, Dict[str, str]]] = None
    default_target_column: Optional[str] = None
    default_sensitive_attributes: Optional[List[str]] = None


class ApplyMappingRequest(BaseModel):
    template_id: Optional[int] = None
    custom_mappings: Optional[Dict[str, str]] = None


@router.get("/templates")
async def get_mapping_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    use_case: Optional[str] = None
):
    """
    F2.3.5: Récupère tous les templates de mapping de l'utilisateur
    """
    stmt = select(MappingTemplate).where(
        MappingTemplate.user_id == current_user.id
    )
    
    if use_case:
        stmt = stmt.where(MappingTemplate.use_case == use_case)
    
    stmt = stmt.order_by(MappingTemplate.usage_count.desc())
    
    result = await db.execute(stmt)
    templates = result.scalars().all()
    
    return {
        "templates": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "use_case": t.use_case,
                "column_mappings": t.column_mappings,
                "default_target_column": t.default_target_column,
                "default_sensitive_attributes": t.default_sensitive_attributes,
                "usage_count": t.usage_count,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in templates
        ]
    }


@router.post("/templates")
async def create_mapping_template(
    template_data: MappingTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.3.5: Crée un nouveau template de mapping réutilisable
    """
    # Vérifier si un template avec ce nom existe déjà
    stmt = select(MappingTemplate).where(
        MappingTemplate.user_id == current_user.id,
        MappingTemplate.name == template_data.name
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Un template nommé '{template_data.name}' existe déjà"
        )
    
    # Créer le template
    template = MappingTemplate(
        user_id=current_user.id,
        name=template_data.name,
        description=template_data.description,
        use_case=template_data.use_case,
        column_mappings=template_data.column_mappings,
        default_target_column=template_data.default_target_column,
        default_sensitive_attributes=template_data.default_sensitive_attributes
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    return {
        "message": "Template créé avec succès",
        "template": {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "use_case": template.use_case,
            "column_mappings": template.column_mappings
        }
    }


@router.get("/templates/{template_id}")
async def get_mapping_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère un template spécifique"""
    stmt = select(MappingTemplate).where(
        MappingTemplate.id == template_id,
        MappingTemplate.user_id == current_user.id
    )
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template introuvable"
        )
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "use_case": template.use_case,
        "column_mappings": template.column_mappings,
        "default_target_column": template.default_target_column,
        "default_sensitive_attributes": template.default_sensitive_attributes,
        "usage_count": template.usage_count
    }


@router.put("/templates/{template_id}")
async def update_mapping_template(
    template_id: int,
    update_data: MappingTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Met à jour un template existant"""
    stmt = select(MappingTemplate).where(
        MappingTemplate.id == template_id,
        MappingTemplate.user_id == current_user.id
    )
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template introuvable"
        )
    
    # Mettre à jour les champs
    if update_data.name:
        template.name = update_data.name
    if update_data.description is not None:
        template.description = update_data.description
    if update_data.column_mappings:
        template.column_mappings = update_data.column_mappings
    if update_data.default_target_column:
        template.default_target_column = update_data.default_target_column
    if update_data.default_sensitive_attributes is not None:
        template.default_sensitive_attributes = (
            update_data.default_sensitive_attributes
        )
    
    template.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(template)
    
    return {
        "message": "Template mis à jour",
        "template": {
            "id": template.id,
            "name": template.name,
            "column_mappings": template.column_mappings
        }
    }


@router.delete("/templates/{template_id}")
async def delete_mapping_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Supprime un template"""
    stmt = select(MappingTemplate).where(
        MappingTemplate.id == template_id,
        MappingTemplate.user_id == current_user.id
    )
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template introuvable"
        )
    
    await db.delete(template)
    await db.commit()
    
    return {"message": "Template supprimé avec succès"}


@router.post("/datasets/{dataset_id}/apply-mapping")
async def apply_mapping_to_dataset(
    dataset_id: int,
    mapping_request: ApplyMappingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    F2.3.4: Applique un mapping de colonnes à un dataset
    Permet de renommer les colonnes pour compatibilité
    """
    # Récupérer le dataset
    stmt = select(Dataset).where(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset introuvable"
        )
    
    # Déterminer les mappings à appliquer
    mappings = {}
    
    if mapping_request.template_id:
        # Utiliser un template
        template_stmt = select(MappingTemplate).where(
            MappingTemplate.id == mapping_request.template_id,
            MappingTemplate.user_id == current_user.id
        )
        template_result = await db.execute(template_stmt)
        template = template_result.scalar_one_or_none()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template introuvable"
            )
        
        # Extraire les mappings du template
        for orig, details in template.column_mappings.items():
            mappings[orig] = details.get('mapped_name', orig)
        
        # Incrémenter le compteur d'utilisation
        template.usage_count += 1
        dataset.mapping_template_id = template.id
    
    elif mapping_request.custom_mappings:
        # Utiliser des mappings personnalisés
        mappings = mapping_request.custom_mappings
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun mapping fourni"
        )
    
    # Charger le fichier
    file_path = UPLOAD_DIR / dataset.filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier dataset introuvable"
        )
    
    try:
        # Lire le fichier
        if dataset.mime_type == 'text/csv':
            df = pd.read_csv(file_path, encoding=dataset.encoding)
        else:
            df = pd.read_excel(file_path)
        
        # Appliquer les mappings
        rename_dict = {
            k: v for k, v in mappings.items() if k in df.columns
        }
        df_mapped = df.rename(columns=rename_dict)
        
        # Sauvegarder le fichier mappé
        if dataset.mime_type == 'text/csv':
            df_mapped.to_csv(file_path, index=False, encoding=dataset.encoding)
        else:
            df_mapped.to_excel(file_path, index=False)
        
        # Mettre à jour les métadonnées
        dataset.column_mappings = mappings
        dataset.columns_info['columns'] = [
            {
                'name': rename_dict.get(col['name'], col['name']),
                'type': col['type'],
                'null_count': col['null_count'],
                'null_percentage': col['null_percentage'],
                'unique_count': col['unique_count']
            }
            for col in dataset.columns_info.get('columns', [])
        ]
        dataset.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(dataset)
        
        return {
            "message": "Mapping appliqué avec succès",
            "dataset_id": dataset_id,
            "mappings_applied": rename_dict,
            "columns_renamed": len(rename_dict),
            "new_columns": list(df_mapped.columns)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'application du mapping : {str(e)}"
        )
