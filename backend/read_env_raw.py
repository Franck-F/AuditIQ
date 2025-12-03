import os

try:
    with open('.env', 'r') as f:
        print("Reading .env file:")
        for line in f:
            if line.startswith('DATABASE_URL='):
                print(f"FOUND: {line.strip()}")
except Exception as e:
    print(f"Error reading .env: {e}")
