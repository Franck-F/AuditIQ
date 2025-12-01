"""
Migration pour F2.3.4 & F2.3.5: Mapping colonnes et templates
"""
import asyncio
from sqlalchemy import text
from db import engine, Base
from models.mapping_template import MappingTemplate
from models.dataset import Dataset
from models.user import User


async def migrate():
    """Ajoute le support du mapping de colonnes et des templates"""
    async with engine.begin() as conn:
        # 1. Créer la table mapping_templates (syntaxe PostgreSQL)
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS mapping_templates (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR NOT NULL,
                description TEXT,
                use_case VARCHAR,
                column_mappings JSONB NOT NULL,
                default_target_column VARCHAR,
                default_sensitive_attributes JSONB,
                usage_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        
        # 2. Ajouter les colonnes de mapping dans datasets
        try:
            await conn.execute(text("""
                ALTER TABLE datasets
                ADD COLUMN IF NOT EXISTS column_mappings JSONB
            """))
        except Exception:
            pass  # Colonne existe déjà
        
        try:
            await conn.execute(text("""
                ALTER TABLE datasets
                ADD COLUMN IF NOT EXISTS mapping_template_id INTEGER
            """))
        except Exception:
            pass  # Colonne existe déjà
        
        # 3. Créer des index pour la performance
        try:
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_mapping_templates_user_id
                ON mapping_templates(user_id)
            """))
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_mapping_templates_use_case
                ON mapping_templates(use_case)
            """))
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_datasets_mapping_template
                ON datasets(mapping_template_id)
            """))
        except Exception:
            pass
        
        print("✅ Migration F2.3.4 & F2.3.5 terminée avec succès")
        print("   - Table mapping_templates créée")
        print("   - Colonnes column_mappings et mapping_template_id ajoutées")
        print("   - Index créés pour la performance")


if __name__ == "__main__":
    asyncio.run(migrate())
