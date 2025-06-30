# -*- coding: utf-8 -*-
"""
Idempotent FK / UNIQUE migration for RPG SQLite database.
Usage:
    python migrate_fk.py "Z:\\backend\\db.sqlite3"
"""

import sys, sqlite3, textwrap, datetime

DB = sys.argv[1] if len(sys.argv) > 1 else "db.sqlite3"

def col_names(cur, table) -> list[str]:
    cur.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in cur.fetchall()]

def table_exists(cur, name) -> bool:
    cur.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=? LIMIT 1", (name,)
    )
    return cur.fetchone() is not None

def rename_if_needed(cur, src, dst):
    if table_exists(cur, dst):
        return
    if table_exists(cur, src):
        cur.execute(f"ALTER TABLE {src} RENAME TO {dst}")

with sqlite3.connect(DB) as conn:
    c = conn.cursor()
    c.execute("PRAGMA foreign_keys = OFF")

    # -------------------------------------------------------------
    # user_items
    # -------------------------------------------------------------
    print("[ user_items ]")
    rename_if_needed(c, "user_items", "_ui")
    if table_exists(c, "_ui"):
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS user_items(
                id       INTEGER PRIMARY KEY,
                user_id  INTEGER NOT NULL,
                item_id  INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                UNIQUE(user_id,item_id),
                FOREIGN KEY(user_id) REFERENCES users(id)  ON DELETE CASCADE,
                FOREIGN KEY(item_id) REFERENCES items(id)  ON DELETE RESTRICT
            );
        """
        )
        c.execute(
            """
            INSERT OR IGNORE INTO user_items(id,user_id,item_id,quantity)
            SELECT MIN(id),user_id,item_id,SUM(quantity)
            FROM _ui
            GROUP BY user_id,item_id
            """
        )
        c.execute("DROP TABLE _ui")
        print("  fixed ✓")

    # -------------------------------------------------------------
    # user_equipment  (slot_id → slot_code при необходимости)
    # -------------------------------------------------------------
    print("[ user_equipment ]")
    rename_if_needed(c, "user_equipment", "_ue")
    if table_exists(c, "_ue"):
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS user_equipment(
                user_id      INTEGER NOT NULL,
                slot_code    TEXT    NOT NULL,
                user_item_id INTEGER,
                equipped_at  TEXT DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, slot_code),
                FOREIGN KEY (user_id)      REFERENCES users(id)            ON DELETE CASCADE,
                FOREIGN KEY (slot_code)    REFERENCES equipment_slots(code)ON DELETE RESTRICT,
                FOREIGN KEY (user_item_id) REFERENCES user_items(id)       ON DELETE SET NULL
            );
            """
        )
        cols = col_names(c, "_ue")
        inserted = 0
        has_code  = "slot_code" in cols
        has_slot  = "slot_id"   in cols
        has_time  = "equipped_at" in cols

        if has_code:
            base = "SELECT user_id, slot_code, user_item_id{} FROM _ue".format(
                ", equipped_at" if has_time else ""
            )
            for row in c.execute(base):
                user_id, code, ui_id, *ts = row
                if has_time and ts:
                    c.execute(
                        """INSERT OR IGNORE INTO user_equipment
                           (user_id, slot_code, user_item_id, equipped_at)
                           VALUES (?,?,?,?)""",
                        (user_id, code, ui_id, ts[0]),
                    )
                else:
                    c.execute(
                        """INSERT OR IGNORE INTO user_equipment
                           (user_id, slot_code, user_item_id)
                           VALUES (?,?,?)""",
                        (user_id, code, ui_id),
                    )
                inserted += c.rowcount

        elif has_slot:
            slot_map = dict(c.execute("SELECT id, code FROM equipment_slots"))
            base = "SELECT user_id, slot_id, user_item_id{} FROM _ue".format(
                ", equipped_at" if has_time else ""
            )
            for row in c.execute(base):
                user_id, slot_id, ui_id, *ts = row
                code = slot_map.get(slot_id)
                if not code:
                    continue
                if has_time and ts:
                    c.execute(
                        """INSERT OR IGNORE INTO user_equipment
                           (user_id, slot_code, user_item_id, equipped_at)
                           VALUES (?,?,?,?)""",
                        (user_id, code, ui_id, ts[0]),
                    )
                else:
                    c.execute(
                        """INSERT OR IGNORE INTO user_equipment
                           (user_id, slot_code, user_item_id)
                           VALUES (?,?,?)""",
                        (user_id, code, ui_id),
                    )
                inserted += c.rowcount
        c.execute("DROP TABLE _ue")
        print(f"  moved {inserted} rows ✓")

    # -------------------------------------------------------------
    # item_effects
    # -------------------------------------------------------------
    print("[ item_effects ]")
    rename_if_needed(c, "item_effects", "_ie")
    if table_exists(c, "_ie"):
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS item_effects(
                item_id INTEGER NOT NULL,
                stat    TEXT    NOT NULL,
                amount  INTEGER NOT NULL,
                PRIMARY KEY (item_id, stat),
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
            );
            INSERT OR IGNORE INTO item_effects SELECT * FROM _ie;
            DROP TABLE _ie;
            """
        )
        print("  fixed ✓")

    # -------------------------------------------------------------
    # wallet_transactions
    # -------------------------------------------------------------
    print("[ wallet_transactions ]")
    rename_if_needed(c, "wallet_transactions", "_wt")
    if table_exists(c, "_wt"):
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS wallet_transactions(
                id INTEGER PRIMARY KEY,
                user_id     INTEGER NOT NULL,
                currency_id INTEGER NOT NULL,
                delta       INTEGER NOT NULL,
                reason      TEXT    NOT NULL,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
                FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT
            );
            INSERT OR IGNORE INTO wallet_transactions
              SELECT * FROM _wt WHERE user_id IN (SELECT id FROM users);
            DROP TABLE _wt;
            """
        )
        print("  fixed ✓")

    # -------------------------------------------------------------
    # user_professional_skill
    # -------------------------------------------------------------
    print("[ user_professional_skill ]")
    rename_if_needed(c, "user_professional_skill", "_ups")
    if table_exists(c, "_ups"):
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS user_professional_skill(
                id INTEGER PRIMARY KEY,
                user_id  INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                current_xp INTEGER DEFAULT 0,
                level      INTEGER DEFAULT 0,
                UNIQUE(user_id, skill_id),
                FOREIGN KEY (user_id)  REFERENCES users(id)              ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES professional_skill(id) ON DELETE RESTRICT
            );
            INSERT OR IGNORE INTO user_professional_skill
              SELECT MIN(id), user_id, skill_id, MAX(current_xp), MAX(level)
              FROM _ups GROUP BY user_id, skill_id;
            DROP TABLE _ups;
            """
        )
        print("  fixed ✓")

    # -------------------------------------------------------------
    # финальная проверка и выход
    # -------------------------------------------------------------
    c.execute("PRAGMA foreign_keys = ON")
    fk_errors = list(c.execute("PRAGMA foreign_key_check"))
    integrity = c.execute("PRAGMA integrity_check").fetchone()[0]

    print("\nForeign-key check:", "OK" if not fk_errors else fk_errors[:5])
    print("Integrity check  :", integrity)
    conn.commit()

print("\nDone at", datetime.datetime.now().isoformat(" ", "seconds"))