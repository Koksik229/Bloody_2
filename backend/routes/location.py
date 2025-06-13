from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models.location import Location
from models.location_link import LocationLink
from models.location import Location as LocModel

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
        dest = db.query(LocModel).filter(LocModel.id == link.to_id).first()
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
