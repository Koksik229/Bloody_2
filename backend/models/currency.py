from sqlalchemy import Column, Integer, String
from db import Base

class Currency(Base):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name_ru = Column(String, nullable=False)
    base_copper = Column(Integer, nullable=False, comment="Сколько медных монет равны 1 единице этой валюты; 0 = неконвертируемая")

    def __repr__(self) -> str:
        return f"<Currency {self.code}>"
