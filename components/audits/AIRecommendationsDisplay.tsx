/**
 * AI Recommendations Display Component
 * 
 * Shows AI-generated bias mitigation recommendations with severity, actions, and compliance status
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AIRecommendations } from '@/services/fairnessEnhancedService';

interface AIRecommendationsDisplayProps {
  recommendations: AIRecommendations;
  onApplyStrategy?: (strategyName: string) => void;
}

export function AIRecommendationsDisplay({ 
  recommendations, 
  onApplyStrategy 
}: AIRecommendationsDisplayProps) {
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return <Zap className="h-4 w-4 text-green-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AI Assessment
            </CardTitle>
            <Badge variant={getSeverityColor(recommendations.severity)}>
              {recommendations.severity} Severity
            </Badge>
          </div>
          <CardDescription>{recommendations.overall_assessment}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Problematic Metrics</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.problematic_metrics.map((metric, idx) => (
                  <Badge key={idx} variant="outline">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Affected Groups</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.affected_groups.map((group, idx) => (
                  <Badge key={idx} variant="secondary">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Root Causes */}
      {recommendations.root_causes && recommendations.root_causes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Root Cause Analysis
            </CardTitle>
            <CardDescription>Likely sources of bias in your model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.root_causes.map((cause, idx) => (
                <div key={idx} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{cause.cause}</h4>
                    <Badge variant="outline">{cause.likelihood} Likelihood</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cause.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Immediate Actions */}
      {recommendations.immediate_actions && recommendations.immediate_actions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Zap className="h-5 w-5" />
              Immediate Actions (Top Priority)
            </CardTitle>
            <CardDescription>Quick wins you can implement right away</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.immediate_actions.map((action, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold mb-2">{action.action}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{action.impact}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {action.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mitigation Strategies */}
      {recommendations.mitigation_strategies && recommendations.mitigation_strategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommended Mitigation Strategies
            </CardTitle>
            <CardDescription>Prioritized strategies to reduce bias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.mitigation_strategies.map((strategy, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{strategy.name}</h4>
                        <Badge variant="outline">{strategy.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    </div>
                    {onApplyStrategy && (
                      <Button
                        size="sm"
                        onClick={() => onApplyStrategy(strategy.name.toLowerCase().replace(/\s+/g, '_'))}
                        className="ml-4"
                      >
                        Apply
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Complexity</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getComplexityIcon(strategy.complexity)}
                        <span className="font-medium">{strategy.complexity}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="font-medium mt-1">{strategy.timeline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Impact</p>
                      <p className="font-medium mt-1">{strategy.expected_impact}</p>
                    </div>
                  </div>

                  {strategy.steps && strategy.steps.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Implementation Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                          {strategy.steps.map((step, stepIdx) => (
                            <li key={stepIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Status */}
      {recommendations.compliance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Status
            </CardTitle>
            <CardDescription>AI Act and GDPR compliance assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">AI Act</span>
                  <Badge variant={
                    recommendations.compliance.ai_act_status === 'Compliant' ? 'default' : 'destructive'
                  }>
                    {recommendations.compliance.ai_act_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">GDPR</span>
                  <Badge variant={
                    recommendations.compliance.gdpr_status === 'Compliant' ? 'default' : 'destructive'
                  }>
                    {recommendations.compliance.gdpr_status}
                  </Badge>
                </div>
              </div>

              {recommendations.compliance.required_documentation && 
               recommendations.compliance.required_documentation.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Required Documentation:</h4>
                  <ul className="space-y-1">
                    {recommendations.compliance.required_documentation.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Long-term Improvements */}
      {recommendations.long_term_improvements && 
       recommendations.long_term_improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Long-term Improvements
            </CardTitle>
            <CardDescription>Systemic changes for sustained fairness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.long_term_improvements.map((improvement, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold mb-1">{improvement.improvement}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{improvement.rationale}</p>
                  <Badge variant="outline">{improvement.timeline}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
