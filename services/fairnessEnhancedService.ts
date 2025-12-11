/**
 * Enhanced Fairness Service - Frontend API Client
 * 
 * Provides methods to interact with the enhanced fairness endpoints
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DetailedMetrics {
  overall_metrics: Record<string, number>;
  fairness_scores: Record<string, number>;
  disaggregated_metrics: Record<string, any>;
  group_metrics: Record<string, any>;
  risk_assessment: {
    risk_level: string;
    risk_score: number;
    risk_factors: string[];
    total_violations: number;
    requires_immediate_action: boolean;
  };
}

export interface AIRecommendations {
  severity: string;
  overall_assessment: string;
  problematic_metrics: string[];
  affected_groups: string[];
  root_causes: Array<{
    cause: string;
    likelihood: string;
    description: string;
  }>;
  mitigation_strategies: Array<{
    name: string;
    type: string;
    description: string;
    expected_impact: string;
    complexity: string;
    timeline: string;
    steps?: string[];
  }>;
  immediate_actions: Array<{
    action: string;
    steps: string[];
    impact: string;
  }>;
  long_term_improvements?: Array<{
    improvement: string;
    rationale: string;
    timeline: string;
  }>;
  compliance: {
    ai_act_status: string;
    gdpr_status: string;
    required_documentation: string[];
  };
  metrics_explanations?: Record<string, {
    value: number;
    interpretation: string;
    target: string;
    status: string;
  }>;
}

export interface MitigationResult {
  strategy_name: string;
  metrics_before: Record<string, number>;
  metrics_after: Record<string, number>;
  improvement: {
    detailed: Record<string, any>;
    summary: {
      metrics_improved: number;
      total_metrics: number;
      improvement_rate: number;
    };
  };
  recommendation: string;
}

export interface GroupComparison {
  audit_id: number;
  group_analysis: Record<string, {
    groups: Record<string, any>;
    best_performing: {
      group: string;
      accuracy: number;
    };
    worst_performing: {
      group: string;
      accuracy: number;
    };
    disparity: number;
    disparity_percentage: number;
  }>;
}

class FairnessEnhancedService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get detailed fairness metrics for an audit
   */
  async getDetailedMetrics(auditId: number): Promise<DetailedMetrics> {
    const response = await axios.get(
      `${API_URL}/api/audits/enhanced/${auditId}/metrics/detailed`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get AI-powered recommendations
   */
  async getAIRecommendations(auditId: number): Promise<AIRecommendations> {
    const response = await axios.get(
      `${API_URL}/api/audits/enhanced/${auditId}/recommendations/ai`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Apply a mitigation strategy
   */
  async applyMitigation(
    auditId: number,
    strategyName: string,
    constraint: string = 'demographic_parity',
    alpha: number = 1.0
  ): Promise<MitigationResult> {
    const response = await axios.post(
      `${API_URL}/api/audits/enhanced/${auditId}/mitigation/apply`,
      {
        strategy_name: strategyName,
        constraint,
        alpha,
      },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get mitigation strategy recommendations
   */
  async getMitigationRecommendations(auditId: number): Promise<any> {
    const response = await axios.get(
      `${API_URL}/api/audits/enhanced/${auditId}/mitigation/recommendations`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get group comparison analysis
   */
  async getGroupComparison(auditId: number): Promise<GroupComparison> {
    const response = await axios.get(
      `${API_URL}/api/audits/enhanced/${auditId}/groups/comparison`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get plain-language explanation of a metric
   */
  async explainMetric(auditId: number, metricName: string): Promise<{
    metric_name: string;
    value: number;
    explanation: string;
  }> {
    const response = await axios.get(
      `${API_URL}/api/audits/enhanced/${auditId}/metrics/explain/${metricName}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get compliance status (AI Act, GDPR)
   */
  async getComplianceStatus(auditId: number): Promise<{
    audit_id: number;
    audit_name: string;
    compliance: any;
    overall_compliant: boolean;
    risk_level: string;
  }> {
    const response = await axios.get(
      `${API_URL}/api/audits/enhanced/${auditId}/compliance/status`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

// Export singleton instance
export const fairnessEnhancedService = new FairnessEnhancedService();
