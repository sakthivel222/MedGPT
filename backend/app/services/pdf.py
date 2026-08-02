import os
import uuid
from typing import List, Tuple
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config import settings
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> Tuple[str, int]:
    """Extract text from a PDF file. Returns (text, num_pages)."""
    try:
        with open(file_path, "rb") as f:
            reader = PdfReader(f)
            num_pages = len(reader.pages)
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            full_text = "\n\n".join(text_parts)
        return full_text, num_pages
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise


def chunk_text(text: str) -> List[str]:
    """Split text into chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_text(text)
    return [c.strip() for c in chunks if c.strip()]


def save_upload_file(file_content: bytes, original_filename: str, user_id: int) -> Tuple[str, str]:
    """Save uploaded file and return (file_path, stored_filename)."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(original_filename)[1].lower()
    stored_filename = f"user_{user_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)
    with open(file_path, "wb") as f:
        f.write(file_content)
    return file_path, stored_filename
