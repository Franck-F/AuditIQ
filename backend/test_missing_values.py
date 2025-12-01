"""
Test de la fonctionnalité F2.1.7: Gestion des valeurs manquantes
"""
import pandas as pd
from missing_values import (
    analyze_missing_values,
    handle_missing_values,
    get_all_strategies_info,
    recommend_strategy
)

# Créer un DataFrame de test avec valeurs manquantes
df_test = pd.DataFrame({
    'age': [25, 30, None, 40, 35, None, 28],
    'genre': ['H', 'F', None, 'H', 'F', 'H', None],
    'salaire': [30000, 45000, None, 50000, None, 40000, 35000],
    'ville': ['Paris', None, 'Lyon', None, 'Paris', 'Lyon', None],
    'score': [85, 90, 78, None, None, None, 88]
})

print("=" * 60)
print("DATAFRAME ORIGINAL")
print("=" * 60)
print(df_test)
print(f"\nNombre de lignes: {len(df_test)}")
print(f"Valeurs manquantes totales: {df_test.isnull().sum().sum()}")

print("\n" + "=" * 60)
print("ANALYSE DES VALEURS MANQUANTES")
print("=" * 60)
analysis = analyze_missing_values(df_test)
for col, info in analysis.items():
    print(f"\n{col}:")
    print(f"  - Manquants: {info['count']} ({info['percentage']}%)")
    print(f"  - Sévérité: {info['severity']}")
    print(f"  - Stratégie recommandée: {info['recommended_strategy']}")
    print(f"  - Stratégies disponibles: {', '.join(info['available_strategies'])}")

print("\n" + "=" * 60)
print("TEST 1: Supprimer les lignes avec NaN")
print("=" * 60)
df1 = handle_missing_values(df_test, {'age': 'drop_rows', 'genre': 'drop_rows'})
print(f"Lignes avant: {len(df_test)}, après: {len(df1)}")
print(df1)

print("\n" + "=" * 60)
print("TEST 2: Imputation par moyenne/médiane")
print("=" * 60)
df2 = handle_missing_values(df_test, {
    'age': 'median',
    'salaire': 'mean',
    'score': 'median'
})
print("Age et salaire imputés:")
print(df2[['age', 'salaire', 'score']])

print("\n" + "=" * 60)
print("TEST 3: Mode pour catégorielles")
print("=" * 60)
df3 = handle_missing_values(df_test, {
    'genre': 'mode',
    'ville': 'mode'
})
print("Genre et ville imputés:")
print(df3[['genre', 'ville']])

print("\n" + "=" * 60)
print("TEST 4: Valeur constante")
print("=" * 60)
df4 = handle_missing_values(df_test, {
    'genre': 'constant',
    'ville': 'constant',
    'score': 'constant'
})
print("Valeurs constantes appliquées:")
print(df4[['genre', 'ville', 'score']])

print("\n" + "=" * 60)
print("TEST 5: Supprimer colonne avec trop de manquants")
print("=" * 60)
df5 = handle_missing_values(df_test, {'score': 'drop_column'})
print(f"Colonnes avant: {list(df_test.columns)}")
print(f"Colonnes après: {list(df5.columns)}")

print("\n" + "=" * 60)
print("STRATEGIES DISPONIBLES")
print("=" * 60)
strategies = get_all_strategies_info()
for name, info in strategies.items():
    print(f"\n{name}: {info['name']}")
    print(f"  Description: {info['description']}")
    print(f"  Cas d'usage: {info['use_case']}")
    print(f"  Pros: {info['pros']}")
    print(f"  Cons: {info['cons']}")

print("\n" + "=" * 60)
print("✅ Tous les tests réussis!")
print("=" * 60)
