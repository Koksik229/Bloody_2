from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models.location import Location, LocationLink
from auth import get_current_user
import logging

router = APIRouter(prefix="/location", tags=["location"])
logger = logging.getLogger(__name__)

@router.get("/{location_id}")
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Локация не найдена")

    # Получить доступные переходы
    links = db.query(LocationLink).filter(
        LocationLink.from_id == location_id,
        LocationLink.is_locked == False
    ).all()

    # Получить имена локаций по переходам
    available_moves = []
    for link in links:
        dest = db.query(Location).filter(Location.id == link.to_id).first()
        if dest:
            available_moves.append({
                "id": dest.id,
                "name": dest.name
            })

    return {
        "id": location.id,
        "name": location.name,
        "description": location.description,
        "background": location.background,
        "available_moves": available_moves
    }

@router.post("/move")
def move(
    data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    logger.info(f"Попытка перехода: data={data}, user_id={current_user.id}")
    user = current_user
    location_id = data.get("location_id")

    if not location_id:
        raise HTTPException(status_code=400, detail="Не указан location_id")

    # Проверим, доступен ли переход
    connection = db.query(LocationLink).filter_by(
        from_id=user.location_id,
        to_id=location_id,
        is_locked=False
    ).first()

    if not connection:
        raise HTTPException(status_code=400, detail="Недопустимый переход")

    # Выполним переход
    user.location_id = location_id
    db.commit()

    return {"status": "ok", "new_location": location_id}
