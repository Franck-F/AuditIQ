"""Script pour réorganiser les étapes : Configuration AVANT Prédictions"""

# Lire le fichier
with open('app/dashboard/upload/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Mettre à jour les StepIndicators
# Ordre actuel : Upload, Preview, Prédictions, Config, Audit
# Ordre voulu : Upload, Preview, Config, Prédictions, Audit

content = content.replace(
    '<StepIndicator number={3} title="Prédictions" active={step === 3} completed={step > 3} />',
    '<StepIndicator number={3} title="Configuration" active={step === 3} completed={step > 3} />'
)

content = content.replace(
    '<StepIndicator number={4} title="Configuration" active={step === 4} completed={step > 4} />',
    '<StepIndicator number={4} title="Prédictions" active={step === 4} completed={step > 4} />'
)

# 2. Mettre à jour les conditions d'affichage
# Configuration : step 4 → step 3
content = content.replace(
    '{step === 4 && preview && preview.columns_info && (',
    '{step === 3 && preview && preview.columns_info && ('
)

# Prédictions : step 3 → step 4
content = content.replace(
    '{step === 3 && preview && (',
    '{step === 4 && preview && ('
)

# 3. Mettre à jour le useEffect et l'affichage "Audit en cours"
# Lancement reste à step 5

# Écrire le fichier
with open('app/dashboard/upload/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Étapes réorganisées!")
print("  1. Upload")
print("  2. Prévisualisation")
print("  3. Configuration (target, attributs sensibles)")
print("  4. Prédictions (entraîner modèle)")
print("  5. Lancement (audit)")
