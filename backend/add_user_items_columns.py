# -*- coding: utf-8 -*-
"""
Добавляет отсутствующие колонки durability_cur, durability_max, enhance_level
в таблицу user_items, если их ещё нет.

Запуск:  python add_user_items_columns.py "Z:\backend\db.sqlite3"
"""
import sys, sqlite3, datetime

def column_exists(cur, table, col):
    cur.execute(f"PRAGMA table_info({table})")
    return any(row[1] == col for row in cur.fetchall())

def main(db):
    with sqlite3.connect(db) as con:
        cur = con.cursor()
        for col, col_def in [
            ("durability_cur", "INTEGER DEFAULT 0"),
            ("durability_max", "INTEGER DEFAULT 0"),
            ("enhance_level", "INTEGER DEFAULT 0"),
        ]:
            if not column_exists(cur, "user_items", col):
                print("adding column", col)
                cur.execute(f"ALTER TABLE user_items ADD COLUMN {col} {col_def}")
        con.commit()
        print("done", datetime.datetime.now().isoformat(" ", "seconds"))

if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else "db.sqlite3"
    main(db_path)
