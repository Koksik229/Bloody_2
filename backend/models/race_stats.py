from sqlalchemy import Column, Integer
from db import Base

class RaceLevelStat(Base):
    __tablename__ = "race_level_stats"
    id = Column(Integer, primary_key=True)
    race_id = Column(Integer)
    level = Column(Integer)
    hp = Column(Integer)
    mp = Column(Integer)
    strength = Column(Integer)
    agility = Column(Integer)
    power = Column(Integer)