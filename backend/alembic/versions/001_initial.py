"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('username', sa.String(64), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_banned', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_shadow_banned', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('locale', sa.String(8), server_default='ru'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

    op.create_table('auth_identities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('provider', sa.String(20), nullable=False),
        sa.Column('provider_user_id', sa.String(128), nullable=False),
        sa.Column('provider_data', postgresql.JSONB(), nullable=True),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider', 'provider_user_id', name='uq_auth_provider'),
    )

    op.create_table('plans',
        sa.Column('id', sa.String(32), nullable=False),
        sa.Column('name', sa.String(64), nullable=False),
        sa.Column('price_rub_month', sa.Integer(), nullable=False),
        sa.Column('credits_monthly', sa.Integer(), nullable=False),
        sa.Column('credits_daily_limit', sa.Integer(), nullable=True),
        sa.Column('max_file_size_mb', sa.Integer(), server_default='10'),
        sa.Column('max_context_msgs', sa.Integer(), server_default='10'),
        sa.Column('max_documents', sa.Integer(), server_default='0'),
        sa.Column('features', postgresql.JSONB(), server_default='{}'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plan_id', sa.String(32), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='active'),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('payment_ref', sa.String(128), nullable=True),
        sa.Column('auto_renew', sa.Boolean(), server_default='true'),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['plan_id'], ['plans.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('credits_wallet',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('balance', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('bonus_balance', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('monthly_quota', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('monthly_quota_used', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('daily_used', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('daily_reset_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('monthly_reset_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id'),
    )

    op.create_table('credits_ledger',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.BigInteger(), nullable=False),
        sa.Column('balance_after', sa.BigInteger(), nullable=False),
        sa.Column('operation', sa.String(32), nullable=False),
        sa.Column('ref_type', sa.String(32), nullable=True),
        sa.Column('ref_id', sa.String(128), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('jti', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source', sa.String(20), server_default='web'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('jti'),
    )

    op.create_table('modes',
        sa.Column('id', sa.String(64), nullable=False),
        sa.Column('title', sa.String(128), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(64), nullable=False),
        sa.Column('icon_emoji', sa.String(8), nullable=True),
        sa.Column('system_prompt', sa.Text(), nullable=False),
        sa.Column('model_policy', postgresql.JSONB(), nullable=False),
        sa.Column('price_policy', postgresql.JSONB(), nullable=False),
        sa.Column('min_plan', sa.String(32), server_default='free'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('mode_id', sa.String(64), nullable=False),
        sa.Column('role', sa.String(12), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_type', sa.String(20), server_default='text'),
        sa.Column('metadata', postgresql.JSONB(), server_default='{}'),
        sa.Column('credits_charged', sa.Integer(), server_default='0'),
        sa.Column('source', sa.String(20), server_default='web'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mode_id'], ['modes.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('provider_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('request_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('mode_id', sa.String(64), nullable=False),
        sa.Column('source', sa.String(20), nullable=False),
        sa.Column('provider', sa.String(32), nullable=False),
        sa.Column('model', sa.String(64), nullable=False),
        sa.Column('tokens_in', sa.Integer(), server_default='0'),
        sa.Column('tokens_out', sa.Integer(), server_default='0'),
        sa.Column('cost_usd_estimated', sa.Numeric(10, 6), server_default='0'),
        sa.Column('credits_charged', sa.Integer(), server_default='0'),
        sa.Column('latency_ms', sa.Integer(), server_default='0'),
        sa.Column('status', sa.String(20), server_default='success'),
        sa.Column('error_code', sa.String(32), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('file_type', sa.String(32), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('chunk_count', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('document_chunks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('doc_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('embedding_json', postgresql.JSONB(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), server_default='{}'),
        sa.ForeignKeyConstraint(['doc_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('provider', sa.String(32), nullable=False),
        sa.Column('external_id', sa.String(255), nullable=False),
        sa.Column('amount_rub', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('purpose', sa.String(32), nullable=False),
        sa.Column('payload', postgresql.JSONB(), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('external_id'),
    )

    op.create_table('bans',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ban_type', sa.String(20), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('banned_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # Indexes
    op.create_index('idx_auth_user_id', 'auth_identities', ['user_id'])
    op.create_index('idx_subs_user_id', 'subscriptions', ['user_id'])
    op.create_index('idx_subs_expires', 'subscriptions', ['expires_at'])
    op.create_index('idx_subs_status', 'subscriptions', ['status'])
    op.create_index('idx_ledger_user', 'credits_ledger', ['user_id'])
    op.create_index('idx_ledger_created', 'credits_ledger', ['created_at'])
    op.create_index('idx_messages_user_mode', 'messages', ['user_id', 'mode_id', 'created_at'])
    op.create_index('idx_pr_user', 'provider_requests', ['user_id'])
    op.create_index('idx_pr_created', 'provider_requests', ['created_at'])
    op.create_index('idx_pr_request_id', 'provider_requests', ['request_id'])
    op.create_index('idx_docs_user', 'documents', ['user_id'])
    op.create_index('idx_chunks_doc', 'document_chunks', ['doc_id'])
    op.create_index('idx_sessions_user', 'sessions', ['user_id'])
    op.create_index('idx_sessions_expires', 'sessions', ['expires_at'])


def downgrade() -> None:
    op.drop_table('bans')
    op.drop_table('payments')
    op.drop_table('document_chunks')
    op.drop_table('documents')
    op.drop_table('provider_requests')
    op.drop_table('messages')
    op.drop_table('modes')
    op.drop_table('sessions')
    op.drop_table('credits_ledger')
    op.drop_table('credits_wallet')
    op.drop_table('subscriptions')
    op.drop_table('plans')
    op.drop_table('auth_identities')
    op.drop_table('users')
