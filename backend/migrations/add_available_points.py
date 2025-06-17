from sqlalchemy import text
from db import engine

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN available_attribute_points INTEGER DEFAULT 5,
            ADD COLUMN available_skill_points INTEGER DEFAULT 2
        """))
        conn.commit()

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE users 
            DROP COLUMN available_attribute_points,
            DROP COLUMN available_skill_points
        """))
        conn.commit() 