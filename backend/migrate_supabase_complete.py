"""
Script de migration complet pour créer toutes les tables sur Supabase
"""
import asyncio
from sqlalchemy import text, inspect
from db import AsyncSessionLocal, engine, init_models


async def check_tables():
    """Vérifie quelles tables existent déjà"""
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        existing_tables = [row[0] for row in result.fetchall()]
        return existing_tables


async def create_all_tables():
    """Crée toutes les tables définies dans les modèles"""
    print("🔄 Démarrage de la migration complète vers Supabase...")
    print(f"📍 Connexion à: {engine.url.host}")
    
    # Importer tous les modèles pour qu'ils soient enregistrés
    print("\n📦 Import des modèles...")
    from models.user import User
    from models.auth import LoginLog, PasswordResetToken
    from models.dataset import Dataset, Audit, DataConnection
    
    print("✅ Modèles importés:")
    print("   - User")
    print("   - LoginLog")
    print("   - PasswordResetToken")
    print("   - Dataset")
    print("   - Audit")
    print("   - DataConnection")
    
    # Vérifier les tables existantes
    print("\n🔍 Vérification des tables existantes...")
    existing_tables = await check_tables()
    
    if existing_tables:
        print(f"✅ Tables existantes ({len(existing_tables)}):")
        for table in existing_tables:
            print(f"   - {table}")
    else:
        print("⚠️  Aucune table trouvée")
    
    # Créer toutes les tables
    print("\n🏗️  Création des tables manquantes...")
    await init_models()
    
    # Vérifier après création
    print("\n✅ Vérification finale...")
    final_tables = await check_tables()
    
    print(f"\n📊 Tables finales sur Supabase ({len(final_tables)}):")
    for table in sorted(final_tables):
        status = "✅" if table in existing_tables else "🆕"
        print(f"   {status} {table}")
    
    # Vérifier les colonnes de chaque table
    print("\n📋 Structure des tables principales:")
    
    async with engine.connect() as conn:
        for table in ['users', 'datasets', 'audits', 'data_connections', 'login_logs', 'password_reset_tokens']:
            if table in final_tables:
                result = await conn.execute(text(f"""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = '{table}'
                    AND table_schema = 'public'
                    ORDER BY ordinal_position
                """))
                columns = result.fetchall()
                print(f"\n   📄 {table} ({len(columns)} colonnes):")
                for col in columns[:5]:  # Afficher les 5 premières colonnes
                    nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                    print(f"      - {col[0]}: {col[1]} {nullable}")
                if len(columns) > 5:
                    print(f"      ... et {len(columns) - 5} autres colonnes")
    
    print("\n" + "="*60)
    print("✅ Migration terminée avec succès!")
    print("🎉 Toutes les tables sont maintenant sur Supabase")
    print("="*60)


async def verify_relationships():
    """Vérifie les relations entre les tables"""
    print("\n🔗 Vérification des relations...")
    
    async with engine.connect() as conn:
        # Vérifier les foreign keys
        result = await conn.execute(text("""
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name, kcu.column_name
        """))
        
        relationships = result.fetchall()
        
        if relationships:
            print(f"✅ Relations trouvées ({len(relationships)}):")
            for rel in relationships:
                print(f"   - {rel[0]}.{rel[1]} → {rel[2]}.{rel[3]}")
        else:
            print("⚠️  Aucune relation trouvée")


async def add_indexes():
    """Ajoute des index pour améliorer les performances"""
    print("\n📈 Ajout des index de performance...")
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status)",
        "CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_audits_dataset_id ON audits(dataset_id)",
        "CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status)",
        "CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_login_logs_timestamp ON login_logs(timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_data_connections_user_id ON data_connections(user_id)",
    ]
    
    async with AsyncSessionLocal() as session:
        for idx_query in indexes:
            try:
                await session.execute(text(idx_query))
                index_name = idx_query.split("IF NOT EXISTS ")[1].split(" ON")[0]
                print(f"   ✅ {index_name}")
            except Exception as e:
                print(f"   ⚠️  Erreur index: {str(e)[:50]}")
        
        await session.commit()
    
    print("✅ Index créés avec succès")


async def main():
    """Fonction principale"""
    try:
        # Créer toutes les tables
        await create_all_tables()
        
        # Vérifier les relations
        await verify_relationships()
        
        # Ajouter les index
        await add_indexes()
        
        print("\n" + "="*60)
        print("🎊 Migration complète terminée!")
        print("📊 Votre base de données Supabase est prête")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Erreur lors de la migration: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
