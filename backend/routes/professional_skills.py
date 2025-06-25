from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.professional import ProfessionalSkill, ProfessionalSkillProgression, UserProfessionalSkill
from auth import get_current_user
from logging import getLogger

logger = getLogger(__name__)

router = APIRouter(prefix="/professional-skills", tags=["professional_skills"])


@router.get("")
@router.get("/")
async def get_professional_skills(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # Join table to get skill dictionary info alongside user values
        results = (
            db.query(UserProfessionalSkill, ProfessionalSkill)
            .join(ProfessionalSkill, ProfessionalSkill.id == UserProfessionalSkill.skill_id)
            .filter(UserProfessionalSkill.user_id == current_user.id)
            .all()
        )
        skills_payload = []
        for ups, skill in results:
            # Get XP threshold for next level (level +1)
            next_prog = (
                db.query(ProfessionalSkillProgression)
                .filter(
                    ProfessionalSkillProgression.skill_id == skill.id,
                    ProfessionalSkillProgression.level == ups.level + 1,
                )
                .first()
            )
            skills_payload.append(
                {
                    "code": skill.code,
                    "name": skill.name,
                    "level": ups.level,
                    "current_xp": ups.current_xp,
                    "next_level_xp": next_prog.xp_required if next_prog else None,
                }
            )
        return skills_payload
    except Exception as e:
        logger.error(
            f"Error retrieving professional skills for user {getattr(current_user, 'nickname', '?')}: {e}"
        )
        raise HTTPException(status_code=500, detail="Error retrieving professional skills")
