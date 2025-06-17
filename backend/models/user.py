from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db import Base
from models.chat import ChatMessage
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    nickname = Column(String, unique=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    last_seen = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)

    # Relationships
    race = relationship("Race", back_populates="users")
    location = relationship("Location", back_populates="users")
    sent_messages = relationship("ChatMessage", foreign_keys="[ChatMessage.sender_id]", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="[ChatMessage.receiver_id]", back_populates="receiver")
    skills = relationship("Skill", back_populates="user")
