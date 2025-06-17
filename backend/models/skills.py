from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    strength = Column(Integer, default=0)
    agility = Column(Integer, default=0)
    power = Column(Integer, default=0)
    parry = Column(Integer, default=0)
    weapon_skill = Column(Integer, default=0)
    shield_block = Column(Integer, default=0)
    intuition = Column(Integer, default=0)

    # Очки для распределения
    available_attribute_points = Column(Integer, default=5)
    available_attribute_points_special = Column(Integer, default=2)

    user = relationship("User", back_populates="skills")
