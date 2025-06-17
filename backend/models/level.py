from sqlalchemy import Column, Integer
from db import Base

class LevelProgression(Base):
    __tablename__ = "level_progression"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(Integer, nullable=False)
    ap = Column(Integer, nullable=False)
    experience_required = Column(Integer, nullable=False) 