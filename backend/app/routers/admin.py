from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, UserRole
from app.models.chat import Chat, Message
from app.models.document import Document
from app.schemas.user import UserResponse
from app.utils.auth import get_admin_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserStatusUpdate(BaseModel):
    is_active: bool


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_chats = db.query(Chat).count()
    total_messages = db.query(Message).count()
    total_documents = db.query(Document).count()
    processed_docs = db.query(Document).filter(Document.is_processed == True).count()
    return {
        "users": {"total": total_users, "active": active_users, "inactive": total_users - active_users},
        "chats": {"total": total_chats},
        "messages": {"total": total_messages},
        "documents": {"total": total_documents, "processed": processed_docs},
    }


@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return db.query(User).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    body: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = body.role
    db.commit(); db.refresh(user)
    return user


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = body.is_active
    db.commit(); db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user); db.commit()


@router.get("/documents")
def list_all_documents(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return docs
