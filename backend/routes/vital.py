from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import logging
from db import get_db
from auth import get_current_user
from models import UserVital
from services.stats import recalc_base_stats, regen_vital_if_needed

router = APIRouter(prefix="/vital", tags=["vital"])


class DeltaReq(BaseModel):
    delta_hp: int = 0  # отрицательное = урон, положительное = хил
    delta_mp: int = 0  # отрицательное = расход маны


@router.post("/recalc")
async def recalc_vital(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Пересчитывает max_hp/mp + атрибуты после смены экипа или level-up."""
    recalc_base_stats(db, current_user.id)
    return {"status": "ok"}


@router.get("")
async def get_vital(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Возвращает текущее и максимальное HP/MP, учитывая пассивную регенерацию."""
    vital: UserVital = db.get(UserVital, current_user.id)
    if not vital:
        raise HTTPException(404, "Vital not found")

    changed = regen_vital_if_needed(vital)
    if changed:
        db.commit()
    return {"hp": vital.current_hp, "mp": vital.current_mp, "max_hp": vital.max_hp, "max_mp": vital.max_mp, "regen_ts": vital.regen_ts.isoformat()}


@router.post("/apply")
async def apply_delta(body: DeltaReq, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vital: UserVital = db.get(UserVital, current_user.id)
    if not vital:
        raise HTTPException(404, "Vital not found")

    vital.current_hp = max(0, min(vital.max_hp, vital.current_hp + body.delta_hp))
    vital.current_mp = max(0, min(vital.max_mp, vital.current_mp + body.delta_mp))
    db.commit()
    return {"hp": vital.current_hp, "mp": vital.current_mp}
