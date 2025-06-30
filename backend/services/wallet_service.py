from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

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
            """Deduct composite price across copper/silver/gold hierarchy. Returns True on success."""
            self.logger.info(f"[consume] user_id={user.id} price={price_copper}c reason={reason}")
            if self.get_total_in_copper(user) < price_copper:
                return False
            currencies = (
                self.db.query(Currency)
                .filter(Currency.base_copper > 0)
                .order_by(Currency.base_copper.asc())
                .all()
            )
            remaining = price_copper
            for cur in currencies:
                row = self._get_balance_row(user, cur, create=False)
                if not row or row.amount == 0:
                    continue
                value = cur.base_copper
                needed_units = (remaining + value - 1) // value
                take = min(row.amount, needed_units)
                self.logger.info(f"Processing {cur.code}: value={value}, have={row.amount}, take={take}, remaining={remaining}")
                row.amount -= take
                remaining -= take * value
                if remaining <= 0:
                    break
            if remaining > 0:
                self.logger.warning(f"[consume] FAILURE insufficient funds. remaining={remaining}")
                return False
            self.db.add(WalletTransaction(user_id=user.id, currency_id=0, delta=-price_copper, reason=reason))
            self.logger.info(f"[consume] SUCCESS total deducted {price_copper}c")
            return True


# ---------- equipment helpers ----------

def sum_equipment_effects(db: Session, user_id: int) -> dict[str, int]:
    """Return aggregated stat bonuses from all equipped items for a user."""
    rows = db.execute(text(
        """
        SELECT ie.stat, SUM(ie.amount) AS total
        FROM user_equipment ue
        JOIN user_items ui ON ui.id = ue.user_item_id
        JOIN item_effects ie ON ie.item_id = ui.item_id
        WHERE ue.user_id = :uid AND ue.user_item_id IS NOT NULL
        GROUP BY ie.stat
        """
    ), {"uid": user_id}).mappings().all()
    return {r["stat"]: r["total"] for r in rows}


