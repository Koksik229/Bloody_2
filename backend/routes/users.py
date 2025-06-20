from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from sqlalchemy.orm import Session
from db import get_db
from models.user import User
from typing import List
from schemas.user import UserResponse

router = APIRouter()

@router.get("/count")
def get_users_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Получает общее количество пользователей"""
    count = db.query(User).count()
    return {"total": count}

@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Получает список всех пользователей"""
    users = db.query(User).all()
    return users