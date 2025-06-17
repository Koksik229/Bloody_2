from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Race(Base):
    __tablename__ = "races"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    chat_color = Column(String, default="#4CAF50")  # Default color for humans
    base_strength = Column(Integer, default=10)
    base_agility = Column(Integer, default=10)
    base_power = Column(Integer, default=10)
    base_intuition = Column(Integer, default=10)
    base_weapon_skill = Column(Integer, default=5)
    base_parry = Column(Integer, default=5)
    base_shield_block = Column(Integer, default=5)

    # Relationships
    users = relationship("User", back_populates="race")
    level_stats = relationship("RaceLevelStat", back_populates="race")

class RaceLevelStat(Base):
    __tablename__ = "race_level_stats"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"))
    level = Column(Integer)
    hp_gain = Column(Integer)
    mp_gain = Column(Integer)

    # Relationships
    race = relationship("Race", back_populates="level_stats")