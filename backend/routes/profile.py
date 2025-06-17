from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from db import SessionLocal
from services.profile_service import get_user_profile
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    logger.info(f"GET /me called for user: {current_user.nickname}")
    try:
        profile = get_user_profile(db, current_user.id)
        logger.info(f"Profile retrieved successfully for user: {current_user.nickname}")
        return profile
    except Exception as e:
        logger.error(f"Error getting profile for user {current_user.nickname}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving profile")
