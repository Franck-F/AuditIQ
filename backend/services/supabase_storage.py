import os
from supabase import create_client, Client
from typing import Optional, List
import io
from dotenv import load_dotenv

load_dotenv()

class SupabaseStorageService:
    """
    Service pour gérer le stockage des datasets sur Supabase Storage.
    Nécessite SUPABASE_URL et SUPABASE_SERVICE_KEY dans les variables d'environnement.
    """
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_KEY")
        self.bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "datasets")
        
        if self.url and self.key:
            self.client: Client = create_client(self.url, self.key)
        else:
            print("⚠️ Supabase credentials missing (SUPABASE_URL/SUPABASE_SERVICE_KEY). Storage service will be disabled.")
            self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    async def upload_file(self, file_path: str, content: bytes, content_type: str = "text/csv") -> Optional[str]:
        """Uploade un fichier vers le bucket 'datasets'"""
        if not self.is_available():
            return None
        
        try:
            # Note: supabase-py standard upload
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=content,
                file_options={"content-type": content_type, "x-upsert": "true"}
            )
            return file_path
        except Exception as e:
            print(f"❌ Supabase Upload Error: {e}")
            return None

    async def download_file(self, file_path: str) -> Optional[bytes]:
        """Télécharge un fichier depuis le bucket 'datasets'"""
        if not self.is_available():
            return None
        
        try:
            response = self.client.storage.from_(self.bucket_name).download(file_path)
            return response
        except Exception as e:
            print(f"❌ Supabase Download Error: {e}")
            return None

    async def delete_file(self, file_path: str) -> bool:
        """Supprime un fichier du bucket 'datasets'"""
        if not self.is_available():
            return False
            
        try:
            self.client.storage.from_(self.bucket_name).remove([file_path])
            return True
        except Exception as e:
            print(f"❌ Supabase Delete Error: {e}")
            return False

    def get_public_url(self, file_path: str) -> Optional[str]:
        """Génère une URL publique (si le bucket est public)"""
        if not self.is_available():
            return None
        return self.client.storage.from_(self.bucket_name).get_public_url(file_path)

    def create_signed_url(self, file_path: str, expires_in: int = 3600) -> Optional[str]:
        """Génère une URL signée pour un accès temporaire (60 min par défaut)"""
        if not self.is_available():
            return None
        try:
            response = self.client.storage.from_(self.bucket_name).create_signed_url(file_path, expires_in)
            return response.get('signedURL')
        except Exception as e:
            print(f"❌ Supabase Signed URL Error: {e}")
            return None

# Singleton instance
storage_service = SupabaseStorageService()
