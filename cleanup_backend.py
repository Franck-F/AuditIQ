"""Script de nettoyage complet du backend AuditIQ"""
import os
from pathlib import Path
import shutil

# Fichiers temporaires à supprimer
temp_files = [
    # Scripts de vérification/debug
    "check_env.py",
    "read_env_raw.py",
    "check_anonymization_columns.py",
    "check_api_url.py",
    "check_db_url.py",
    "check_models.py",
    "debug_dataset.py",
    "debug_start.py",
    "show_db.py",
    
    # Scripts de test
    "test_anonymization.py",
    "test_api_direct.py",
    "test_auth.py",
    "test_configure_with_anonymization.py",
    "test_connection.py",
    "test_curl.ps1",
    "test_data.csv",
    "test_db_check.py",
    "test_endpoint.py",
    "test_fairness_engine.py",
    "test_gemini.py",
    "test_import.py",
    "test_login.py",
    "test_mapping_features.py",
    "test_missing_values.py",
    "test_report_engine.py",
    "test_upload_flow.py",
    
    # Scripts de migration (déjà exécutés)
    "migrate_auth.py",
    "migrate_connections.py",
    "migrate_datasets.py",
    "migrate_db.py",
    "migrate_mapping.py",
    "migrate_profile_management.py",
    "migrate_supabase_complete.py",
    
    # Scripts d'initialisation (déjà exécutés)
    "init_db.py",
    "init_postgres.py",
    "create_eda_tables.py",
    "create_test_user.py",
    
    # Scripts de vérification
    "verify_full_project.py",
    "view_users.py",
    
    # Fichiers de log
    "error.log",
    "verification_result.log",
    
    # Base de données de développement
    "_dev.db",
    
    # Fichiers Docker de dev
    "docker-compose.db.yml",
    
    # Documentation de statut (temporaire)
    "F2.3_STATUS.md",
]

# Dossiers à nettoyer
dirs_to_clean = [
    "__pycache__",
]

def main():
    base_dir = Path("backend")
    removed_files = 0
    removed_dirs = 0
    
    print("🧹 Nettoyage du backend AuditIQ...\n")
    
    # Supprimer les fichiers temporaires
    print("📄 Suppression des fichiers temporaires:")
    for file_path in temp_files:
        full_path = base_dir / file_path
        if full_path.exists():
            full_path.unlink()
            print(f"  ✓ Supprimé: {file_path}")
            removed_files += 1
        else:
            print(f"  ⊘ Déjà absent: {file_path}")
    
    # Supprimer les dossiers __pycache__
    print(f"\n📁 Suppression des dossiers de cache:")
    for root, dirs, files in os.walk(base_dir):
        for dir_name in dirs:
            if dir_name == "__pycache__":
                dir_path = Path(root) / dir_name
                shutil.rmtree(dir_path)
                print(f"  ✓ Supprimé: {dir_path.relative_to(base_dir)}")
                removed_dirs += 1
    
    # Supprimer les fichiers .pyc
    print(f"\n🗑️  Suppression des fichiers .pyc:")
    pyc_count = 0
    for root, dirs, files in os.walk(base_dir):
        for file_name in files:
            if file_name.endswith('.pyc'):
                file_path = Path(root) / file_name
                file_path.unlink()
                pyc_count += 1
    if pyc_count > 0:
        print(f"  ✓ Supprimé {pyc_count} fichiers .pyc")
    else:
        print(f"  ⊘ Aucun fichier .pyc trouvé")
    
    print(f"\n✅ Nettoyage terminé!")
    print(f"   {removed_files} fichiers supprimés")
    print(f"   {removed_dirs} dossiers __pycache__ supprimés")
    print(f"   {pyc_count} fichiers .pyc supprimés")
    
    print(f"\n📚 Fichiers conservés:")
    print(f"   ✓ Code source (routers/, models/, services/)")
    print(f"   ✓ Configuration (.env, requirements.txt)")
    print(f"   ✓ Documentation (docs/, README.md)")
    print(f"   ✓ Migrations SQL (migrations/)")
    print(f"   ✓ Tests unitaires (tests/)")
    print(f"   ✓ Connecteurs (connectors/)")
    print(f"   ✓ Utilitaires (utils/)")
    
    print(f"\n⚠️  À vérifier manuellement:")
    print(f"   - uploads/ (contient les datasets uploadés)")
    print(f"   - reports/ (contient les rapports générés)")
    print(f"   - alembic/ (migrations Alembic - à garder si utilisé)")

if __name__ == "__main__":
    main()
