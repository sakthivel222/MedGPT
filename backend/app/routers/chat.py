from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models.user import User
from app.models.chat import Chat, Message, MessageRole
from app.schemas.chat import ChatCreate, ChatResponse, ChatListResponse, MessageCreate, ChatUpdate
from app.utils.auth import get_current_user
from app.services.llm import llm_service, MEDICAL_SYSTEM_PROMPT
from app.services.rag import search_documents
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[ChatListResponse])
def list_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chats = db.query(Chat).filter(Chat.user_id == current_user.id, Chat.is_archived == False).order_by(Chat.updated_at.desc()).all()
    result = []
    for chat in chats:
        result.append(ChatListResponse(
            id=chat.id, title=chat.title,
            created_at=chat.created_at, updated_at=chat.updated_at,
            is_archived=chat.is_archived,
            message_count=len(chat.messages),
        ))
    return result


@router.post("/", response_model=ChatResponse, status_code=201)
def create_chat(body: ChatCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = Chat(user_id=current_user.id, title=body.title)
    db.add(chat); db.commit(); db.refresh(chat)
    return chat


@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.patch("/{chat_id}", response_model=ChatResponse)
def update_chat(chat_id: int, body: ChatUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if body.title is not None: chat.title = body.title
    if body.is_archived is not None: chat.is_archived = body.is_archived
    db.commit(); db.refresh(chat)
    return chat


@router.delete("/{chat_id}", status_code=204)
def delete_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat); db.commit()


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: int,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save user message
    user_msg = Message(chat_id=chat_id, role=MessageRole.user, content=body.content)
    db.add(user_msg); db.commit()

    # Build history (last 20 messages)
    history = [
        {"role": m.role.value, "content": m.content}
        for m in chat.messages[-20:]
    ]

    # RAG context injection
    system_prompt = MEDICAL_SYSTEM_PROMPT
    if body.use_rag:
        rag_results = await search_documents(body.content, current_user.id, top_k=5, document_id=body.document_id)
        if rag_results:
            context = "\n\n".join([r["content"] for r in rag_results])
            system_prompt += f"\n\nRelevant medical document context:\n{context}"

    # Auto-title first user message
    if len(chat.messages) == 1:
        words = body.content.strip().split()
        chat.title = " ".join(words[:8]) + ("..." if len(words) > 8 else "")
        db.commit()

    async def stream_response():
        full_response = ""
        try:
            async for chunk in llm_service.chat_stream(history, system_prompt):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            error_chunk = "I'm sorry, I encountered an error. Please try again."
            full_response = error_chunk
            yield f"data: {json.dumps({'content': error_chunk, 'done': False})}\n\n"
        finally:
            # Save assistant message
            assistant_msg = Message(
                chat_id=chat_id, role=MessageRole.assistant,
                content=full_response, model_used=llm_service.model,
            )
            db.add(assistant_msg); db.commit()
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@router.delete("/{chat_id}/messages", status_code=204)
def clear_messages(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.query(Message).filter(Message.chat_id == chat_id).delete()
    db.commit()
