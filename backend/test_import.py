import sys
print("Before import audit_iq_backend")
try:
    import audit_iq_backend
    print("Success")
except Exception as e:
    print(f"Error: {e}")
print(f"sys.modules keys matching 'models': {[k for k in sys.modules.keys() if 'models' in k]}")
print(f"sys.modules keys matching 'backend': {[k for k in sys.modules.keys() if 'backend' in k]}")
