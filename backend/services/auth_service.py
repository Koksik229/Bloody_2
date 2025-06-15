import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.skills import Skill
from passlib.hash import bcrypt
from datetime import datetime

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

def create_user(db: Session, username: str, password: str, email: str, nickname: str) -> User:
    # Проверка уникальности username и nickname
    existing_user = db.query(User).filter((User.username == username) | (User.nickname == nickname)).first()
    if existing_user:
        if existing_user.username == username:
            raise HTTPException(status_code=400, detail="Логин уже занят")
        if existing_user.nickname == nickname:
            raise HTTPException(status_code=400, detail="Никнейм уже занят")

    validate_password_strength(password)  # Проверяем сложность пароля
    hashed_password = bcrypt.hash(password)

    # Создаем нового пользователя
    user = User(
        username=username,
        hashed_password=hashed_password,
        email=email,
        nickname=nickname,
        created_at=datetime.utcnow(),
        race_id=1,        # ID расы по умолчанию (Человек)
        location_id=1,    # ID стартовой локации (Дом)
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Создаем запись в таблице skills для связанного персонажа
    new_skill = Skill(
        user_id=user.id,
        strength=0,
        agility=0,
        power=0,
        intuition=0,
        # hp и mp не сохраняем здесь – они вычисляются динамически по race_id и level
        available_attribute_points=5
    )
    db.add(new_skill)
    db.commit()

    return user

def authenticate_user(db: Session, username: str, password: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user or not bcrypt.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    user.last_login = datetime.utcnow()
    db.commit()
    return user
