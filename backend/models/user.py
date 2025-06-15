from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db import Base
# Импорт не обязательно тянуть здесь, главное — relationship указать правильно.

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String)
    nickname = Column(String)

    race_id = Column(Integer, ForeignKey("races.id"), nullable=False, default=1)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, default=1)

    created_at = Column(DateTime)
    last_login = Column(DateTime)
    last_seen = Column(DateTime)
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)

    # Связь с таблицей skills
    skills = relationship("Skill", back_populates="user", uselist=False)
