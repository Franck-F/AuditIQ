/**
 * Intersectional Analysis Visualization Component
 * 
 * Displays fairness analysis across intersections of sensitive attributes
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, Users } from 'lucide-react';

interface IntersectionalAnalysisProps {
  data: {
    attribute_combinations: string[][];
    subgroup_metrics: Record<string, Record<string, any>>;
    worst_subgroups: Array<{
      combination: string;
      group: string;
      accuracy: number;
      size: number;
      percentage: number;
      vulnerability_score: number;
    }>;
    disparity_matrix: Record<string, number>;
    recommendations: string[];
  };
}

export function IntersectionalAnalysisView({ data }: IntersectionalAnalysisProps) {
  // Get top disparities
  const topDisparities = Object.entries(data.disparity_matrix)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Intersectional Analysis Overview
          </CardTitle>
          <CardDescription>
            Analysis of {data.attribute_combinations.length} attribute combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Combinations Analyzed</p>
              <p className="text-2xl font-bold">{data.attribute_combinations.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vulnerable Subgroups</p>
              <p className="text-2xl font-bold">{data.worst_subgroups.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Disparity</p>
              <p className="text-2xl font-bold">
                {topDisparities.length > 0 ? (topDisparities[0][1] * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="space-y-1 mt-2">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm">{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Top Disparities */}
      {topDisparities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Disparities by Attribute Combination</CardTitle>
            <CardDescription>
              Largest performance gaps across intersectional groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDisparities.map(([combination, disparity], idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{combination}</span>
                    <Badge variant={
                      disparity > 0.2 ? 'destructive' :
                      disparity > 0.1 ? 'secondary' :
                      'default'
                    }>
                      {(disparity * 100).toFixed(1)}% disparity
                    </Badge>
                  </div>
                  <Progress value={Math.min(disparity * 100, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Vulnerable Subgroups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Most Vulnerable Subgroups
          </CardTitle>
          <CardDescription>
            Subgroups requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.worst_subgroups.slice(0, 10).map((subgroup, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">#{idx + 1}</Badge>
                      <h4 className="font-semibold">{subgroup.group}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{subgroup.combination}</p>
                  </div>
                  <Badge variant="destructive">
                    Vulnerability: {subgroup.vulnerability_score.toFixed(0)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-medium">{(subgroup.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Group Size</p>
                    <p className="font-medium">{subgroup.size} samples</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Percentage</p>
                    <p className="font-medium">{subgroup.percentage.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {subgroup.percentage < 5 && "⚠️ Underrepresented group. "}
                    {subgroup.accuracy < 0.7 && "⚠️ Low accuracy. "}
                    {subgroup.vulnerability_score > 150 && "🚨 Critical - requires immediate intervention."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Subgroup Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics by Combination</CardTitle>
          <CardDescription>
            Performance breakdown for each attribute combination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(data.subgroup_metrics).map(([combination, groups]) => (
              <div key={combination} className="space-y-3">
                <h4 className="font-semibold text-sm border-b pb-2">{combination}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(groups).map(([groupName, metrics]: [string, any]) => (
                    <div key={groupName} className="border rounded p-3 space-y-2">
                      <p className="font-medium text-sm">{groupName}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="font-medium">{(metrics.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Precision:</span>
                          <span className="font-medium">{(metrics.precision * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recall:</span>
                          <span className="font-medium">{(metrics.recall * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{metrics.size} ({metrics.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
