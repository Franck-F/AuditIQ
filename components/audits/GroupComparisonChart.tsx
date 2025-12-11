/**
 * Group Comparison Visualization Component
 * 
 * Displays side-by-side comparison of metrics across different groups
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';
import { GroupComparison } from '@/services/fairnessEnhancedService';

interface GroupComparisonChartProps {
  groupComparison: GroupComparison;
}

export function GroupComparisonChart({ groupComparison }: GroupComparisonChartProps) {
  return (
    <div className="space-y-6">
      {Object.entries(groupComparison.group_analysis).map(([attribute, analysis]) => (
        <Card key={attribute}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {attribute.charAt(0).toUpperCase() + attribute.slice(1)} Analysis
            </CardTitle>
            <CardDescription>
              Performance comparison across {Object.keys(analysis.groups).length} groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Disparity Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Performance Disparity</span>
                <Badge variant={
                  analysis.disparity_percentage < 5 ? 'default' :
                  analysis.disparity_percentage < 10 ? 'secondary' :
                  'destructive'
                }>
                  {analysis.disparity_percentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(analysis.disparity_percentage, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Difference between best and worst performing groups
              </p>
            </div>

            {/* Best and Worst Performing Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-200 bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Best Performing
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">
                  {analysis.best_performing.group}
                </p>
                <p className="text-sm text-muted-foreground">
                  Accuracy: {(analysis.best_performing.accuracy * 100).toFixed(1)}%
                </p>
              </div>

              <div className="border border-red-200 bg-red-50/50 dark:bg-red-950/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Worst Performing
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">
                  {analysis.worst_performing.group}
                </p>
                <p className="text-sm text-muted-foreground">
                  Accuracy: {(analysis.worst_performing.accuracy * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Detailed Group Metrics */}
            <div>
              <h4 className="text-sm font-semibold mb-3">All Groups</h4>
              <div className="space-y-3">
                {Object.entries(analysis.groups).map(([groupName, metrics]: [string, any]) => {
                  if (typeof metrics !== 'object' || !metrics.accuracy) return null;
                  
                  const accuracy = metrics.accuracy * 100;
                  const isBest = groupName === analysis.best_performing.group;
                  const isWorst = groupName === analysis.worst_performing.group;
                  
                  return (
                    <div key={groupName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{groupName}</span>
                          {isBest && <Badge variant="default" className="text-xs">Best</Badge>}
                          {isWorst && <Badge variant="destructive" className="text-xs">Worst</Badge>}
                        </div>
                        <span className="text-sm font-mono">{accuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={accuracy} className="h-2" />
                      
                      {/* Additional metrics */}
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Precision</span>
                          <span className="font-medium text-foreground">
                            {(metrics.precision * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="block">Recall</span>
                          <span className="font-medium text-foreground">
                            {(metrics.recall * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="block">Size</span>
                          <span className="font-medium text-foreground">
                            {metrics.size} ({metrics.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
