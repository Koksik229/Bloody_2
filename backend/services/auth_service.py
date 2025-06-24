import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.skills import Skill
from models.race import Race
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from schemas.user import UserCreate
from utils.password import get_password_hash, verify_password
from utils.validation import validate_password_strength, validate_nickname

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]{3,20}$")
NICKNAME_INVALID_CHARS = re.compile(r"[<>\"'`;\\s]")

def validate_email_format(email: str):
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Некорректный формат email")

def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Пароль должен быть не короче 8 символов")
    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(status_code=400, detail="Пароль должен содержать хотя бы одну букву")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Пароль должен содержать хотя бы одну цифру")

def validate_username_format(username: str):
    if not USERNAME_REGEX.match(username):
        raise HTTPException(status_code=400, detail="Логин должен быть от 3 до 20 символов, только буквы, цифры и подчёркивания")

def validate_nickname_format(nickname: str):
    if len(nickname) < 3 or len(nickname) > 20:
        raise HTTPException(status_code=400, detail="Никнейм должен быть от 3 до 20 символов")
    if NICKNAME_INVALID_CHARS.search(nickname):
        raise HTTPException(status_code=400, detail="Никнейм содержит недопустимые символы")

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_nickname(db: Session, nickname: str) -> Optional[User]:
    return db.query(User).filter(User.nickname == nickname).first()

def create_user(db: Session, username: str, password: str, email: str, nickname: str) -> User:
    # Проверка уникальности username и nickname
    existing_user = db.query(User).filter((User.username == username) | (User.nickname == nickname)).first()
    if existing_user:
        if existing_user.username == username:
            raise HTTPException(status_code=400, detail="Логин уже занят")
        if existing_user.nickname == nickname:
            raise HTTPException(status_code=400, detail="Никнейм уже занят")
    
    # Создаем хеш пароля
    hashed_password = pwd_context.hash(password)
    
    # Создаем нового пользователя
    user = User(
        username=username,
        hashed_password=hashed_password,
        email=email,
        nickname=nickname,
        created_at=datetime.utcnow(),
        race_id=1,        # ID расы по умолчанию (Человек)
        location_id=1,    # ID стартовой локации (Дом)
        level=1,
        experience=0,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Стартовый баланс валют
    from services.wallet_service import WalletService  # локальный импорт, чтобы избежать циклов
    ws = WalletService(db)
    ws.credit(user, 'COPPER', 5, reason='starter')
    ws.credit(user, 'SILVER', 500, reason='starter')
    db.commit()

    # Получаем базовые значения навыков из расы
    race = db.query(Race).filter(Race.id == user.race_id).first()
    if not race:
        raise HTTPException(status_code=500, detail="Race not found")

    # Создаем запись в таблице skills для связанного персонажа с базовыми значениями из расы
    new_skill = Skill(
        user_id=user.id,
        strength=race.base_strength,
        agility=race.base_agility,
        power=race.base_power,
        intuition=race.base_intuition,
        weapon_skill=race.base_weapon_skill,
        parry=race.base_parry,
        shield_block=race.base_shield_block,
        available_attribute_points=5,  # 5 очков за первый уровень
        available_attribute_points_special=2  # 2 очка за первый уровень
    )
    db.add(new_skill)
    db.commit()

    return user

def authenticate_user(db: Session, username: str, password: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    if not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    user.last_login = datetime.utcnow()
    db.commit()
    return user
