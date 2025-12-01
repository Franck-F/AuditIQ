"""
Migration pour ajouter les colonnes de gestion des profils
F1.3.1, F1.3.2, F1.3.4, F1.3.5
"""

import sqlite3
import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour importer db
sys.path.append(str(Path(__file__).parent.parent))

def migrate_profile_management():
    """Ajoute les colonnes pour la gestion des profils et multi-utilisateurs"""
    conn = sqlite3.connect('_dev.db')
    cursor = conn.cursor()
    
    # Liste des nouvelles colonnes à ajouter
    new_columns = [
        ("role", "TEXT DEFAULT 'admin'"),
        ("company_id", "TEXT"),
        ("notifications_enabled", "INTEGER DEFAULT 1"),
        ("language", "TEXT DEFAULT 'fr'"),
        ("timezone", "TEXT DEFAULT 'Europe/Paris'"),
        ("is_active", "INTEGER DEFAULT 1"),
        ("deleted_at", "TEXT"),
    ]
    
    # Vérifier quelles colonnes existent déjà
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
    # Ajouter chaque colonne si elle n'existe pas
    for column_name, column_def in new_columns:
        if column_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_def}")
                print(f"✓ Colonne '{column_name}' ajoutée avec succès")
            except sqlite3.OperationalError as e:
                print(f"✗ Erreur lors de l'ajout de '{column_name}': {e}")
        else:
            print(f"○ Colonne '{column_name}' existe déjà")
    
    conn.commit()
    conn.close()
    print("\n✓ Migration terminée avec succès!")

if __name__ == "__main__":
    migrate_profile_management()
