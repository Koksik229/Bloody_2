from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String)
    nickname = Column(String)

    race_id = Column(Integer, ForeignKey("races.id"), nullable=False, default=1)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, default=1)

    level = Column(Integer, default=1)        # Добавлено: уровень персонажа
    experience = Column(Integer, default=0)   # Добавлено: опыт персонажа

    created_at = Column(DateTime)
    last_login = Column(DateTime)
    last_seen = Column(DateTime)
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)

    # Связи с зависимыми таблицами
    skills = relationship("Skill", back_populates="user", uselist=False)
    race = relationship("Race")         # Добавлено: связь с моделью Race для user.race
    location = relationship("Location") # Добавлено: связь с моделью Location для user.location
