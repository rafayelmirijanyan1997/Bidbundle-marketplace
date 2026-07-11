"""users_service_interests

Revision ID: b2d8e6f1a9c3
Revises: a1c9f47d0b2e
Create Date: 2026-07-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b2d8e6f1a9c3'
down_revision: Union[str, None] = 'a1c9f47d0b2e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    columns = {c["name"] for c in sa.inspect(bind).get_columns("users")}
    if "service_interests" not in columns:
        op.add_column("users", sa.Column("service_interests", sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    columns = {c["name"] for c in sa.inspect(bind).get_columns("users")}
    if "service_interests" in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.drop_column("service_interests")
