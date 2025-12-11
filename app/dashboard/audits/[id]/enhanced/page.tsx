/**
 * Enhanced Fairness Audit Detail Page
 * 
 * Comprehensive view of fairness audit results with:
 * - Detailed metrics
 * - AI recommendations
 * - Group comparisons
 * - Mitigation strategies
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Download,
  Lightbulb,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';

import { MetricsTable } from '@/components/audits/MetricsTable';
import { AIRecommendationsDisplay } from '@/components/audits/AIRecommendationsDisplay';
import { GroupComparisonChart } from '@/components/audits/GroupComparisonChart';
import {
  fairnessEnhancedService,
  DetailedMetrics,
  AIRecommendations,
  GroupComparison,
} from '@/services/fairnessEnhancedService';

export default function EnhancedAuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const auditId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [detailedMetrics, setDetailedMetrics] = useState<DetailedMetrics | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendations | null>(null);
  const [groupComparison, setGroupComparison] = useState<GroupComparison | null>(null);
  const [activeTab, setActiveTab] = useState('metrics');
  const [applyingMitigation, setApplyingMitigation] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [metrics, recommendations, comparison] = await Promise.all([
        fairnessEnhancedService.getDetailedMetrics(auditId),
        fairnessEnhancedService.getAIRecommendations(auditId),
        fairnessEnhancedService.getGroupComparison(auditId),
      ]);

      setDetailedMetrics(metrics);
      setAIRecommendations(recommendations);
      setGroupComparison(comparison);
    } catch (error: any) {
      console.error('Error loading audit data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load audit data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMitigation = async (strategyName: string) => {
    try {
      setApplyingMitigation(true);

      const result = await fairnessEnhancedService.applyMitigation(
        auditId,
        strategyName,
        'demographic_parity'
      );

      toast({
        title: 'Mitigation Applied',
        description: result.recommendation,
      });

      // Show improvement summary
      const improvementRate = result.improvement.summary.improvement_rate;
      toast({
        title: `${improvementRate.toFixed(1)}% Improvement`,
        description: `${result.improvement.summary.metrics_improved} out of ${result.improvement.summary.total_metrics} metrics improved`,
      });

      // Reload data to show updated metrics
      await loadAuditData();
    } catch (error: any) {
      console.error('Error applying mitigation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to apply mitigation strategy',
        variant: 'destructive',
      });
    } finally {
      setApplyingMitigation(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Exporting Report',
      description: 'Generating comprehensive fairness report...',
    });
    // TODO: Implement report export
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!detailedMetrics || !aiRecommendations) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No audit data available. Please run an audit first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Enhanced Fairness Audit</h1>
            <p className="text-muted-foreground">
              Comprehensive bias analysis and mitigation recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={loadAuditData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Summary Card */}
      <Card className={
        detailedMetrics.risk_assessment.risk_level === 'Critical' ? 'border-red-500' :
        detailedMetrics.risk_assessment.risk_level === 'High' ? 'border-orange-500' :
        detailedMetrics.risk_assessment.risk_level === 'Medium' ? 'border-yellow-500' :
        'border-green-500'
      }>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
            <Badge variant={
              detailedMetrics.risk_assessment.risk_level === 'Low' ? 'default' :
              detailedMetrics.risk_assessment.risk_level === 'Medium' ? 'secondary' :
              'destructive'
            }>
              {detailedMetrics.risk_assessment.risk_level} Risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="text-2xl font-bold">{detailedMetrics.risk_assessment.risk_score}/4</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Violations Detected</p>
              <p className="text-2xl font-bold">{detailedMetrics.risk_assessment.total_violations}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Immediate Action</p>
              <p className="text-2xl font-bold">
                {detailedMetrics.risk_assessment.requires_immediate_action ? 'Required' : 'Not Required'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group Comparison
          </TabsTrigger>
          <TabsTrigger value="mitigation" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Mitigation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-6">
          <MetricsTable
            fairnessScores={detailedMetrics.fairness_scores}
            overallMetrics={detailedMetrics.overall_metrics}
            riskAssessment={detailedMetrics.risk_assessment}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <AIRecommendationsDisplay
            recommendations={aiRecommendations}
            onApplyStrategy={handleApplyMitigation}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          {groupComparison && (
            <GroupComparisonChart groupComparison={groupComparison} />
          )}
        </TabsContent>

        <TabsContent value="mitigation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply Mitigation Strategy</CardTitle>
              <CardDescription>
                Select and apply a bias mitigation strategy to improve fairness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiRecommendations.mitigation_strategies.map((strategy, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{strategy.name}</h4>
                      <Button
                        size="sm"
                        onClick={() => handleApplyMitigation(strategy.name.toLowerCase().replace(/\s+/g, '_'))}
                        disabled={applyingMitigation}
                      >
                        {applyingMitigation ? 'Applying...' : 'Apply Strategy'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{strategy.type}</Badge>
                      <Badge variant="outline">{strategy.complexity} Complexity</Badge>
                      <Badge variant="outline">{strategy.timeline}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
