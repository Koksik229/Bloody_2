from sqlalchemy import Column, Integer
from db import Base

class LevelProgression(Base):
    __tablename__ = "level_progression"
    id = Column(Integer, primary_key=True)
    level = Column(Integer)
    ap = Column(Integer)
    experience_required = Column(Integer)