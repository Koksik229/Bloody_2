from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from services.session_service import get_user_from_session


def get_user_stats(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    skills = user.skills
    return {
        "level": skills.level if skills else 1,
        "experience": skills.experience if skills else 0,
        "hp": skills.hp if skills else 30,
        "mp": skills.mp if skills else 10,
        "strength": skills.strength if skills else 5,
        "agility": skills.agility if skills else 5,
        "power": skills.power if skills else 5,
    }


def get_user_profile(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    skills = user.skills
    return {
        "nickname": user.nickname,
        "level": skills.level if skills else 1,
        "ap": skills.ap if skills else 0,
        "experience": skills.experience if skills else 0,
        "exp_to_next_ap": skills.exp_to_next_ap if skills else 0,
        "race_id": skills.race_id if skills else user.race_id if hasattr(user, "race_id") else 1,
        "race_name": skills.race.name if (skills and skills.race) else (user.race.name if hasattr(user, "race") and user.race else "Unknown"),
        "hp": skills.hp if skills else 30,
        "mp": skills.mp if skills else 10,
        "strength": skills.strength if skills else 5,
        "agility": skills.agility if skills else 5,
        "power": skills.power if skills else 5,
        "location_id": user.location.id if user.location else None,
        "location_name": user.location.name if user.location else "Unknown",
        "location_desc": user.location.description if user.location else "",
        "background": user.location.background if user.location else "",
        "available_moves": [
            {"id": move.id, "name": move.name}
            for move in user.location.connected_locations
        ] if user.location else [],
    }


def get_user_by_token(request: Request, db: Session):
    user = get_user_from_session(request, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user

get_player_profile = get_user_profile