from dotenv import load_dotenv
import os

load_dotenv()
url = os.getenv('DATABASE_URL')
print(f"DATABASE_URL is set to: {url}")
