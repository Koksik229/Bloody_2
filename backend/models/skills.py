from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    ap = Column(Integer, default=0)
    exp_to_next_ap = Column(Integer, default=100)
    hp = Column(Integer, default=30)
    mp = Column(Integer, default=10)
    strength = Column(Integer, default=5)
    agility = Column(Integer, default=5)
    power = Column(Integer, default=5)

    user = relationship("User", back_populates="skills")
