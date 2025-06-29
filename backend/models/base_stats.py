from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from db import Base

class UserBaseStats(Base):
    __tablename__ = "user_base_stats"
    __table_args__ = {"extend_existing": True}

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    max_hp = Column(Integer, nullable=False, default=100)
    max_mp = Column(Integer, nullable=False, default=50)

    strength = Column(Integer, nullable=False, default=0)
    agility = Column(Integer, nullable=False, default=0)
    power = Column(Integer, nullable=False, default=0)
    parry = Column(Integer, nullable=False, default=0)
    weapon_skill = Column(Integer, nullable=False, default=0)
    shield_block = Column(Integer, nullable=False, default=0)
    intuition = Column(Integer, nullable=False, default=0)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="base_stats", uselist=False)


class UserVital(Base):
    __tablename__ = "user_vital"
    __table_args__ = {"extend_existing": True}

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    current_hp = Column(Integer, nullable=False, default=100)
    current_mp = Column(Integer, nullable=False, default=50)
    max_hp = Column(Integer, nullable=False, default=100)
    max_mp = Column(Integer, nullable=False, default=50)
    regen_ts = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="vital", uselist=False)
