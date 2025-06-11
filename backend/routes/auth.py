from fastapi import APIRouter, Request, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session
from db import SessionLocal
from services.auth_service import create_user, authenticate_user
from models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
async def register(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    nickname: str = Form(...),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Логин уже занят")
    if db.query(User).filter(User.nickname == nickname).first():
        raise HTTPException(status_code=400, detail="Никнейм уже занят")

    user = create_user(db, username, password, email, nickname)
    request.session["user_id"] = user.id
    return {"message": "Регистрация успешна", "nickname": user.nickname}

@router.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    request.session["user_id"] = user.id
    return {"message": "Вход выполнен", "nickname": user.nickname}

@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Вы вышли из системы"}