from datetime import datetime
from typing import Dict

from sqlalchemy.orm import Session

from models import User, UserBaseStats, UserVital, RaceLevelStat, Skill
try:
    from services.wallet_service import sum_equipment_effects  # real util expected elsewhere
except ImportError:  # fallback stub so that backend can start
    def sum_equipment_effects(db, user_id):
        return {}


import math

# HP should fully regen in 5 min (300 сек)
# MP – в 10 мин. Вычисляем на лету исходя из max_*



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
    # --- синхронизируем витальные показатели ---
    vital: UserVital | None = db.query(UserVital).filter_by(user_id=user_id).first()
    now = datetime.utcnow()
    if not vital:
        vital = UserVital(user_id=user_id,
                         current_hp=hp_base, current_mp=mp_base,
                         max_hp=hp_base, max_mp=mp_base,
                         regen_ts=now)
        db.add(vital)
    else:
        # если max уменьшился, нужно обрезать текущие
        vital.max_hp = hp_base
        vital.max_mp = mp_base
        if vital.current_hp > vital.max_hp:
            vital.current_hp = vital.max_hp
        if vital.current_mp > vital.max_mp:
            vital.current_mp = vital.max_mp
        # если max вырос, текущие оставляем как есть (реген пойдет сам)
    vital.updated_at = now if hasattr(vital, 'updated_at') else vital.regen_ts  # best-effort
    db.commit()
    return base


def regen_vital_if_needed(vital: UserVital, now: datetime | None = None) -> bool:
    """Apply passive regen based on minutes elapsed. Returns True if mutated."""
    if not now:
        now = datetime.utcnow()
    delta_sec = (now - vital.regen_ts).total_seconds()
    if delta_sec <= 0:
        return False

    # прирост за секунду: max/300 (hp) и max/600 (mp)
    hp_gain = vital.max_hp * (delta_sec / 300)
    mp_gain = vital.max_mp * (delta_sec / 600)

    changed = False
    if vital.current_hp < vital.max_hp:
        vital.current_hp = min(vital.max_hp, int(vital.current_hp + hp_gain))
        changed = True
    if vital.current_mp < vital.max_mp:
        vital.current_mp = min(vital.max_mp, int(vital.current_mp + mp_gain))
        changed = True
    if changed:
        vital.regen_ts = now
    return changed
