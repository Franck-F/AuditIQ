"""Script pour ajouter les colonnes ML predictions au modèle Dataset"""

# Lire le fichier
with open('backend/models/dataset.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Trouver la ligne "# Relations" (première occurrence)
insert_index = None
for i, line in enumerate(lines):
    if '# Relations' in line and insert_index is None:
        insert_index = i
        break

if insert_index is None:
    print("ERROR: Could not find '# Relations' comment")
    exit(1)

# Colonnes à ajouter
new_columns = """    
    # Colonnes de prédictions ML
    has_predictions = Column(Boolean, default=False)
    prediction_column = Column(String, nullable=True)
    probability_column = Column(String, nullable=True)
    model_type = Column(String, nullable=True)  # 'uploaded' ou 'auto_trained'
    model_algorithm = Column(String, nullable=True)  # 'logistic_regression', 'xgboost'
    model_metrics = Column(JSON, nullable=True)
    
"""

# Insérer les colonnes
lines.insert(insert_index, new_columns)

# Écrire le fichier
with open('backend/models/dataset.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Colonnes ML ajoutées au modèle Dataset!")
