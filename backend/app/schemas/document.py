from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    original_filename: str
    file_size: int
    num_pages: int
    num_chunks: int
    is_processed: bool
    processing_error: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentQuery(BaseModel):
    query: str
    top_k: int = 5
    document_id: Optional[int] = None
