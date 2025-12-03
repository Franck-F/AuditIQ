import socket
try:
    ip = socket.gethostbyname("qpgwotsodziznwigpjey.supabase.co")
    print(f"API Hostname resolves to: {ip}")
except Exception as e:
    print(f"API Hostname resolution failed: {e}")
