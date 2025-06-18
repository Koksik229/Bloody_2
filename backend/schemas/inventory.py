from typing import List, Optional
from pydantic import BaseModel

class ItemStat(BaseModel):
    key: str
    value: int

class ItemBase(BaseModel):
    id: int
    name: str
    icon: Optional[str]
    durability_cur: Optional[int] = None
    durability_max: Optional[int] = None
    enhance_level: int = 0

    class Config:
        orm_mode = True

class EquipmentSlot(BaseModel):
    slot_code: str
    slot_name: str
    item: Optional[ItemBase]

class ItemGroup(BaseModel):
    id: int
    code: str
    name: str
    items: List[ItemBase]

    class Config:
        orm_mode = True

class EquipRequest(BaseModel):
    user_id: int
    slot_code: str
    user_item_id: int | None  # None for unequip


class ItemCategory(BaseModel):
    id: int
    code: str
    name: str
    groups: List[ItemGroup]

    class Config:
        orm_mode = True
