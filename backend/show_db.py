import sqlite3
import sys

def show_database():
    conn = sqlite3.connect('_dev.db')
    cursor = conn.cursor()
    
    # Liste des tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print("\n=== TABLES ===")
    for table in tables:
        table_name = table[0]
        print(f"\n Table: {table_name}")
        
        # Compter les lignes
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"   Nombre de lignes: {count}")
        
        # Afficher les colonnes
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print("   Colonnes:")
        for col in columns:
            print(f"     - {col[1]} ({col[2]})")
        
        # Afficher les données (max 5 lignes)
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()
            print(f"   Premières lignes:")
            for row in rows:
                print(f"     {row}")
    
    conn.close()

if __name__ == "__main__":
    show_database()
