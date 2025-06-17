from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('is_online', sa.Boolean(), nullable=False, server_default='false'))

def downgrade():
    op.drop_column('users', 'is_online') 