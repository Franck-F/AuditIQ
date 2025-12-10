"""Add Auto EDA tables

Revision ID: auto_eda_001
Revises: 
Create Date: 2025-12-09

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'auto_eda_001'
down_revision = None  # Update this to your latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Create eda_data_sources table
    op.create_table(
        'eda_data_sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('source_type', sa.String(), nullable=False),
        sa.Column('connection_config', sa.JSON(), nullable=True),
        sa.Column('ingestion_schedule', sa.String(), nullable=True, server_default='daily'),
        sa.Column('last_ingestion', sa.DateTime(), nullable=True),
        sa.Column('next_ingestion', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_eda_data_sources_id'), 'eda_data_sources', ['id'], unique=False)
    
    # Create eda_analyses table
    op.create_table(
        'eda_analyses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('data_source_id', sa.Integer(), nullable=False),
        sa.Column('analysis_date', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='pending'),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('metrics_config', sa.JSON(), nullable=True),
        sa.Column('dimensions_config', sa.JSON(), nullable=True),
        sa.Column('confidence_level', sa.Float(), nullable=True, server_default='0.95'),
        sa.Column('summary_stats', sa.JSON(), nullable=True),
        sa.Column('top_anomalies', sa.JSON(), nullable=True),
        sa.Column('all_findings_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('alerts_sent', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('alert_channels', sa.JSON(), nullable=True),
        sa.Column('alert_sent_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['data_source_id'], ['eda_data_sources.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_eda_analyses_id'), 'eda_analyses', ['id'], unique=False)
    
    # Create eda_anomaly_findings table
    op.create_table(
        'eda_anomaly_findings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('analysis_id', sa.Integer(), nullable=False),
        sa.Column('metric_name', sa.String(), nullable=False),
        sa.Column('dimension', sa.String(), nullable=True),
        sa.Column('dimension_value', sa.String(), nullable=True),
        sa.Column('observed_value', sa.Float(), nullable=False),
        sa.Column('expected_value', sa.Float(), nullable=False),
        sa.Column('deviation_std', sa.Float(), nullable=True),
        sa.Column('p_value', sa.Float(), nullable=True),
        sa.Column('confidence_interval_lower', sa.Float(), nullable=True),
        sa.Column('confidence_interval_upper', sa.Float(), nullable=True),
        sa.Column('business_impact', sa.Float(), nullable=True),
        sa.Column('severity', sa.String(), nullable=True),
        sa.Column('probable_root_cause', sa.String(), nullable=True),
        sa.Column('cause_confidence', sa.Float(), nullable=True),
        sa.Column('correlated_factors', sa.JSON(), nullable=True),
        sa.Column('detected_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('is_false_positive', sa.Boolean(), nullable=True, server_default='false'),
        sa.ForeignKeyConstraint(['analysis_id'], ['eda_analyses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_eda_anomaly_findings_id'), 'eda_anomaly_findings', ['id'], unique=False)
    
    # Create eda_fairness_links table (optional bridge)
    op.create_table(
        'eda_fairness_links',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('eda_analysis_id', sa.Integer(), nullable=False),
        sa.Column('fairness_audit_id', sa.Integer(), nullable=False),
        sa.Column('link_type', sa.String(), nullable=True, server_default='cross_reference'),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['eda_analysis_id'], ['eda_analyses.id'], ),
        sa.ForeignKeyConstraint(['fairness_audit_id'], ['audits.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_eda_fairness_links_id'), 'eda_fairness_links', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_eda_fairness_links_id'), table_name='eda_fairness_links')
    op.drop_table('eda_fairness_links')
    op.drop_index(op.f('ix_eda_anomaly_findings_id'), table_name='eda_anomaly_findings')
    op.drop_table('eda_anomaly_findings')
    op.drop_index(op.f('ix_eda_analyses_id'), table_name='eda_analyses')
    op.drop_table('eda_analyses')
    op.drop_index(op.f('ix_eda_data_sources_id'), table_name='eda_data_sources')
    op.drop_table('eda_data_sources')
