from fastapi import APIRouter, Form, Request, HTTPException, Depends
from starlette.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from fastapi import status
from fastapi.security import OAuth2PasswordRequestForm

from db import get_db
from services.auth_service import (
    create_user, authenticate_user,
    validate_email_format, validate_password_strength,
    validate_username_format, validate_nickname_format
)
from services.profile_service import get_user_stats
from auth import create_access_token
from models.skills import Skill
from models.race import RaceLevelStat

router = APIRouter()

@router.post("/register")
async def register_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    email: str = Form(...),
    nickname: str = Form(...),
    db: Session = Depends(get_db)
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")

    validate_email_format(email)
    validate_password_strength(password)
    validate_username_format(username)
    validate_nickname_format(nickname)

    user = create_user(db, username, password, email, nickname)
    return JSONResponse({"message": "Регистрация успешна", "nickname": user.nickname})

@router.post("/login")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
        
        # Создаем JWT токен
        access_token = create_access_token(data={"sub": user.id})
        
        # Обновляем время последнего входа
        user.last_login = datetime.utcnow()
        db.commit()
        

        
        # Получаем навыки пользователя
        skills = db.query(Skill).filter(Skill.user_id == user.id).first()
        
        # Получаем характеристики расы для текущего уровня
        race_stats = db.query(RaceLevelStat).filter(
            RaceLevelStat.race_id == user.race_id,
            RaceLevelStat.level == user.level
        ).first()
        
        # Базовые значения HP и MP
        base_hp = 100
        base_mp = 50
        
        # Если есть характеристики расы, добавляем прирост
        if race_stats:
            base_hp += race_stats.hp_gain
            base_mp += race_stats.mp_gain
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "nickname": user.nickname,
                "level": user.level,
                "experience": user.experience,
                "hp": base_hp,
                "mana": base_mp,
                "strength": skills.strength if skills else 10,
                "agility": skills.agility if skills else 10,
                "power": skills.power if skills else 10,
                "intuition": skills.intuition if skills else 10,
                "weapon_skill": skills.weapon_skill if skills else 5,
                "parry": skills.parry if skills else 5,
                "shield_block": skills.shield_block if skills else 5,
                "attribute_points": skills.available_attribute_points if skills else 0,
                "skill_points": skills.available_attribute_points_special if skills else 0
            }
        }
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout")
async def logout_user():
    return JSONResponse({"message": "Вы вышли"})
