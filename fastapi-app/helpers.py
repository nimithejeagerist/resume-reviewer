"""
Contains helpers for the app.py
"""
import os
import pypdf
import io
from azure.storage.blob import BlobServiceClient
from urllib.parse import urlparse
from dotenv import load_dotenv

def download_blob(blob_url: str) -> bytes:
    client = BlobServiceClient.from_connection_string(
        os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    )
    blob_name = '/'.join(urlparse(blob_url).path.split('/')[2:])
    blob_client = client.get_blob_client(container="uploads", blob=blob_name)
    return blob_client.download_blob().readall()

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join(page.extract_text() for page in reader.pages)
