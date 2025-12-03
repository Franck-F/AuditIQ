import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import socket

load_dotenv()

url = os.getenv('DATABASE_URL')
if not url:
    print("DATABASE_URL is not set")
else:
    try:
        parsed = urlparse(url)
        print(f"Scheme: {parsed.scheme}")
        print(f"Hostname: {parsed.hostname}")
        print(f"Port: {parsed.port}")
        
        if parsed.hostname:
            try:
                ip = socket.gethostbyname(parsed.hostname)
                print(f"Hostname resolves to: {ip}")
            except socket.gaierror as e:
                print(f"Hostname resolution failed: {e}")
    except Exception as e:
        print(f"Error parsing URL: {e}")
