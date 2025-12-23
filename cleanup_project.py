"""Script de nettoyage du projet AuditIQ"""
import os
from pathlib import Path

# Fichiers temporaires à supprimer
temp_files = [
    # Scripts temporaires de correction
    "update_steps.py",
    "reorder_steps.py",
    "fix_audit_step.py",
    "fix_routes.py",
    "fix_step_transitions.py",
    "add_predictions_ui.py",
    "add_ml_columns.py",
    
    # Scripts backend temporaires
    "backend/fix_env.py",
    "backend/update_frontend_env.py",
    "backend/update_env_password.py",
    "backend/update_env.py",
]

# Dossiers/fichiers à nettoyer
patterns_to_remove = [
    "**/__pycache__",
    "**/*.pyc",
    "**/.pytest_cache",
    "**/node_modules/.cache",
    "**/.next/cache",
]

def main():
    base_dir = Path(".")
    removed_count = 0
    
    print("🧹 Nettoyage du projet AuditIQ...\n")
    
    # Supprimer les fichiers temporaires
    print("📄 Suppression des scripts temporaires:")
    for file_path in temp_files:
        full_path = base_dir / file_path
        if full_path.exists():
            full_path.unlink()
            print(f"  ✓ Supprimé: {file_path}")
            removed_count += 1
        else:
            print(f"  ⊘ Déjà absent: {file_path}")
    
    print(f"\n✅ Nettoyage terminé!")
    print(f"   {removed_count} fichiers supprimés")
    print(f"\n📚 Fichiers conservés:")
    print(f"   - Code source (backend/, app/, components/)")
    print(f"   - Configuration (package.json, requirements.txt, .env)")
    print(f"   - Documentation (README.md, docs/)")
    print(f"   - Migrations SQL (backend/migrations/)")

if __name__ == "__main__":
    main()
