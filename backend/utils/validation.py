import re
from fastapi import HTTPException

def validate_password_strength(password: str) -> None:
    """
    Проверяет сложность пароля.
    Пароль должен содержать минимум 8 символов,
    включая хотя бы одну цифру и одну букву.
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Пароль должен содержать минимум 8 символов"
        )
    
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=400,
            detail="Пароль должен содержать хотя бы одну цифру"
        )
    
    if not re.search(r"[a-zA-Z]", password):
        raise HTTPException(
            status_code=400,
            detail="Пароль должен содержать хотя бы одну букву"
        )

def validate_nickname(nickname: str) -> None:
    """
    Проверяет корректность никнейма.
    Никнейм должен содержать только буквы, цифры и знак подчеркивания.
    """
    if not re.match(r"^[a-zA-Z0-9_]+$", nickname):
        raise HTTPException(
            status_code=400,
            detail="Никнейм может содержать только буквы, цифры и знак подчеркивания"
        ) 