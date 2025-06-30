# -*- coding: utf-8 -*-
"""Simple bestiary endpoints.
Currently returns a static list of 5 monsters.
Later can be stored in DB.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/bestiary", tags=["bestiary"])

class Monster(BaseModel):
    id: int
    name: str
    icon: str  # path relative to /icons

MONSTERS = [
    Monster(id=1, name="Троглодит", icon="monstr/trogl-Photoroom.png"),
    Monster(id=2, name="Скелет", icon="monstr/skel.png"),
    Monster(id=3, name="Кентавр", icon="monstr/kent-Photoroom.png"),
    Monster(id=4, name="Голем", icon="monstr/golem.png"),
    Monster(id=5, name="Гарпия", icon="monstr/harpy.png"),  # добавить файл позже
]

@router.get("/monsters", response_model=list[Monster])
def list_monsters():
    return MONSTERS
