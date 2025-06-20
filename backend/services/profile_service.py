from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.race import RaceLevelStat
from models.location import Location, LocationLink
from models.skills import Skill
from models.race import Race
from models.level_progression import LevelProgression
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_user_profile(db: Session, user_id: int) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # Получаем связанные данные
    race = db.query(Race).filter(Race.id == user.race_id).first()
    location = db.query(Location).filter(Location.id == user.location_id).first()
    skill = user.skills[0] if user.skills else None
    if not skill:
        return None

    # Получаем доступные локации
    available_locations = []
    if location:
        # Получаем все связи из текущей локации
        links = db.query(LocationLink).filter(LocationLink.from_id == location.id).all()
        for link in links:
            target_location = db.query(Location).filter(Location.id == link.to_id).first()
            if target_location:
                available_locations.append({
                    "id": target_location.id,
                    "name": target_location.name,
                    "is_locked": link.is_locked
                })

    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "level": user.level,
        "experience": user.experience,
        "race": {
            "id": race.id if race else None,
            "name": race.name if race else None
        },
        "location": {
            "id": location.id if location else None,
            "name": location.name if location else None,
            "background": location.background if location else None,
            "type_id": location.type_id if location else None
        },
        "attributes": {
            "strength": skill.strength,
            "agility": skill.agility,
            "power": skill.power,
            "intuition": skill.intuition
        },
        "combat_skills": {
            "weapon_skill": skill.weapon_skill,
            "parry": skill.parry,
            "shield_block": skill.shield_block
        },
        "points": {
            "attributes": skill.available_attribute_points,
            "attributes_special": skill.available_attribute_points_special
        },
        "available_locations": available_locations
    }

get_player_profile = get_user_profile  # alias

def get_user_stats(db: Session, user_id: int) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    skills = db.query(Skill).filter(Skill.user_id == user_id).first()
    if skills:
        return {
            "attributes": {
                "strength": skills.strength,
                "agility": skills.agility,
                "power": skills.power,
                "parry": skills.parry,
                "weapon_skill": skills.weapon_skill,
                "shield_block": skills.shield_block,
                "intuition": skills.intuition,
                "available_attribute_points": skills.available_attribute_points,
                "available_attribute_points_special": skills.available_attribute_points_special
            }
        }
    return None

def update_user_profile(db: Session, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # Обновляем базовые данные
    if "nickname" in data:
        user.nickname = data["nickname"]

    # Обновляем навыки
    skills = db.query(Skill).filter(Skill.user_id == user_id).first()
    if skills:
        if "attributes" in data:
            attrs = data["attributes"]
            if "strength" in attrs:
                skills.strength = attrs["strength"]
            if "agility" in attrs:
                skills.agility = attrs["agility"]
            if "power" in attrs:
                skills.power = attrs["power"]
            if "parry" in attrs:
                skills.parry = attrs["parry"]
            if "weapon_skill" in attrs:
                skills.weapon_skill = attrs["weapon_skill"]
            if "shield_block" in attrs:
                skills.shield_block = attrs["shield_block"]
            if "intuition" in attrs:
                skills.intuition = attrs["intuition"]
            if "available_attribute_points" in attrs:
                skills.available_attribute_points = attrs["available_attribute_points"]
            if "available_attribute_points_special" in attrs:
                skills.available_attribute_points_special = attrs["available_attribute_points_special"]

    db.commit()
    return get_user_profile(db, user_id)
