from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db import get_db
from models.skills import Skill
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("/")
async def get_skills(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Получение навыков пользователя"""
    try:
        skills = db.query(Skill).filter(Skill.user_id == current_user.id).first()
        if not skills:
            raise HTTPException(status_code=404, detail="Skills not found")
        return {
            "attributes": {
                "strength": skills.strength,
                "agility": skills.agility,
                "power": skills.power,
                "intuition": skills.intuition
            },
            "combat_skills": {
                "weapon_skill": skills.weapon_skill,
                "parry": skills.parry,
                "shield_block": skills.shield_block
            },
            "points": {
                "attributes": skills.available_attribute_points,
                "attributes_special": skills.available_attribute_points_special
            }
        }
    except Exception as e:
        logger.error(f"Error getting skills for user {getattr(current_user, 'nickname', '?')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving skills")

@router.put("/")
async def update_skills(
    skills_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Обновление навыков пользователя"""
    try:
        skills = db.query(Skill).filter(Skill.user_id == current_user.id).first()
        if not skills:
            raise HTTPException(status_code=404, detail="Skills not found")
        # Обновляем атрибуты
        if "attributes" in skills_data:
            attrs = skills_data["attributes"]
            if "strength" in attrs:
                skills.strength = attrs["strength"]
            if "agility" in attrs:
                skills.agility = attrs["agility"]
            if "power" in attrs:
                skills.power = attrs["power"]
            if "intuition" in attrs:
                skills.intuition = attrs["intuition"]
        # Обновляем боевые навыки
        if "combat_skills" in skills_data:
            combat = skills_data["combat_skills"]
            if "weapon_skill" in combat:
                skills.weapon_skill = combat["weapon_skill"]
            if "parry" in combat:
                skills.parry = combat["parry"]
            if "shield_block" in combat:
                skills.shield_block = combat["shield_block"]
        # Обновляем очки
        if "points" in skills_data:
            points = skills_data["points"]
            if "attributes" in points:
                skills.available_attribute_points = points["attributes"]
            if "attributes_special" in points:
                skills.available_attribute_points_special = points["attributes_special"]
        db.commit()
        return {"message": "Skills updated successfully"}
    except Exception as e:
        logger.error(f"Error updating skills for user {getattr(current_user, 'nickname', '?')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating skills") 