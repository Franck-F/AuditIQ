"""Script pour corriger les transitions d'étapes après réorganisation"""

# Lire le fichier
with open('app/dashboard/upload/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Après l'entraînement du modèle ou l'upload de prédictions,
# on doit aller à l'étape 5 (Lancement) au lieu de 4
# Car maintenant step 4 = Prédictions

# Trouver et remplacer dans le contexte de l'entraînement ML
# setTimeout(() => setStep(4), 1500) → setTimeout(() => setStep(5), 1500)
content = content.replace(
    "setTimeout(() => setStep(4), 1500)",
    "setTimeout(() => setStep(5), 1500)"
)

# setStep(4) après upload prédictions → setStep(5)
# Mais attention à ne pas changer TOUS les setStep(4)
# On cherche spécifiquement celui dans le contexte upload-predictions
lines = content.split('\n')
for i, line in enumerate(lines):
    # Chercher le setStep(4) après upload-predictions
    if 'setStep(4)' in line and i > 0:
        # Vérifier le contexte (quelques lignes avant)
        context = '\n'.join(lines[max(0, i-10):i])
        if 'upload-predictions' in context or 'predictionFile' in context:
            lines[i] = line.replace('setStep(4)', 'setStep(5)')

content = '\n'.join(lines)

# Écrire le fichier
with open('app/dashboard/upload/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Transitions d'étapes corrigées!")
print("   Après Prédictions (step 4) → Lancement (step 5)")
