from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from auth import get_current_user
from sqlalchemy import text

router = APIRouter(prefix="/inventory")

@router.get("/summary")
def inventory_summary(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    row = db.execute(text("SELECT strength,agility,power,intuition FROM user_base_stats WHERE user_id=:uid"),{"uid":current_user.id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Stats not found")
    return {
        "strength": row["strength"],
        "agility": row["agility"],
        "power": row["power"],
        "intuition": row["intuition"],
        "reason": 0
    }
