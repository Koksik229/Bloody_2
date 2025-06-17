from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_template_id = Column(Integer, nullable=False)
    slot = Column(String, nullable=False)

    # Отношения
    user = relationship("User", back_populates="equipment")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_template_id = Column(Integer, nullable=False)
    quantity = Column(Integer, default=1)

    # Отношения
    user = relationship("User", back_populates="inventory")

# Устанавливаем отношения после определения всех моделей
from models.user import User
User.equipment = relationship("Equipment", back_populates="user")
User.inventory = relationship("Inventory", back_populates="user") 