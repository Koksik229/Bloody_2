from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Skill(Base):
    __tablename__ = "skills"

    # Убираем отдельный ID: primary key — user_id для связи 1:1 с User
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    # Атрибуты: хранят **дополнительные** очки, потраченные на прокачку (базовые берутся из race_level_stats)
    strength = Column(Integer, default=0)
    agility  = Column(Integer, default=0)
    power    = Column(Integer, default=0)
    intuition = Column(Integer, default=0)

    available_attribute_points = Column(Integer, default=5)  # свободные очки для распределения

    user = relationship("User", back_populates="skills")
