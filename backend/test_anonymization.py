"""
Test des fonctions d'anonymisation
"""
import pandas as pd
from anonymization import (
    anonymize_hash,
    anonymize_pseudonym,
    anonymize_suppression,
    anonymize_generalization,
    apply_anonymization,
    get_anonymization_methods
)

# Test 1: Hash
print("=== Test Hachage ===")
email = "john.doe@example.com"
hashed = anonymize_hash(email)
print(f"Original: {email}")
print(f"Hashed: {hashed}")
print(f"Same input => same hash: {anonymize_hash(email) == hashed}")

# Test 2: Pseudonymisation
print("\n=== Test Pseudonymisation ===")
name = "John Doe"
email = "john.doe@example.com"
print(f"Original name: {name}")
print(f"Pseudonym name: {anonymize_pseudonym(name, 'name')}")
print(f"Original email: {email}")
print(f"Pseudonym email: {anonymize_pseudonym(email, 'email')}")

# Test 3: Suppression
print("\n=== Test Suppression ===")
sensitive_data = "Confidential Information"
print(f"Original: {sensitive_data}")
print(f"Suppressed: {anonymize_suppression(sensitive_data)}")

# Test 4: Généralisation
print("\n=== Test Généralisation ===")
age = 34
postal_code = "75001"
print(f"Original age: {age}")
print(f"Generalized age: {anonymize_generalization(age, 'age')}")
print(f"Original postal: {postal_code}")
print(f"Generalized postal: {anonymize_generalization(postal_code, 'postal_code')}")

# Test 5: Application sur DataFrame
print("\n=== Test sur DataFrame ===")
df = pd.DataFrame({
    'id': [1, 2, 3],
    'name': ['Alice', 'Bob', 'Charlie'],
    'email': ['alice@example.com', 'bob@example.com', 'charlie@example.com'],
    'age': [25, 34, 42],
    'salary': [50000, 60000, 70000]
})

print("DataFrame original:")
print(df)

# Anonymisation par hash
df_hashed = apply_anonymization(df, ['name', 'email'], 'hash')
print("\nAprès anonymisation par hash (name, email):")
print(df_hashed)

# Anonymisation par pseudonyme
df_pseudo = apply_anonymization(df, ['name', 'email'], 'pseudonym')
print("\nAprès anonymisation par pseudonyme (name, email):")
print(df_pseudo)

# Anonymisation par suppression
df_suppressed = apply_anonymization(df, ['name', 'email'], 'suppression')
print("\nAprès anonymisation par suppression (name, email):")
print(df_suppressed)

# Test 6: Méthodes disponibles
print("\n=== Méthodes d'anonymisation disponibles ===")
methods = get_anonymization_methods()
for key, method in methods.items():
    print(f"\n{key}:")
    print(f"  Nom: {method['name']}")
    print(f"  Description: {method['description']}")
    print(f"  Cas d'usage: {method['use_case']}")
