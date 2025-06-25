from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from db import Base

class ProfessionalSkill(Base):
    """Dictionary of professional skills (e.g. fishing, woodcutting)."""
    __tablename__ = "professional_skill"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)

    progression = relationship("ProfessionalSkillProgression", back_populates="skill")
    users = relationship("UserProfessionalSkill", back_populates="skill")


class ProfessionalSkillProgression(Base):
    """XP breakpoints for each level of a professional skill"""
    __tablename__ = "professional_skill_progression"
    __table_args__ = (
        UniqueConstraint("skill_id", "level", name="uq_prof_skill_level"),
    )

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("professional_skill.id", ondelete="CASCADE"))
    level = Column(Integer, nullable=False)
    xp_required = Column(Integer, nullable=False)

    skill = relationship("ProfessionalSkill", back_populates="progression")


class UserProfessionalSkill(Base):
    """Current XP and level for user's professional skills"""
    __tablename__ = "user_professional_skill"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_prof_skill"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    skill_id = Column(Integer, ForeignKey("professional_skill.id", ondelete="CASCADE"))
    current_xp = Column(Integer, default=0)
    level = Column(Integer, default=0)

    skill = relationship("ProfessionalSkill", back_populates="users")
    # relationship to user defined in User model via back_populates if needed
