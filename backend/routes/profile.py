from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from services.profile_service import get_user_profile
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()



@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    logger.info(f"GET /me called for user: {current_user.nickname}")
    try:
        profile = get_user_profile(db, current_user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        # Удаляем избыточные поля
        profile.pop("attributes", None)
        profile.pop("combat_skills", None)
        profile.pop("points", None)
        return profile
    except Exception as e:
        logger.error(f"Error getting profile for user {current_user.nickname}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving profile")
