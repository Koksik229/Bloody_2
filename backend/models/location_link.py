from sqlalchemy import Column, Integer, Boolean
from db import Base

class LocationLink(Base):
    __tablename__ = "location_links"
    id = Column(Integer, primary_key=True)
    from_id = Column(Integer)
    to_id = Column(Integer)
    is_locked = Column(Boolean, default=False)