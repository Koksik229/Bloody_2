from typing import Optional
from sqlalchemy.orm import Session

from models.currency import Currency
from models.wallet import UserWallet, WalletTransaction
from models.user import User

import logging
class WalletService:
    """Utility functions for managing user balances with auto-conversion."""

    def __init__(self, db: Session):
        self.logger = logging.getLogger(__name__)
        self.db = db

    # ---------- internal helpers ----------
    def _get_currency(self, code: str) -> Currency:
        cur = self.db.query(Currency).filter(Currency.code == code.upper()).first()
        if not cur:
            raise ValueError(f"Currency {code} not found")
        return cur

    def _get_balance_row(self, user: User, currency: Currency, create: bool = True) -> UserWallet:
        row: Optional[UserWallet] = (
            self.db.query(UserWallet)
            .filter(UserWallet.user_id == user.id, UserWallet.currency_id == currency.id)
            .first()
        )
        if not row and create:
            row = UserWallet(user_id=user.id, currency_id=currency.id, amount=0)
            self.db.add(row)
            self.db.flush()
        return row

    # ---------- public API ----------

    def get_balance(self, user: User, code: str) -> int:
        cur = self._get_currency(code)
        row = self._get_balance_row(user, cur, create=False)
        return row.amount if row else 0

    def credit(self, user: User, code: str, amount: int, reason: str = "reward"):
        if amount <= 0:
            raise ValueError("Amount must be positive to credit")
        cur = self._get_currency(code)
        row = self._get_balance_row(user, cur)
        row.amount += amount

        self.db.add(WalletTransaction(user_id=user.id, currency_id=cur.id, delta=amount, reason=reason))

    def debit(self, user: User, code: str, amount: int, reason: str = "purchase") -> bool:
        if amount <= 0:
            raise ValueError("Amount must be positive to debit")
        cur = self._get_currency(code)
        row = self._get_balance_row(user, cur, create=False)
        if not row or row.amount < amount:
            return False
        row.amount -= amount
        self.db.add(WalletTransaction(user_id=user.id, currency_id=cur.id, delta=-amount, reason=reason))
        return True

    # ---------- conversion helpers ----------
    def get_total_in_copper(self, user: User) -> int:
        total = 0
        currencies = self.db.query(Currency).all()
        for cur in currencies:
            row = self._get_balance_row(user, cur, create=False)
            if not row:
                continue
            if cur.base_copper:
                total += row.amount * cur.base_copper
        return total

    def has_enough(self, user: User, price_copper: int) -> bool:
        return self.get_total_in_copper(user) >= price_copper

    def consume(self, user: User, price_copper: int, reason: str = "purchase") -> bool:
        """Try to deduct price across copper->silver->gold hierarchy automatically."""
        currencies = (
            self.db.query(Currency)
            .filter(Currency.base_copper > 0)
            .order_by(Currency.base_copper.asc())  # copper first, then silver, etc.
            .all()
        )
        remaining = price_copper
        # Проверяем общий баланс
        if self.get_total_in_copper(user) < price_copper:
            return False

        # Проходим по валютам от мелкой к крупной
        for cur in currencies:
            row = self._get_balance_row(user, cur, create=False)
            if not row or row.amount == 0:
                continue
            value = cur.base_copper
            # Сколько монет этой валюты нужно, округляя вверх
            needed_units = (remaining + value - 1) // value
            take = min(row.amount, needed_units)
            self.logger.info(f"Processing {cur.code}: value={value}, have={row.amount}, take={take}, remaining={remaining}")
            row.amount -= take
            remaining -= take * value
            if remaining <= 0:
                break

        if remaining > 0:
            self.logger.warning(f"Consume failed: remaining={remaining}")
            return False

        self.db.add(WalletTransaction(user_id=user.id, currency_id=0, delta=-price_copper, reason=reason))
        return True
