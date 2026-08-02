import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Optional
from app.config import settings
from app.services.llm import llm_service
import logging
import os

logger = logging.getLogger(__name__)

os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

chroma_client = chromadb.PersistentClient(
    path=settings.CHROMA_PERSIST_DIR,
    settings=ChromaSettings(anonymized_telemetry=False),
)


def get_or_create_collection(collection_name: str):
    return chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )


async def add_document_chunks(
    chunks: List[str],
    document_id: int,
    user_id: int,
    collection_name: Optional[str] = None,
) -> str:
    col_name = collection_name or f"user_{user_id}_docs"
    collection = get_or_create_collection(col_name)

    ids, embeddings, metadatas, documents = [], [], [], []
    for i, chunk in enumerate(chunks):
        try:
            embedding = await llm_service.generate_embeddings(chunk)
            ids.append(f"doc_{document_id}_chunk_{i}")
            embeddings.append(embedding)
            metadatas.append({"document_id": document_id, "user_id": user_id, "chunk_index": i})
            documents.append(chunk)
        except Exception as e:
            logger.warning(f"Failed to embed chunk {i}: {e}")
            continue

    if ids:
        collection.add(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=documents)

    return col_name


async def search_documents(
    query: str,
    user_id: int,
    top_k: int = 5,
    document_id: Optional[int] = None,
    collection_name: Optional[str] = None,
) -> List[Dict]:
    col_name = collection_name or f"user_{user_id}_docs"
    try:
        collection = chroma_client.get_collection(col_name)
    except Exception:
        return []

    query_embedding = await llm_service.generate_embeddings(query)
    where = {"user_id": user_id}
    if document_id:
        where["document_id"] = document_id

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    output = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        score = 1 - dist  # cosine → similarity
        if score >= settings.RAG_SCORE_THRESHOLD:
            output.append({"content": doc, "score": score, "metadata": meta})

    return sorted(output, key=lambda x: x["score"], reverse=True)


def delete_document_chunks(document_id: int, user_id: int, collection_name: Optional[str] = None):
    col_name = collection_name or f"user_{user_id}_docs"
    try:
        collection = chroma_client.get_collection(col_name)
        collection.delete(where={"document_id": document_id})
    except Exception as e:
        logger.warning(f"Could not delete chunks for document {document_id}: {e}")
