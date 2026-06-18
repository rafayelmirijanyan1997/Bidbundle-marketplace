"""users_hashed_password_nullable

Revision ID: f4a8b2c1d3e5
Revises: e2f3a4b5c6d7
Create Date: 2026-06-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4a8b2c1d3e5'
down_revision: Union[str, None] = 'e2f3a4b5c6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('hashed_password', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('hashed_password', existing_type=sa.String(), nullable=False)
