# -*- coding: utf-8 -*-
"""
cleanup_fk_orphans.py – финальный скрипт для удаления оставшихся
записей, нарушающих внешние ключи, из базы RPG.

Как запустить (из PowerShell / CMD):

    python cleanup_fk_orphans.py "Z:\backend\db.sqlite3"

Скрипт делает следующее:
1. Подключается к указанной БД (первый аргумент командной строки,
   либо по умолчанию db.sqlite3 в той же папке).
2. Удаляет строки user_equipment, у которых user_item_id отсутствует
   в user_items.
3. Удаляет строки wallet_transactions, у которых currency_id отсутствует
   в currencies.
4. Показывает, сколько строк удалено и итог проверки
   PRAGMA foreign_key_check / integrity_check.
Скрипт идемпотентен: повторный запуск не вызывает ошибок и ничего
лишнего не удаляет.
"""
import sys, sqlite3, datetime

def main(db_path: str):
    with sqlite3.connect(db_path) as con:
        cur = con.cursor()

        # Отключаем FK, чтобы можно было чистить свободно
        cur.execute("PRAGMA foreign_keys = OFF")

        # если осталась временная таблица _ui – удалим её
        cur.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='_ui' LIMIT 1"
        )
        if cur.fetchone():
            print("drop temp table _ui")
            cur.execute("DROP TABLE _ui")

        # --- user_equipment: удаляем строки, нарушающие FK ---
        ue_del = cur.execute(
            """
            DELETE FROM user_equipment
                  WHERE rowid IN (
                        SELECT ue.rowid
                        FROM   user_equipment ue
                        LEFT   JOIN user_items ui ON ui.id = ue.user_item_id
                        WHERE  ue.user_item_id IS NOT NULL
                          AND  ui.id IS NULL
                  )
            """
        ).rowcount

        # --- wallet_transactions: удаляем неверные валюты ---
        wt_del = cur.execute(
            """
            DELETE FROM wallet_transactions
            WHERE currency_id NOT IN (SELECT id FROM currencies)
            """
        ).rowcount

        con.commit()

        # Включаем FK обратно и проверяем
        cur.execute("PRAGMA foreign_keys = ON")
        fk_errors = list(cur.execute("PRAGMA foreign_key_check"))
        integrity = cur.execute("PRAGMA integrity_check").fetchone()[0]

        print("\n=== cleanup_fk_orphans.py report ===")
        print(f"user_equipment deleted : {ue_del}")
        print(f"wallet_transactions deleted : {wt_del}")
        print("foreign_key_check :", "OK" if not fk_errors else fk_errors)
        print("integrity_check   :", integrity)
        print("done   :", datetime.datetime.now().isoformat(" ", "seconds"))
        # Final checks
        fk_errors = list(cur.execute("PRAGMA foreign_key_check"))
        integrity = cur.execute("PRAGMA integrity_check").fetchone()[0]

        print("\n=== cleanup_fk_orphans.py report ===")
        print(f"deleted from user_equipment : {ue_del}")
        print(f"deleted from wallet_transactions : {wt_del}")
        print("foreign_key_check :", "OK" if not fk_errors else fk_errors)
        print("integrity_check   :", integrity)
        print("done   :", datetime.datetime.now().isoformat(" ", "seconds"))

if __name__ == "__main__":
    db = sys.argv[1] if len(sys.argv) > 1 else "db.sqlite3"
    main(db)
