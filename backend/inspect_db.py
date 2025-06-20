#!/usr/bin/env python
# inspect_db.py
import sqlite3, sys, pathlib, textwrap

def main(db_path: str) -> None:
    db_file = pathlib.Path(db_path)
    if not db_file.exists():
        print(f"Файл «{db_file}» не найден")
        return

    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    # Список таблиц
    tables = [t[0] for t in cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )]

    print("=== TABLES ===")
    for t in tables:
        print(t)

    print("\n=== SCHEMA ===")
    for t in tables:
        print(f"\n-- {t} --")
        for cid, name, ctype, notnull, dflt, pk in cur.execute(f"PRAGMA table_info('{t}')"):
            nn = "NOT NULL" if notnull else ""
            pk = "PK" if pk else ""
            print(f"{name:20} {ctype:10} {nn:8} {pk:2} default={dflt}")

    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python inspect_db.py path/to/db.sqlite3")
    else:
        main(sys.argv[1])