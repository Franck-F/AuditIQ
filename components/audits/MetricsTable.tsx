/**
 * Detailed Fairness Metrics Table Component
 * 
 * Displays comprehensive fairness metrics in an organized table format
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MetricsTableProps {
  fairnessScores: Record<string, number>;
  overallMetrics?: Record<string, number>;
  riskAssessment?: {
    risk_level: string;
    risk_score: number;
    risk_factors: string[];
  };
}

export function MetricsTable({ fairnessScores, overallMetrics, riskAssessment }: MetricsTableProps) {
  // Helper to get metric status
  const getMetricStatus = (metricName: string, value: number): {
    status: 'good' | 'warning' | 'critical';
    icon: React.ReactNode;
    color: string;
  } => {
    const absValue = Math.abs(value);
    
    // Different thresholds for different metrics
    if (metricName.includes('parity') || metricName.includes('odds') || metricName.includes('opportunity')) {
      if (absValue < 0.05) return { status: 'good', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' };
      if (absValue < 0.1) return { status: 'warning', icon: <Info className="h-4 w-4" />, color: 'text-yellow-600' };
      return { status: 'critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' };
    }
    
    // For ratio metrics (ideal is 1.0)
    if (metricName.includes('ratio')) {
      const deviation = Math.abs(value - 1.0);
      if (deviation < 0.1) return { status: 'good', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' };
      if (deviation < 0.2) return { status: 'warning', icon: <Info className="h-4 w-4" />, color: 'text-yellow-600' };
      return { status: 'critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' };
    }
    
    return { status: 'good', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-gray-600' };
  };

  // Helper to format metric name
  const formatMetricName = (name: string): string => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Group metrics by attribute
  const groupedMetrics: Record<string, Record<string, number>> = {};
  
  Object.entries(fairnessScores).forEach(([key, value]) => {
    const parts = key.split('_');
    const attribute = parts[0];
    const metricName = parts.slice(1).join('_');
    
    if (!groupedMetrics[attribute]) {
      groupedMetrics[attribute] = {};
    }
    groupedMetrics[attribute][metricName] = value;
  });

  return (
    <div className="space-y-6">
      {/* Overall Performance Metrics */}
      {overallMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>Model performance metrics across all groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(overallMetrics).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm text-muted-foreground">{formatMetricName(key)}</p>
                  <p className="text-2xl font-bold">
                    {typeof value === 'number' ? value.toFixed(3) : value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Risk Assessment
              <Badge variant={
                riskAssessment.risk_level === 'Low' ? 'default' :
                riskAssessment.risk_level === 'Medium' ? 'secondary' :
                riskAssessment.risk_level === 'High' ? 'destructive' :
                'destructive'
              }>
                {riskAssessment.risk_level}
              </Badge>
            </CardTitle>
            <CardDescription>
              {riskAssessment.risk_factors.length} potential fairness issues detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {riskAssessment.risk_factors.length > 0 ? (
              <ul className="space-y-2">
                {riskAssessment.risk_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                No significant fairness issues detected
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fairness Metrics by Attribute */}
      {Object.entries(groupedMetrics).map(([attribute, metrics]) => (
        <Card key={attribute}>
          <CardHeader>
            <CardTitle>{formatMetricName(attribute)}</CardTitle>
            <CardDescription>Fairness metrics for {attribute} attribute</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(metrics).map(([metricName, value]) => {
                  const { status, icon, color } = getMetricStatus(metricName, value);
                  
                  return (
                    <TableRow key={metricName}>
                      <TableCell className="font-medium">
                        {formatMetricName(metricName)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {value.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${color}`}>
                          {icon}
                          <span className="text-xs capitalize">{status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.abs(value) < 0.1 ? (
                          <TrendingDown className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600 inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
