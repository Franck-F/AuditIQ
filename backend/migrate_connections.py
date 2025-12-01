"""
Script de migration pour ajouter les tables de connexions de données
F2.2.1 à F2.2.4
"""
import asyncio
from sqlalchemy import text
from db import AsyncSessionLocal, engine


async def create_data_connections_tables():
    """Crée les tables data_connections et sync_history"""
    
    async with engine.begin() as conn:
        # Table data_connections
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS data_connections (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                connection_type VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                config JSONB NOT NULL,
                encrypted_credentials TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                last_sync TIMESTAMP,
                last_sync_status VARCHAR(50),
                last_sync_error TEXT,
                auto_sync_enabled BOOLEAN DEFAULT FALSE,
                sync_frequency VARCHAR(20),
                sync_schedule JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Table sync_history
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sync_history (
                id SERIAL PRIMARY KEY,
                connection_id INTEGER NOT NULL REFERENCES data_connections(id) ON DELETE CASCADE,
                sync_started_at TIMESTAMP NOT NULL,
                sync_completed_at TIMESTAMP,
                status VARCHAR(50) NOT NULL,
                error_message TEXT,
                rows_fetched INTEGER DEFAULT 0,
                data_size_bytes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Ajouter la colonne connection_id à la table datasets si elle n'existe pas
        await conn.execute(text("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='datasets' AND column_name='connection_id'
                ) THEN
                    ALTER TABLE datasets ADD COLUMN connection_id INTEGER REFERENCES data_connections(id) ON DELETE SET NULL;
                END IF;
            END $$;
        """))
        
        # Créer des index
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_data_connections_user_id ON data_connections(user_id);
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_data_connections_type ON data_connections(connection_type);
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sync_history_connection ON sync_history(connection_id);
        """))
        
        print("✅ Tables data_connections et sync_history créées avec succès")


async def main():
    try:
        await create_data_connections_tables()
        print("✅ Migration terminée avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
