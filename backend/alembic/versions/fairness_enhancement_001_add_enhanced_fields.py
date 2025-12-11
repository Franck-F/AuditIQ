"""
Add enhanced fairness fields to audits table

Revision ID: fairness_enhancement_001
Revises: 
Create Date: 2025-12-10
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON


# revision identifiers
revision = 'fairness_enhancement_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add new columns for enhanced fairness features"""
    
    # Add new JSON columns for detailed metrics
    op.add_column('audits', sa.Column('detailed_metrics', JSON, nullable=True))
    op.add_column('audits', sa.Column('ai_recommendations', JSON, nullable=True))
    op.add_column('audits', sa.Column('mitigation_recommendations', JSON, nullable=True))
    op.add_column('audits', sa.Column('mitigation_results', JSON, nullable=True))
    op.add_column('audits', sa.Column('disaggregated_metrics', JSON, nullable=True))
    op.add_column('audits', sa.Column('group_metrics', JSON, nullable=True))
    
    # Add configuration columns
    op.add_column('audits', sa.Column('prediction_column', sa.String, nullable=True))
    op.add_column('audits', sa.Column('probability_column', sa.String, nullable=True))
    op.add_column('audits', sa.Column('domain', sa.String, nullable=True))


def downgrade():
    """Remove enhanced fairness columns"""
    
    op.drop_column('audits', 'detailed_metrics')
    op.drop_column('audits', 'ai_recommendations')
    op.drop_column('audits', 'mitigation_recommendations')
    op.drop_column('audits', 'mitigation_results')
    op.drop_column('audits', 'disaggregated_metrics')
    op.drop_column('audits', 'group_metrics')
    op.drop_column('audits', 'prediction_column')
    op.drop_column('audits', 'probability_column')
    op.drop_column('audits', 'domain')
