from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class UserWallet(Base):
    __tablename__ = "user_wallets"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    currency_id = Column(Integer, ForeignKey("currencies.id", ondelete="CASCADE"), primary_key=True)
    amount = Column(Integer, default=0, nullable=False)

    # relationships (lazy=False to avoid circular issues)
    currency = relationship("Currency", lazy="joined")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    currency_id = Column(Integer, ForeignKey("currencies.id"))
    delta = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    currency = relationship("Currency", lazy="joined")
