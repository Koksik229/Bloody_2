from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.race import RaceLevelStat  # Модель статистики для расы/уровня
from models.location import Location
from services.session_service import get_user_from_session

def get_user_stats(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    skill = user.skills  # единственная связанная запись Skill или None
    # Получаем базовые характеристики по расе и уровню
    base_stats = db.query(RaceLevelStat).filter(
        (RaceLevelStat.race_id == user.race_id) & (RaceLevelStat.level == user.level)
    ).first()
    if not base_stats:
        # На случай отсутствия записи (не заполнена таблица race_level_stats для данного уровня)
        raise HTTPException(status_code=500, detail="Base stats not found for race/level")
    # Расчет итоговых характеристик: базовые + бонусы из Skill
    bonus_str = skill.strength if skill else 0
    bonus_agi = skill.agility if skill else 0
    bonus_pow = skill.power if skill else 0
    bonus_int = skill.intuition if skill else 0

    return {
        "level": user.level,
        "experience": user.experience,
        "hp": base_stats.hp,             # HP по базе расы/уровня
        "mp": base_stats.mp,             # MP по базе
        "strength": base_stats.strength + bonus_str,
        "agility": base_stats.agility + bonus_agi,
        "power": base_stats.power + bonus_pow,
        "intuition": bonus_int,  # базовый intuition отсутствует в race_level_stats, берем только бонус
        "ap": skill.available_attribute_points if skill else 0
    }

def get_user_profile(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    skill = user.skills
    base_stats = db.query(RaceLevelStat).filter(
        (RaceLevelStat.race_id == user.race_id) & (RaceLevelStat.level == user.level)
    ).first()
    if not base_stats:
        raise HTTPException(status_code=500, detail="Base stats not found for race/level")

    # Составляем профиль игрока
    return {
        "nickname": user.nickname,
        "level": user.level,
        "experience": user.experience,
        "race_id": user.race_id,
        "race_name": user.race.name if user.race else "Unknown",
        "location_id": user.location_id,
        "location_name": user.location.name if user.location else "Unknown",
        "location_desc": user.location.description if user.location else "",
        "background": user.location.background if user.location else "",
        "hp": base_stats.hp,
        "mp": base_stats.mp,
        "strength": base_stats.strength + (skill.strength if skill else 0),
        "agility": base_stats.agility + (skill.agility if skill else 0),
        "power": base_stats.power + (skill.power if skill else 0),
        "intuition": skill.intuition if skill else 0,
        "ap": skill.available_attribute_points if skill else 0,
        "exp_to_next_level": None if not base_stats else (
            # Если есть запись для следующего уровня, вычисляем сколько опыта осталось до него
            (db.query(RaceLevelStat).filter((RaceLevelStat.race_id == user.race_id) & 
                                            (RaceLevelStat.level == user.level + 1)).first().hp 
             if db.query(RaceLevelStat).filter((RaceLevelStat.race_id == user.race_id) & 
                                               (RaceLevelStat.level == user.level + 1)).first()
             else None)
        )
    }

def get_user_by_token(request: Request, db: Session):
    user = get_user_from_session(request, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user

get_player_profile = get_user_profile  # alias
