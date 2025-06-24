from pydantic import BaseModel
from typing import Optional

class ShopItem(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    price_copper: int
    min_level: int
    min_damage: Optional[int] = None
    max_damage: Optional[int] = None
    str_bonus: Optional[int] = None
    agi_bonus: Optional[int] = None
    int_bonus: Optional[int] = None
    max_durability: Optional[int] = None

    class Config:
        orm_mode = True
