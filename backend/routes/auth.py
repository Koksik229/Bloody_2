from fastapi import APIRouter, Form, Request, HTTPException, Depends
from starlette.responses import JSONResponse
from sqlalchemy.orm import Session

from db import get_db
from services.auth_service import (
    create_user, authenticate_user,
    validate_email_format, validate_password_strength,
    validate_username_format, validate_nickname_format
)
from services.profile_service import get_user_stats

router = APIRouter()

@router.post("/register")
async def register_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    email: str = Form(...),
    nickname: str = Form(...),
    db: Session = Depends(get_db)  # ✅ исправлено
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")

    validate_email_format(email)
    validate_password_strength(password)
    validate_username_format(username)
    validate_nickname_format(nickname)

    user = create_user(db, username, password, email, nickname)
    request.session["user_id"] = user.id
    return JSONResponse({"message": "Регистрация успешна", "nickname": user.nickname})

@router.post("/login")
async def login_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)  # ✅ исправлено
):
    user = authenticate_user(db, username, password)
    request.session["user_id"] = user.id
    stats = get_user_stats(db, user)
    return JSONResponse({
        "nickname": user.nickname,
        "level": user.level,
        "location_id": user.location_id,
        "hp": stats.hp,
        "mp": stats.mp
    })

@router.post("/logout")
async def logout_user(request: Request):
    request.session.clear()
    return JSONResponse({"message": "Вы вышли"})
