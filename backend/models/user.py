from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db import Base
from models.skills import Skill  # 🔧 Критически важно: импорт напрямую, не как строка

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # 🔧 Прямая ссылка на модель Skill
    skills = relationship(Skill, back_populates="user", uselist=False)
