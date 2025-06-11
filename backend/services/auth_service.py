from sqlalchemy.orm import Session
from models.user import User
from models.log import LoginLog  # добавим новую модель
from utils.security import hash_password, verify_password
from datetime import datetime

def create_user(db: Session, username: str, password: str, email: str, nickname: str):
    hashed_pw = hash_password(password)
    user = User(
        username=username,
        hashed_password=hashed_pw,
        email=email,
        nickname=nickname,
        race_id=1,
        location_id=1,
        level=1,
        experience=0,
        created_at=datetime.utcnow(),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    success = False
    if user and verify_password(password, user.hashed_password):
        user.last_login = datetime.utcnow()
        db.commit()
        success = True

    db.add(LoginLog(username=username, success=success))
    db.commit()

    return user if success else None
