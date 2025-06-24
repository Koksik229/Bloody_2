import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth import get_current_user  # root auth module
from models.user import User
from db import get_db
from schemas.inventory import ItemCategory, ItemGroup  # reuse existing schemas
from schemas.shop import ShopItem

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shop", tags=["shop"])


@router.get("/categories", response_model=List[ItemCategory])
async def get_shop_categories(db: Session = Depends(get_db)) -> List[ItemCategory]:
    """Return categories -> groups that have at least one sellable item."""
    rows = db.execute(
        text(
            """
            SELECT ic.id  AS cat_id,
                   ic.code AS cat_code,
                   ic.name_ru AS cat_name,
                   ig.id  AS grp_id,
                   ig.code AS grp_code,
                   ig.name_ru AS grp_name
            FROM item_groups ig
            JOIN item_categories ic ON ic.id = ig.category_id
            WHERE EXISTS (SELECT 1 FROM items it WHERE it.group_id = ig.id AND it.sellable = 1)
            ORDER BY ic.id, ig.id
            """
        )
    ).mappings().all()

    categories: List[ItemCategory] = []
    cat_map = {}
    grp_map = {}

    for r in rows:
        cid = r["cat_id"]
        if cid not in cat_map:
            cat = ItemCategory(id=cid, code=r["cat_code"], name=r["cat_name"], groups=[])
            cat_map[cid] = cat
            categories.append(cat)
        gid = r["grp_id"]
        if gid not in grp_map:
            grp = ItemGroup(id=gid, code=r["grp_code"], name=r["grp_name"], items=[])
            grp_map[gid] = grp
            cat_map[cid].groups.append(grp)

    return categories


@router.get("/items/{group_code}", response_model=List[ShopItem])
async def get_shop_items(group_code: str, db: Session = Depends(get_db)):
    """List sellable items for a given group code"""
    from schemas.shop import ShopItem  # local import to avoid circular
    rows = db.execute(
        text(
            """
            SELECT it.id, it.name AS name, it.icon, it.price_copper, it.min_level,
                   CAST(json_extract(it.base_stats_json,'$.dmg_min') AS INT) AS min_damage,
                   CAST(json_extract(it.base_stats_json,'$.dmg_max') AS INT) AS max_damage,
                   COALESCE(SUM(CASE WHEN ie.stat='strength' THEN ie.amount END),0) AS str_bonus,
                   COALESCE(SUM(CASE WHEN ie.stat='agility' THEN ie.amount END),0) AS agi_bonus,
                   COALESCE(SUM(CASE WHEN ie.stat='intuition' THEN ie.amount END),0) AS int_bonus,
                   it.max_durability
            FROM items it
            JOIN item_groups ig ON ig.id = it.group_id
            JOIN item_effects ie ON ie.item_id = it.id
            WHERE ig.code = :grp AND it.sellable = 1
            GROUP BY it.id, it.name, it.icon, it.price_copper, it.min_level, it.base_stats_json, it.max_durability
            ORDER BY it.min_level, it.name
            """
        ), {"grp": group_code}
    ).mappings().all()
    return [ShopItem(**r) for r in rows]


@router.post("/buy")
async def buy_item(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Покупка 1 шт. предмета по id. Body: {"item_id":int}"""
    item_id = data.get("item_id")
    if not item_id:
        raise HTTPException(status_code=400, detail="item_id required")
    # fetch item
    row = db.execute(text("SELECT id, price_copper, stackable, max_durability FROM items WHERE id=:iid AND sellable=1"), {"iid": item_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found or not sellable")
    from services.wallet_service import WalletService
    ws = WalletService(db)
    if not ws.consume(current_user, row["price_copper"], reason="shop_buy"):
        raise HTTPException(status_code=400, detail="Недостаточно средств")
        # --- add item to user inventory ---
    if row["stackable"]:
        upd = db.execute(text("""
            UPDATE user_items
            SET quantity = quantity + 1
            WHERE user_id = :uid AND item_id = :it
        """), {"uid": current_user.id, "it": row["id"]})
        if upd.rowcount == 0:
            db.execute(text("""
                INSERT INTO user_items (user_id, item_id, quantity, durability_cur, durability_max, enhance_level)
                VALUES (:uid, :it, 1, 0, :dur, 0)
            """), {"uid": current_user.id, "it": row["id"], "dur": row["max_durability"] or 0})
    else:
        db.execute(text("""
            INSERT INTO user_items (user_id, item_id, quantity, durability_cur, durability_max, enhance_level)
            VALUES (:uid, :it, 1, 0, :dur, 0)
        """), {"uid": current_user.id, "it": row["id"], "dur": row["max_durability"] or 0})
    db.commit()
    return {"ok": True, "new_balance_copper": ws.get_total_in_copper(current_user)}
