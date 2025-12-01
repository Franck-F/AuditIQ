"""Add profile fields

Revision ID: 0002
Revises: 0001
Create Date: 2025-11-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to users table
    op.add_column('users', sa.Column('siret', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company_address', sa.String(), nullable=True))
    op.add_column('users', sa.Column('dpo_contact', sa.String(), nullable=True))
    op.add_column('users', sa.Column('plan', sa.String(), nullable=False, server_default='freemium'))
    op.add_column('users', sa.Column('onboarding_completed', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('use_case', sa.String(), nullable=True))


def downgrade():
    # Remove columns if needed
    op.drop_column('users', 'use_case')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'plan')
    op.drop_column('users', 'dpo_contact')
    op.drop_column('users', 'company_address')
    op.drop_column('users', 'siret')
