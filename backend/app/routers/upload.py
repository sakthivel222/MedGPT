from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import asyncio

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentQuery
from app.utils.auth import get_current_user
from app.services.pdf import extract_text_from_pdf, chunk_text, save_upload_file
from app.services.rag import add_document_chunks, delete_document_chunks, search_documents
from app.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


async def process_document(doc_id: int, file_path: str, user_id: int, db: Session):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return
    try:
        text, num_pages = extract_text_from_pdf(file_path)
        chunks = chunk_text(text)
        collection_id = await add_document_chunks(chunks, doc_id, user_id)
        doc.num_pages = num_pages
        doc.num_chunks = len(chunks)
        doc.collection_id = collection_id
        doc.is_processed = True
    except Exception as e:
        doc.processing_error = str(e)
        logger.error(f"Document processing failed for doc {doc_id}: {e}")
    db.commit()


@router.post("/pdf", response_model=DocumentResponse, status_code=201)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"File too large (max {settings.MAX_UPLOAD_SIZE_MB}MB)")

    file_path, stored_filename = save_upload_file(content, file.filename, current_user.id)

    doc = Document(
        user_id=current_user.id,
        filename=stored_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type="application/pdf",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    background_tasks.add_task(process_document, doc.id, file_path, current_user.id, db)
    return doc


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    delete_document_chunks(doc_id, current_user.id, doc.collection_id)
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.delete(doc)
    db.commit()


@router.post("/search")
async def search_document(
    body: DocumentQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = await search_documents(body.query, current_user.id, body.top_k, body.document_id)
    return {"query": body.query, "results": results, "count": len(results)}
