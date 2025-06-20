#!/usr/bin/env python
# dump_db.py
import sqlite3, sys, json, pathlib

def dump(db_path: str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    tables = [t[0] for t in cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )]

    print("=== TABLES & DATA ===")
    for t in tables:
        print(f"\n-- {t} --")

        # схема
        for cid, name, ctype, notnull, dflt, pk in cur.execute(f"PRAGMA table_info('{t}')"):
            nn = "NOT NULL" if notnull else ""
            pk = "PK" if pk else ""
            print(f"{name:20} {ctype:10} {nn:8} {pk:2} default={dflt}")

        # данные
        rows = cur.execute(f"SELECT * FROM '{t}'").fetchall()
        if not rows:
            print("  (empty)")
            continue

        print(f"  rows: {len(rows)}")
        for row in rows:
            print("  ", json.dumps(dict(row), ensure_ascii=False))

    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python dump_db.py path/to/db.sqlite3")
    else:
        db_file = pathlib.Path(sys.argv[1])
        if not db_file.exists():
            print(f"Файл «{db_file}» не найден")
            sys.exit(1)
        dump(str(db_file))