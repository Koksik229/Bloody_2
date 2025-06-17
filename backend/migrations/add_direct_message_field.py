from sqlalchemy import text
from db import engine

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE chat_messages 
            ADD COLUMN is_direct_message BOOLEAN DEFAULT FALSE
        """))
        conn.commit()

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE chat_messages 
            DROP COLUMN is_direct_message
        """))
        conn.commit() 