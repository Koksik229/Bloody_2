import logging
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from auth import get_current_user
from services.stats import recalc_base_stats
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from db import get_db
from schemas.inventory import ItemCategory, ItemGroup, EquipmentSlot, ItemBase, EquipRequest, UnequipRequest
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inventory", tags=["inventory"])  # noqa


@router.post("/items/{user_item_id}/discard")
def discard_item(user_item_id:int, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    # ensure item belongs to user and not equipped
    row = db.execute(text("SELECT id FROM user_items WHERE id=:iid AND user_id=:uid AND is_deleted=0"),{"iid":user_item_id,"uid":current_user.id}).first()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    eq = db.execute(text("SELECT 1 FROM user_equipment WHERE user_item_id=:iid"),{"iid":user_item_id}).first()
    if eq:
        raise HTTPException(status_code=400, detail="Unequip item first")
    db.execute(text("UPDATE user_items SET is_deleted=1 WHERE id=:iid"),{"iid":user_item_id})
    db.commit()
    return {"status":"ok"}

@router.post("/equipment/unequip")
def unequip_item(
    req: UnequipRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Remove item from given slot for current user and return id of removed user_item."""
    # find slot id
    srow = db.execute(text("SELECT id FROM equipment_slots WHERE code=:c"), {"c": req.slot_code}).first()
    if not srow:
        raise HTTPException(status_code=404, detail="Unknown slot")
    sid = srow[0]

    # fetch current equipment entry
    row = db.execute(text("SELECT user_item_id FROM user_equipment WHERE user_id=:uid AND slot_id=:sid"), {"uid":current_user.id, "sid": sid}).first()
    if not row or row[0] is None:
        return {"status": "empty"}
    user_item_id = row[0]

    # clear slot
    db.execute(text("UPDATE user_equipment SET user_item_id=NULL WHERE user_id=:uid AND slot_id=:sid"), {"uid":current_user.id,"sid":sid})
    db.commit()
    # recalc stats after unequip
    recalc_base_stats(db, current_user.id)
    logger.info("Unequipped ui=%s from slot %s (user %s)", user_item_id, req.slot_code, current_user.id)
    return {"status": "ok", "user_item_id": user_item_id, "slot_code": req.slot_code}

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
               ui.id as user_item_id, it.id as def_item_id, it.name as item_name, it.icon, ui.durability_cur, ui.durability_max, ui.enhance_level,
               it.min_level, it.base_stats_json
        FROM item_categories ic
        LEFT JOIN item_groups ig ON ig.category_id = ic.id
        LEFT JOIN items it ON it.group_id = ig.id
        LEFT JOIN user_items ui ON ui.item_id = it.id AND ui.user_id = :uid AND ui.is_deleted = 0
        LEFT JOIN user_equipment ue2 ON ue2.user_item_id = ui.id AND ue2.user_id = :uid  -- check if equipped
        WHERE ue2.user_item_id IS NULL
        ORDER BY ic.id, ig.id
        """),
        {"uid": user_id},
    ).mappings().all()

    categories: List[ItemCategory] = []
    import json
    cat_map = {}
    grp_map = {}
    item_map = {}
    def_map: dict[int, list[ItemBase]] = {}

    for r in rows:
        cat_id = r["cat_id"]
        if cat_id not in cat_map:
            cat = ItemCategory(id=cat_id, code=r["cat_code"], name=r["cat_name"], groups=[])
            cat_map[cat_id] = cat
            categories.append(cat)
        grp_id = r["grp_id"]
        if grp_id is not None and grp_id not in grp_map:
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
                 min_level=r["min_level"],
                 base_stats=json.loads(r["base_stats_json"]) if r["base_stats_json"] else None,
            )
            grp_map[grp_id].items.append(item)
            item_map[item.id] = item
            if r["def_item_id"] is not None:
                def_map.setdefault(r["def_item_id"], []).append(item)
    # effects query
    # attach effects using definition item ids
    if def_map:
        ids = tuple(def_map.keys())
        id_list = ','.join(str(i) for i in ids)
        q = db.execute(text(f"SELECT item_id, stat, amount FROM item_effects WHERE amount<>0 AND item_id IN ({id_list})")).mappings().all()
        for row in q:
            for itm in def_map.get(row["item_id"], []):
                if itm.effects is None:
                    itm.effects = {}
                itm.effects[row["stat"]] = row["amount"]

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
               ui.id as user_item_id, it.id as def_item_id, it.name, it.icon, ui.durability_cur, ui.durability_max, ui.enhance_level, it.min_level, it.base_stats_json, it.description
        FROM equipment_slots es
        LEFT JOIN user_equipment ue ON ue.slot_id = es.id AND ue.user_id = :uid
        LEFT JOIN user_items ui ON ui.id = ue.user_item_id
        LEFT JOIN items it ON it.id = ui.item_id
        ORDER BY es.id
        """),
        {"uid": user_id},
    ).mappings().all()

    result: List[EquipmentSlot] = []
    # Map from definition item_id to list of ItemBase objects built for the same definition
    def_map: dict[int, list[ItemBase]] = {}
    for r in rows:
        item = None
        if r["user_item_id"] is not None:
            base_stats = None
            if r["base_stats_json"]:
                import json
                try:
                    base_stats = json.loads(r["base_stats_json"])
                except Exception:
                    base_stats = None
            item = ItemBase(
                id=r["user_item_id"],
                name=r["name"],
                icon=r["icon"],
                durability_cur=r["durability_cur"],
                durability_max=r["durability_max"],
                enhance_level=r["enhance_level"],
                min_level=r["min_level"],
                base_stats=base_stats,
                description=r["description"],
            )
            # remember this item under its definition id for later effect attachment
            if r["def_item_id"] is not None:
                def_map.setdefault(r["def_item_id"], []).append(item)
        result.append(EquipmentSlot(slot_code=r["code"], slot_name=r["name_ru"], item=item))

    # attach effects
    if def_map:
        ids = ','.join(str(i) for i in def_map.keys())
        q = db.execute(text(f"SELECT item_id, stat, amount FROM item_effects WHERE amount<>0 AND item_id IN ({ids})")).mappings().all()
        for row in q:
            for itm in def_map.get(row["item_id"], []):
                if itm.effects is None:
                    itm.effects = {}
                itm.effects[row["stat"]] = row["amount"]
    return result


@router.post("/equipment/equip")
def equip_item(
    req: EquipRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # ----------------- auto slot detection -----------------
    if req.slot_code in (None, '', 'auto'):
        logger.info("Auto slot detection for ui=%s", req.user_item_id)
        row = db.execute(text("""
            SELECT ig.code as group_code, it.item_type_id, it.two_handed
            FROM user_items ui
            JOIN items it ON it.id = ui.item_id
            JOIN item_groups ig ON ig.id = it.group_id
            WHERE ui.id = :ui
        """), {"ui": req.user_item_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=400, detail="Cannot determine slot for item")
        group_code = row['group_code']
        # simple mapping: same code unless special cases
        # weapon goes straight to main hand
        if row['item_type_id'] == 1:
            req.slot_code = 'weapon_main'
        else:
            slot_map = {
            'helmet': 'helmet',
            'shirt': 'shirt',
            'armor': 'armor',
            'belt': 'belt',
            'bracelet': 'hands',
            'cloak': 'cloak',
            'boots': 'boots',
            'gloves': 'gloves',
            'ring': 'ring1',
            'ring_unique': 'ring1',
            'shield': 'weapon_off'  # handled later anyway
        }
            req.slot_code = slot_map.get(group_code, group_code)
        logger.info("Auto-mapped group %s -> slot_code %s", group_code, req.slot_code)

    # ----------------- generic equip for non-weapon slots -----------------
    NON_WEAPON_SLOTS = {'head','chest','legs','hands','feet','cloak','ring1','ring2','amulet'}  # expected codes
    if req.slot_code not in ['weapon_main','weapon_off']:
        logger.info("Generic equip: user=%s slot=%s ui=%s", current_user.id, req.slot_code, req.user_item_id)
        srow = db.execute(text("SELECT id FROM equipment_slots WHERE code=:c"), {"c": req.slot_code}).mappings().first()
        if not srow:
            raise HTTPException(status_code=400, detail="Unknown slot_code")
        slot_id = srow['id']
        try:
            # always clear current slot
            db.execute(text("DELETE FROM user_equipment WHERE user_id=:uid AND slot_id=:sid"), {"uid": current_user.id, "sid": slot_id})
            # if it's an equip (not unequip) – insert new row
            if req.user_item_id is not None:
                db.execute(text("""
                    INSERT INTO user_equipment(user_id, slot_id, user_item_id, equipped_at)
                    VALUES (:uid, :sid, :ui, CURRENT_TIMESTAMP)
                    """), {"uid": current_user.id, "sid": slot_id, "ui": req.user_item_id})
            db.commit()
            recalc_base_stats(db, current_user.id)
            vital = db.execute(text("SELECT current_hp,max_hp,current_mp,max_mp,regen_ts FROM user_vital WHERE user_id=:uid"),{"uid":current_user.id}).mappings().first()
            stats = db.execute(text("SELECT strength,agility,power,intuition FROM user_base_stats WHERE user_id=:uid"),{"uid":current_user.id}).mappings().first()
            payload = {"status":"ok","action":"unequipped" if req.user_item_id is None else "equipped","slot":req.slot_code}
            if vital:
                payload.update({**dict(vital), "regen_ts": vital['regen_ts'] if 'regen_ts' in vital else None})
            if stats:
                payload.update({**dict(stats), "reason": 0})
            return payload
        except IntegrityError as e:
            logger.exception("Equip failed IntegrityError: statement=%s params=%s", getattr(e, 'statement', None), getattr(e, 'params', None))
            logger.error("IntegrityError generic equip: %s", getattr(e, 'orig', e))
            raise HTTPException(status_code=400, detail="Нельзя надеть этот предмет в выбранный слот")

    # ----------------- smart weapon equip logic -----------------
    logger.info("Equip request user=%s ui=%s slot_code=%s", current_user.id, req.user_item_id, req.slot_code)
    # Constants
    MAIN_CODE = 'weapon_main'
    OFF_CODE = 'weapon_off'

    # fetch slot ids
    slot_rows = db.execute(text("SELECT id, code FROM equipment_slots WHERE code IN ('weapon_main','weapon_off')")).mappings().all()
    slot_map = {r['code']: r['id'] for r in slot_rows}
    if len(slot_map) < 2:
        raise HTTPException(status_code=500, detail="Weapon slots misconfigured")

    # helper to clear slot
    def clear_slot(code: str):
        db.execute(
            text("UPDATE user_equipment SET user_item_id=NULL WHERE user_id=:uid AND slot_id=:sid"),
            {"uid": current_user.id, "sid": slot_map[code]},
        )

    # unequip scenario
    if req.user_item_id is None:
        if req.slot_code not in slot_map:
            raise HTTPException(status_code=400, detail="slot_code must be weapon_main or weapon_off when unequipping")
        clear_slot(req.slot_code)
        db.commit()
        return {"status": "ok", "cleared": req.slot_code}

    # ---- load equipping item data ----
    item_row = db.execute(
        text(
            """
            SELECT i.hand_type, i.two_handed, i.weapon_type_id
            FROM user_items ui
            JOIN items i ON i.id = ui.item_id
            WHERE ui.id = :ui AND ui.user_id = :uid
            """
        ),
        {"ui": req.user_item_id, "uid": current_user.id},
    ).mappings().first()

    if not item_row:
        raise HTTPException(status_code=404, detail="User item not found")

    hand_type = item_row['hand_type']  # LIGHT / HEAVY / NONE
    is_two_handed = bool(item_row['two_handed'])
    is_shield = item_row['weapon_type_id'] == 3

    # fetch current equipment state
    # Check if this exact user_item is already equipped
    dup_row = db.execute(text("SELECT slot_id FROM user_equipment WHERE user_id=:uid AND user_item_id=:ui"),{"uid":current_user.id,"ui":req.user_item_id}).mappings().first()
    if dup_row:
        # Already equipped, no need to equip again
        logger.info("User item %s already equipped in slot_id=%s", req.user_item_id, dup_row['slot_id'])
        return {"status":"already_equipped","slot_id":dup_row['slot_id']}

    # fetch current equipment state
    cur_rows = db.execute(
        text(
            """
            SELECT es.code, ui.id as user_item_id, it.two_handed
            FROM equipment_slots es
            LEFT JOIN user_equipment ue ON ue.slot_id = es.id AND ue.user_id = :uid
            LEFT JOIN user_items ui ON ui.id = ue.user_item_id
            LEFT JOIN items it ON it.id = ui.item_id
            WHERE es.code IN ('weapon_main','weapon_off')
            """
        ),
        {"uid": current_user.id},
    ).mappings().all()
    current = {r['code']: dict(r) for r in cur_rows}

    # If main currently holds 2H weapon, clear both before anything
    if current.get(MAIN_CODE) and current[MAIN_CODE]['two_handed']:
        clear_slot(MAIN_CODE)
        clear_slot(OFF_CODE)
        current[MAIN_CODE]['user_item_id'] = None
        if OFF_CODE in current:
            current[OFF_CODE]['user_item_id'] = None

    # decide target slot
    target_code = MAIN_CODE
    if is_two_handed:
        # must clear off hand
        clear_slot(OFF_CODE)
        target_code = MAIN_CODE
    elif is_shield:
        # shield всегда в левой руке (OFF_CODE). Убираем оружие из правой (MAIN_CODE)
        # убираем предмет (если был) из левой руки
        clear_slot(OFF_CODE)
        # правую руку оставляем как есть – она уже очищена выше только если там был 2-ручный меч
        target_code = OFF_CODE
    elif hand_type == 'HEAVY':
        target_code = MAIN_CODE
    else:  # LIGHT weapon
        if not current.get(MAIN_CODE) or current[MAIN_CODE]['user_item_id'] is None:
            target_code = MAIN_CODE
        else:
            target_code = OFF_CODE

    # upsert equip into chosen slot
    logger.info("Equip decision: target_code=%s slot_id=%s", target_code, slot_map[target_code])
    try:
        db.execute(
        text(
            """
            INSERT INTO user_equipment(user_id, slot_id, user_item_id, equipped_at)
            VALUES (:uid, :sid, :ui, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, slot_id)
            DO UPDATE SET user_item_id=excluded.user_item_id, equipped_at=CURRENT_TIMESTAMP
            """
        ),
        {"uid": current_user.id, "sid": slot_map[target_code], "ui": req.user_item_id},
    )
        db.commit()
        # recalc stats after equip
        recalc_base_stats(db, current_user.id)
        vital = db.execute(text("SELECT current_hp,max_hp,current_mp,max_mp,regen_ts FROM user_vital WHERE user_id=:uid"),{"uid":current_user.id}).mappings().first()
        stats = db.execute(text("SELECT strength,agility,power,intuition FROM user_base_stats WHERE user_id=:uid"),{"uid":current_user.id}).mappings().first()
        payload = {"status":"ok","equipped_in":target_code}
        if vital:
            payload.update({**dict(vital), "regen_ts": vital['regen_ts'] if 'regen_ts' in vital else None})
        if stats:
            payload.update({**dict(stats), "reason": 0})
        return payload
    except IntegrityError as e:
        logger.error("IntegrityError when equipping: %s", e.orig)
        raise HTTPException(status_code=400, detail="Нельзя надеть этот предмет в выбранный слот")
