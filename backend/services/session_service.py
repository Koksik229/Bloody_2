# backend/services/session_service.py

from fastapi import Request
from sqlalchemy.orm import Session
from models.user import User

def get_user_from_session(request: Request, db: Session):
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    return user
