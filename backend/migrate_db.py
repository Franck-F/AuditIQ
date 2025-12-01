import sqlite3
import os

db_path = '_dev.db'

if os.path.exists(db_path):
    print(f" Mise à jour de la base de données {db_path}...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Vérifier quelles colonnes existent déjà
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Colonnes existantes: {', '.join(columns)}")
    
    # Ajouter les nouvelles colonnes si elles n'existent pas
    new_columns = [
        ("siret", "TEXT"),
        ("company_address", "TEXT"),
        ("dpo_contact", "TEXT"),
        ("plan", "TEXT DEFAULT 'freemium'"),
        ("onboarding_completed", "INTEGER DEFAULT 0"),
        ("use_case", "TEXT"),
    ]
    
    for col_name, col_type in new_columns:
        if col_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f" Colonne '{col_name}' ajoutée")
            except sqlite3.OperationalError as e:
                print(f"  Erreur lors de l'ajout de '{col_name}': {e}")
        else:
            print(f"ℹ  Colonne '{col_name}' existe déjà")
    
    conn.commit()
    conn.close()
    print(" Mise à jour terminée!")
else:
    print(f" Fichier {db_path} introuvable")
    print("La base de données sera créée automatiquement au démarrage du backend")
