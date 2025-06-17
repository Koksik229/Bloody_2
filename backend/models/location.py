from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db import Base

class Location(Base):
    __tablename__ = "locations"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    background = Column(String)
    type_id = Column(Integer, ForeignKey("location_types.id"))
    
    # Связи
    type = relationship("LocationType", back_populates="locations")
    links_from = relationship("LocationLink", foreign_keys="LocationLink.from_id", back_populates="from_location")
    links_to = relationship("LocationLink", foreign_keys="LocationLink.to_id", back_populates="to_location")
    users = relationship("User", back_populates="location")

class LocationLink(Base):
    __tablename__ = "location_links"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    from_id = Column(Integer, ForeignKey("locations.id"))
    to_id = Column(Integer, ForeignKey("locations.id"))
    is_locked = Column(Boolean, default=False)
    
    # Связи
    from_location = relationship("Location", foreign_keys=[from_id], back_populates="links_from")
    to_location = relationship("Location", foreign_keys=[to_id], back_populates="links_to")

class LocationType(Base):
    __tablename__ = "location_types"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    
    # Связи
    locations = relationship("Location", back_populates="type")