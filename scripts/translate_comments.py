"""
Script pour traduire automatiquement les commentaires anglais en français
dans les fichiers principaux du projet.
"""

import re
import os
from pathlib import Path

# Dictionnaire de traductions courantes
TRANSLATIONS = {
    # Actions
    "Fetch": "Récupérer",
    "fetch": "récupérer",
    "Load": "Charger",
    "load": "charger",
    "Handle": "Gérer",
    "handle": "gérer",
    "Validate": "Valider",
    "validate": "valider",
    "Submit": "Soumettre",
    "submit": "soumettre",
    "Update": "Mettre à jour",
    "update": "mettre à jour",
    "Refresh": "Actualiser",
    "refresh": "actualiser",
    "Parse": "Analyser",
    "parse": "analyser",
    "Trigger": "Déclencher",
    "trigger": "déclencher",
    "Check": "Vérifier",
    "check": "vérifier",
    "Create": "Créer",
    "create": "créer",
    "Delete": "Supprimer",
    "delete": "supprimer",
    "Remove": "Retirer",
    "remove": "retirer",
    "Add": "Ajouter",
    "add": "ajouter",
    "Set": "Définir",
    "set": "définir",
    "Get": "Obtenir",
    "get": "obtenir",
    "Calculate": "Calculer",
    "calculate": "calculer",
    "Process": "Traiter",
    "process": "traiter",
    "Generate": "Générer",
    "generate": "générer",
    "Initialize": "Initialiser",
    "initialize": "initialiser",
    "Configure": "Configurer",
    "configure": "configurer",
    "Apply": "Appliquer",
    "apply": "appliquer",
    
    # Objets
    "data": "données",
    "user": "utilisateur",
    "error": "erreur",
    "response": "réponse",
    "request": "requête",
    "result": "résultat",
    "value": "valeur",
    "state": "état",
    "component": "composant",
    "table": "tableau",
    "file": "fichier",
    "dataset": "jeu de données",
    "audit": "audit",
    "report": "rapport",
    "preview": "prévisualisation",
    "config": "configuration",
    "settings": "paramètres",
    "missing values": "valeurs manquantes",
    "columns": "colonnes",
    "rows": "lignes",
    
    # Phrases complètes courantes
    "Auto-launch audit when reaching step 4": "Lancer automatiquement l'audit en atteignant l'étape 4",
    "Sync tableData with data prop changes": "Synchroniser tableData avec les changements de la prop data",
    "for auto-refresh after missing values treatment": "pour l'actualisation automatique après traitement des valeurs manquantes",
    "Table container with fixed width to prevent page scroll": "Conteneur de tableau avec largeur fixe pour empêcher le défilement de la page",
    "Redirect to audit results page": "Rediriger vers la page des résultats d'audit",
    "Return to config step": "Retourner à l'étape de configuration",
    "Fetch recent audits": "Récupérer les audits récents",
    "Mark all as read": "Tout marquer comme lu",
    "Close modal": "Fermer la modale",
    "Open settings": "Ouvrir les paramètres",
}

# Traductions de phrases spécifiques
PHRASE_TRANSLATIONS = {
    "Auto-launch audit when reaching step 4": "Lancer automatiquement l'audit en atteignant l'étape 4",
    "Sync tableData with data prop changes (for auto-refresh after missing values treatment)": 
        "Synchroniser tableData avec les changements de la prop data (pour l'actualisation automatique après traitement des valeurs manquantes)",
    "Table container with fixed width to prevent page scroll": 
        "Conteneur de tableau avec largeur fixe pour empêcher le défilement de la page",
}

def translate_comment(comment: str) -> str:
    """
    Traduit un commentaire anglais en français.
    """
    # Vérifier si c'est déjà en français (contient des accents ou mots français courants)
    french_indicators = ['é', 'è', 'ê', 'à', 'ù', 'ç', 'données', 'utilisateur', 'récupérer']
    if any(indicator in comment.lower() for indicator in french_indicators):
        return comment
    
    # Traductions de phrases complètes d'abord
    for eng, fr in PHRASE_TRANSLATIONS.items():
        if eng.lower() in comment.lower():
            comment = comment.replace(eng, fr)
            return comment
    
    # Traductions mot par mot
    translated = comment
    for eng, fr in TRANSLATIONS.items():
        # Utiliser des regex pour remplacer les mots entiers
        pattern = r'\b' + re.escape(eng) + r'\b'
        translated = re.sub(pattern, fr, translated, flags=re.IGNORECASE)
    
    return translated

def process_file(filepath: Path):
    """
    Traite un fichier pour traduire les commentaires.
    """
    print(f"Traitement de {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        lines = content.split('\n')
        translated_lines = []
        
        for line in lines:
            # Détecter les commentaires TypeScript/JavaScript
            if '//' in line and not line.strip().startswith('http'):
                parts = line.split('//', 1)
                if len(parts) == 2:
                    code_part = parts[0]
                    comment_part = parts[1]
                    translated_comment = translate_comment(comment_part)
                    line = code_part + '//' + translated_comment
            
            # Détecter les commentaires JSX {/* */}
            if '{/*' in line and '*/}' in line:
                match = re.search(r'\{/\*(.+?)\*/\}', line)
                if match:
                    comment = match.group(1)
                    translated = translate_comment(comment)
                    line = line.replace(match.group(1), translated)
            
            # Détecter les commentaires Python
            if line.strip().startswith('#') and not line.strip().startswith('#!'):
                comment = line.strip()[1:].strip()
                translated = translate_comment(comment)
                indent = len(line) - len(line.lstrip())
                line = ' ' * indent + '# ' + translated
            
            translated_lines.append(line)
        
        new_content = '\n'.join(translated_lines)
        
        # Sauvegarder seulement si des changements ont été faits
        if new_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✓ Traduit avec succès")
            return True
        else:
            print(f"  - Aucune traduction nécessaire")
            return False
            
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        return False

def main():
    """
    Point d'entrée principal.
    """
    base_path = Path(__file__).parent.parent
    
    # Liste des fichiers principaux à traduire
    files_to_translate = [
        # Frontend Dashboard
        "app/dashboard/page.tsx",
        "app/dashboard/upload/page.tsx",
        "components/dashboard/editable-data-table.tsx",
        "components/dashboard/sidebar.tsx",
        "components/dashboard/header.tsx",
        
        # Services Frontend
        "services/auditService.ts",
        "services/reportService.ts",
        "lib/config/api.ts",
        
        # Backend Services (commenté pour l'instant - à faire séparément)
        # "backend/routers/audits.py",
        # "backend/routers/upload.py",
        # "backend/services/fairness.py",
    ]
    
    print("=" * 60)
    print("TRADUCTION DES COMMENTAIRES EN FRANÇAIS")
    print("=" * 60)
    print()
    
    translated_count = 0
    for file_path in files_to_translate:
        full_path = base_path / file_path
        if full_path.exists():
            if process_file(full_path):
                translated_count += 1
        else:
            print(f"⚠ Fichier non trouvé: {file_path}")
    
    print()
    print("=" * 60)
    print(f"TERMINÉ: {translated_count} fichier(s) traduit(s)")
    print("=" * 60)

if __name__ == "__main__":
    main()
