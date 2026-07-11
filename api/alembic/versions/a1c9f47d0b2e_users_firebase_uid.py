"""users_firebase_uid

Revision ID: a1c9f47d0b2e
Revises: f4a8b2c1d3e5
Create Date: 2026-07-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1c9f47d0b2e'
down_revision: Union[str, None] = 'f4a8b2c1d3e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the existing partial unique index first (if present) — Alembic's
    # SQLite batch mode renames the column in an index's column list but not
    # inside a raw partial-index WHERE clause, so recreating it verbatim fails.
    bind = op.get_bind()
    existing = {ix["name"] for ix in sa.inspect(bind).get_indexes("users")}
    if "ix_users_supabase_uid" in existing:
        op.drop_index("ix_users_supabase_uid", table_name="users")

    columns = {c["name"] for c in sa.inspect(bind).get_columns("users")}
    if "supabase_uid" in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column("supabase_uid", new_column_name="firebase_uid", existing_type=sa.String())

    existing = {ix["name"] for ix in sa.inspect(bind).get_indexes("users")}
    if "ix_users_firebase_uid" not in existing:
        op.create_index(
            "ix_users_firebase_uid", "users", ["firebase_uid"], unique=True,
            sqlite_where=sa.text("firebase_uid IS NOT NULL"),
            postgresql_where=sa.text("firebase_uid IS NOT NULL"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    existing = {ix["name"] for ix in sa.inspect(bind).get_indexes("users")}
    if "ix_users_firebase_uid" in existing:
        op.drop_index("ix_users_firebase_uid", table_name="users")

    columns = {c["name"] for c in sa.inspect(bind).get_columns("users")}
    if "firebase_uid" in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column("firebase_uid", new_column_name="supabase_uid", existing_type=sa.String())

    existing = {ix["name"] for ix in sa.inspect(bind).get_indexes("users")}
    if "ix_users_supabase_uid" not in existing:
        op.create_index(
            "ix_users_supabase_uid", "users", ["supabase_uid"], unique=True,
            sqlite_where=sa.text("supabase_uid IS NOT NULL"),
            postgresql_where=sa.text("supabase_uid IS NOT NULL"),
        )
