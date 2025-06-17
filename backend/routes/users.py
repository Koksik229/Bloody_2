from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from typing import List
from schemas.user import UserResponse

router = APIRouter()

@router.get("/count")
def get_users_count(db: Session = Depends(get_db)):
    """Получает общее количество пользователей"""
    with db as session:
        count = session.query(User).count()
        return {"total": count}

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Получает список всех пользователей"""
    with db as session:
        users = session.query(User).all()
        return users 