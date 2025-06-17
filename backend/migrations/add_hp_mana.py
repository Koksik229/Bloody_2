from sqlalchemy import text
from db import engine

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN hp INTEGER DEFAULT 100,
            ADD COLUMN mana INTEGER DEFAULT 50
        """))
        conn.commit()

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE users 
            DROP COLUMN hp,
            DROP COLUMN mana
        """))
        conn.commit() 