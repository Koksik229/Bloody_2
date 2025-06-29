from datetime import datetime
from typing import Dict

from sqlalchemy.orm import Session

from models import User, UserBaseStats, UserVital, RaceLevelStat, Skill
try:
    from services.wallet_service import sum_equipment_effects  # real util expected elsewhere
except ImportError:  # fallback stub so that backend can start
    def sum_equipment_effects(db, user_id):
        return {}


REGEN_PER_MIN = 1  # hp/mp per minute


def recalc_base_stats(db: Session, user_id: int) -> UserBaseStats:
    """Recalculate and store summed stats (HP/MP + attributes)."""
    user: User = db.get(User, user_id)
    if not user:
        raise ValueError("User not found")

    # Base HP/MP
    hp_base = 100
    mp_base = 50

    # Race-level gains
    rls = (
        db.query(RaceLevelStat)
        .filter(RaceLevelStat.race_id == user.race_id, RaceLevelStat.level == user.level)
        .first()
    )
    if rls:
        hp_base += rls.hp_gain or 0
        mp_base += rls.mp_gain or 0

    # Equipment bonuses (expects dict like {'hp':10,'mp':5,'strength':2})
    eq_bonus: Dict[str, int] = sum_equipment_effects(db, user_id) if hasattr(
        sum_equipment_effects, "__call__"
    ) else {}

    hp_base += eq_bonus.get("hp", 0)
    mp_base += eq_bonus.get("mp", 0)

    # Attribute bonuses from skills
    skills: Skill = db.query(Skill).filter_by(user_id=user_id).first()
    strength = (skills.strength if skills else 0) + eq_bonus.get("strength", 0)
    agility = (skills.agility if skills else 0) + eq_bonus.get("agility", 0)
    power = (skills.power if skills else 0) + eq_bonus.get("power", 0)
    parry = (skills.parry if skills else 0) + eq_bonus.get("parry", 0)
    weapon_skill = (skills.weapon_skill if skills else 0) + eq_bonus.get("weapon_skill", 0)
    shield_block = (skills.shield_block if skills else 0) + eq_bonus.get("shield_block", 0)
    intuition = (skills.intuition if skills else 0) + eq_bonus.get("intuition", 0)

    base = UserBaseStats(
        user_id=user_id,
        max_hp=hp_base,
        max_mp=mp_base,
        strength=strength,
        agility=agility,
        power=power,
        parry=parry,
        weapon_skill=weapon_skill,
        shield_block=shield_block,
        intuition=intuition,
        updated_at=datetime.utcnow(),
    )
    db.merge(base)
    db.commit()
    return base


def regen_vital_if_needed(vital: UserVital, now: datetime | None = None) -> bool:
    """Apply passive regen based on minutes elapsed. Returns True if mutated."""
    if not now:
        now = datetime.utcnow()
    delta_sec = (now - vital.regen_ts).total_seconds()
    minutes = int(delta_sec // 60)
    if minutes <= 0:
        return False

    changed = False
    if vital.current_hp < vital.max_hp:
        vital.current_hp = min(vital.max_hp, vital.current_hp + minutes * REGEN_PER_MIN)
        changed = True
    if vital.current_mp < vital.max_mp:
        vital.current_mp = min(vital.max_mp, vital.current_mp + minutes * REGEN_PER_MIN)
        changed = True
    if changed:
        vital.regen_ts = now
    return changed
