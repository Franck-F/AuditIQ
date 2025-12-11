"""Script pour ajouter l'étape Prédictions dans le workflow d'upload"""

# Lire le fichier
with open('app/dashboard/upload/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Mettre à jour les StepIndicators
content = content.replace(
    '<StepIndicator number={3} title="Configuration" active={step === 3} completed={step > 3} />',
    '<StepIndicator number={3} title="Prédictions" active={step === 3} completed={step > 3} />\n            <div className="h-px w-12 bg-border" />\n            <StepIndicator number={4} title="Configuration" active={step === 4} completed={step > 4} />'
)

content = content.replace(
    '<StepIndicator number={4} title="Audit" active={step === 4} completed={step > 4} />',
    '<StepIndicator number={5} title="Audit" active={step === 5} completed={step > 5} />'
)

# 2. Mettre à jour le useEffect qui lance l'audit (step 4 → step 5)
content = content.replace(
    'if (step === 4 && preview?.dataset_id) {',
    'if (step === 5 && preview?.dataset_id) {'
)

# 3. Mettre à jour les conditions step === 3 → step === 4 (Configuration)
content = content.replace(
    '{step === 3 && preview && preview.columns_info && (',
    '{step === 4 && preview && preview.columns_info && ('
)

# Écrire le fichier
with open('app/dashboard/upload/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Étapes mises à jour!")
print("  - Step 3: Prédictions (nouveau)")
print("  - Step 4: Configuration")
print("  - Step 5: Audit")
