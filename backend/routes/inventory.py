import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_current_user
from sqlalchemy import text
from db import get_db
from schemas.inventory import ItemCategory, ItemGroup, EquipmentSlot, ItemBase, EquipRequest
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inventory", tags=["inventory"])

# NOTE: ORM models are not fully described here. Simple raw SQL used for now.

@router.get("/categories", response_model=List[ItemCategory])
def get_inventory_categories(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = current_user.id
    """Return categories -> groups -> user items for given user."""
    # fetch all items for user with group and category
    rows = db.execute(
        text("""
        SELECT ic.id as cat_id, ic.code as cat_code, ic.name_ru as cat_name,
               ig.id as grp_id, ig.code as grp_code, ig.name_ru as grp_name,
               ui.id as user_item_id, it.name as item_name, it.icon, ui.durability_cur, ui.durability_max, ui.enhance_level
        FROM item_categories ic
        JOIN item_groups ig ON ig.category_id = ic.id
        LEFT JOIN items it ON it.group_id = ig.id
        LEFT JOIN user_items ui ON ui.item_id = it.id AND ui.user_id = :uid
        ORDER BY ic.id, ig.id
        """),
        {"uid": user_id},
    ).mappings().all()

    categories: List[ItemCategory] = []
    cat_map = {}
    grp_map = {}

    for r in rows:
        cat_id = r["cat_id"]
        if cat_id not in cat_map:
            cat = ItemCategory(id=cat_id, code=r["cat_code"], name=r["cat_name"], groups=[])
            cat_map[cat_id] = cat
            categories.append(cat)
        grp_id = r["grp_id"]
        if grp_id not in grp_map:
            grp = ItemGroup(id=grp_id, code=r["grp_code"], name=r["grp_name"], items=[])
            grp_map[grp_id] = grp
            cat_map[cat_id].groups.append(grp)
        if r["user_item_id"] is not None:
            item = ItemBase(
                id=r["user_item_id"],
                name=r["item_name"],
                icon=r["icon"],
                durability_cur=r["durability_cur"],
                durability_max=r["durability_max"],
                enhance_level=r["enhance_level"],
            )
            grp_map[grp_id].items.append(item)
    return categories

@router.get("/equipment", response_model=List[EquipmentSlot])
def get_equipped(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = current_user.id
    rows = db.execute(
        text("""
        SELECT es.code, es.name_ru,
               ui.id as user_item_id, it.name, it.icon, ui.durability_cur, ui.durability_max, ui.enhance_level
        FROM equipment_slots es
        LEFT JOIN user_equipment ue ON ue.slot_id = es.id AND ue.user_id = :uid
        LEFT JOIN user_items ui ON ui.id = ue.user_item_id
        LEFT JOIN items it ON it.id = ui.item_id
        ORDER BY es.id
        """),
        {"uid": user_id},
    ).mappings().all()

    result: List[EquipmentSlot] = []
    for r in rows:
        item = None
        if r["user_item_id"] is not None:
            item = ItemBase(id=r["user_item_id"], name=r["name"], icon=r["icon"], durability_cur=r["durability_cur"], durability_max=r["durability_max"], enhance_level=r["enhance_level"])
        result.append(EquipmentSlot(slot_code=r["code"], slot_name=r["name_ru"], item=item))
    return result


@router.post("/equipment/equip")
def equip_item(
    req: EquipRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    slot_id_row = db.execute(text("SELECT id FROM equipment_slots WHERE code=:c"), {"c": req.slot_code}).scalar_one_or_none()
    if slot_id_row is None:
        raise HTTPException(status_code=400, detail="Unknown slot_code")
    slot_id = slot_id_row

    # upsert user_equipment
    db.execute(text("""
        INSERT INTO user_equipment(user_id, slot_id, user_item_id, equipped_at)
        VALUES (:uid, :sid, :ui, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, slot_id) DO UPDATE SET user_item_id=excluded.user_item_id, equipped_at=CURRENT_TIMESTAMP
    """), {"uid": current_user.id, "sid": slot_id, "ui": req.user_item_id})
    db.commit()
    return {"status": "ok", "user_id": current_user.id}
