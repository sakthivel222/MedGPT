from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.chat import MessageRole


class MessageCreate(BaseModel):
    content: str
    use_rag: bool = False
    document_id: Optional[int] = None


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: MessageRole
    content: str
    tokens_used: int
    model_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    message_count: int = 0

    class Config:
        from_attributes = True


class ChatUpdate(BaseModel):
    title: Optional[str] = None
    is_archived: Optional[bool] = None
