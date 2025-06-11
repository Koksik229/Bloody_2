
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String)
    nickname = Column(String, unique=True, index=True)
    race_id = Column(Integer)
    location_id = Column(Integer)
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    last_seen = Column(DateTime)
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)
