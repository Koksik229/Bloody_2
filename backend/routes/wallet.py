from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict

from db import get_db
from auth import get_current_user
from services.wallet_service import WalletService
from models.user import User
from models.currency import Currency

class BalanceItem(BaseModel):
    code: str
    amount: int

router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.get("/balance", response_model=List[BalanceItem])
async def get_wallet_balance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Возвращает список объектов {code, amount}."""
    ws = WalletService(db)
    currencies = db.query(Currency).all()
    return [BalanceItem(code=cur.code, amount=ws.get_balance(current_user, cur.code)) for cur in currencies]
