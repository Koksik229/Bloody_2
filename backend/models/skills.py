from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    strength = Column(Integer, default=0)
    intuition = Column(Integer, default=0)
    agility = Column(Integer, default=0)
    power = Column(Integer, default=0)

    available_attribute_points = Column(Integer, default=5)

    user = relationship("User", back_populates="skills")
