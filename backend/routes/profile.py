from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from db import SessionLocal
from services.profile_service import get_player_profile

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Не авторизован")

    return get_player_profile(db, user_id)
