from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db import get_db
from models.location import Location
from models.location_link import LocationLink
from services.profile_service import get_user_by_token

router = APIRouter(prefix="/location", tags=["location"])

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
def move(request: Request, data: dict, db: Session = Depends(get_db)):
    user = get_user_by_token(request, db)
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
