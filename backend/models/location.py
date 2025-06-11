from sqlalchemy import Column, Integer, String, Text
from db import Base

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    background = Column(String)
    type_id = Column(Integer)