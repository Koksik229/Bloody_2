"""Utility to dump full SQLite DB and output table structures.

Creates two files in the backend directory:
  • dump.sql   — full SQL dump (schema + data)
  • tables.txt — list of tables with their columns (name, type, nullability, PK, default)

Usage (run from D:\Bloody\backend):

    # default DB file is db.sqlite3
    python dump_db.py

    # or specify another path
    python dump_db.py path\to\my.db
"""
import sys
import sqlite3
import pathlib

BASE_DIR = pathlib.Path(__file__).parent

# -------------- resolve db path -----------------
if len(sys.argv) >= 2:
    db_path = pathlib.Path(sys.argv[1])
else:
    db_path = BASE_DIR / 'db.sqlite3'  # CHANGE if your database filename differs

if not db_path.exists():
    sys.exit(f"DB file not found: {db_path}")

print(f"Using database: {db_path}")

# -------------- connect ------------------------
conn = sqlite3.connect(db_path)



# -------------- tables.txt (schema) ---------------------
tables_file = BASE_DIR / 'tables.txt'
print(f"Writing table structures to {tables_file} ...")
with tables_file.open('w', encoding='utf-8') as f_tab:
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    for (tbl_name,) in cur:
        f_tab.write(f"-- {tbl_name} --\n")
        col_cur = conn.execute(f"PRAGMA table_info('{tbl_name}')")
        # table_info returns: cid, name, type, notnull, dflt_value, pk
        for cid, col_name, col_type, notnull, dflt_value, pk in col_cur:
            nn = 'NOT NULL' if notnull else ''
            pk_flag = 'PK' if pk else ''
            default = f"default={dflt_value}" if dflt_value is not None else ''
            f_tab.write(f"{col_name:<20} {col_type:<10} {nn} {pk_flag} {default}\n")
        f_tab.write("\n")
print("Table structures completed.")

# -------------- data.txt (all rows) ---------------------
data_file = BASE_DIR / 'data.txt'
print(f"Writing table data to {data_file} ...")
with data_file.open('w', encoding='utf-8') as f_data:
    cur_tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    for (tbl_name,) in cur_tables:
        f_data.write(f"-- {tbl_name} --\n")
        # fetch column names
        col_cur = conn.execute(f"PRAGMA table_info('{tbl_name}')")
        cols = [row[1] for row in col_cur]
        header = " | ".join(cols)
        f_data.write(header + "\n")
        f_data.write("-" * len(header) + "\n")
        # fetch rows
        rows = conn.execute(f"SELECT * FROM {tbl_name}").fetchall()
        for row in rows:
            line = " | ".join(str(row[i]) for i in range(len(cols)))
            f_data.write(line + "\n")
        f_data.write("\n")
print("Data dump completed.")

conn.close()
