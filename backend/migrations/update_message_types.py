"""update message types

Revision ID: update_message_types
Revises: add_direct_message_field
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_message_types'
down_revision = 'add_direct_message_field'
branch_labels = None
depends_on = None

def upgrade():
    # Создаем временную колонку
    op.add_column('chat_messages', sa.Column('message_type_new', sa.String(), nullable=True))
    
    # Обновляем значения
    op.execute("""
        UPDATE chat_messages 
        SET message_type_new = CASE 
            WHEN message_type = 'GLOBAL' THEN 'CHAT'
            WHEN message_type = 'DIRECT' THEN 'CHAT'
            ELSE message_type::text
        END
    """)
    
    # Удаляем старую колонку
    op.drop_column('chat_messages', 'message_type')
    
    # Переименовываем новую колонку
    op.alter_column('chat_messages', 'message_type_new', new_column_name='message_type')
    
    # Создаем enum тип
    message_type = postgresql.ENUM('CHAT', 'PRIVATE', 'SYSTEM', name='messagetype')
    message_type.create(op.get_bind())
    
    # Изменяем тип колонки на enum
    op.alter_column('chat_messages', 'message_type',
                    type_=message_type,
                    postgresql_using="message_type::messagetype")

def downgrade():
    # Создаем временную колонку
    op.add_column('chat_messages', sa.Column('message_type_old', sa.String(), nullable=True))
    
    # Обновляем значения
    op.execute("""
        UPDATE chat_messages 
        SET message_type_old = CASE 
            WHEN message_type = 'CHAT' THEN 'GLOBAL'
            ELSE message_type::text
        END
    """)
    
    # Удаляем enum тип
    op.execute('DROP TYPE messagetype')
    
    # Удаляем старую колонку
    op.drop_column('chat_messages', 'message_type')
    
    # Переименовываем новую колонку
    op.alter_column('chat_messages', 'message_type_old', new_column_name='message_type') 