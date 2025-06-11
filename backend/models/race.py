from sqlalchemy import Column, Integer, String, Text
from db import Base

class Race(Base):
    __tablename__ = "races"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)