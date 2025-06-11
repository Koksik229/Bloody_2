from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from db import Base

class LoginLog(Base):
    __tablename__ = "login_logs"
    id = Column(Integer, primary_key=True)
    username = Column(String)
    success = Column(Boolean)
    timestamp = Column(DateTime, default=datetime.utcnow)
