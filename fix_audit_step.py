"""Script pour corriger l'affichage 'Audit en cours' à la bonne étape"""

# Lire le fichier
with open('app/dashboard/upload/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer step === 4 par step === 5 pour l'affichage "Audit en cours"
# Chercher la ligne spécifique avec le commentaire Processing Step
content = content.replace(
    '{/* Processing Step */}\n          {step === 4 &&',
    '{/* Processing Step - Étape 5 : Lancement de l\'audit */}\n          {step === 5 &&'
)

# Écrire le fichier
with open('app/dashboard/upload/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Correction appliquée!")
print("   'Audit en cours' s'affichera maintenant à l'étape 5 (Lancement)")
print("   au lieu de l'étape 4 (Configuration)")
