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
    # optional combat stats
    min_level: int | None = None
    min_damage: int | None = None
    max_damage: int | None = None
    str_bonus: int | None = None
    agi_bonus: int | None = None
    int_bonus: int | None = None
    # raw stats json
    base_stats: dict[str, int] | None = None
    # aggregated effects from item_effects
    effects: dict[str, int] | None = None
    description: str | None = None

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

class UnequipRequest(BaseModel):
    slot_code: str


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
