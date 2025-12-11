/**
 * Fairness Performance Scatter Chart
 * 
 * Visualizes fairness-performance tradeoff with Pareto frontier
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface ModelComparisonProps {
  data: {
    models: string[];
    performance: Record<string, { accuracy: number; precision: number; recall: number }>;
    fairness: Record<string, Record<string, number>>;
    tradeoff_analysis: Record<string, {
      performance_score: number;
      fairness_score: number;
      combined_score: number;
      is_pareto_optimal: boolean;
    }>;
    recommendations: string[];
  };
}

export function FairnessPerformanceChart({ data }: ModelComparisonProps) {
  // Find best model
  const bestModel = Object.entries(data.tradeoff_analysis)
    .reduce((best, [name, scores]) => 
      scores.combined_score > best[1].combined_score ? [name, scores] : best
    );

  // Get Pareto optimal models
  const paretoModels = Object.entries(data.tradeoff_analysis)
    .filter(([, scores]) => scores.is_pareto_optimal)
    .map(([name]) => name);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Model Comparison
          </CardTitle>
          <CardDescription>
            Fairness-Performance tradeoff analysis for {data.models.length} models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <p className="text-sm text-muted-foreground mb-1">Best Overall</p>
              <p className="text-xl font-bold">{bestModel[0]}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Score: {(bestModel[1].combined_score * 100).toFixed(1)}%
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Pareto Optimal</p>
              <p className="text-xl font-bold">{paretoModels.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {paretoModels.join(', ')}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Models Analyzed</p>
              <p className="text-xl font-bold">{data.models.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scatter Plot Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Fairness-Performance Tradeoff</CardTitle>
          <CardDescription>
            Models closer to top-right are better (high fairness + high performance)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-96 border rounded-lg p-4">
            {/* Simple scatter plot using CSS positioning */}
            <div className="relative w-full h-full">
              {/* Axes */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
              <div className="absolute top-0 bottom-0 left-0 w-px bg-border" />
              
              {/* Axis labels */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                Performance Score →
              </div>
              <div className="absolute top-1/2 -left-20 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
                Fairness Score →
              </div>

              {/* Plot points */}
              {Object.entries(data.tradeoff_analysis).map(([modelName, scores]) => {
                const x = scores.performance_score * 100;
                const y = (1 - scores.fairness_score) * 100; // Invert Y for display
                const isPareto = scores.is_pareto_optimal;
                const isBest = modelName === bestModel[0];

                return (
                  <div
                    key={modelName}
                    className="absolute group"
                    style={{
                      left: `${x}%`,
                      bottom: `${100 - y}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  >
                    <div className={`
                      w-3 h-3 rounded-full cursor-pointer transition-all
                      ${isBest ? 'bg-green-600 ring-4 ring-green-200 w-4 h-4' :
                        isPareto ? 'bg-blue-600 ring-2 ring-blue-200' :
                        'bg-gray-400'}
                    `} />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover border rounded-lg shadow-lg p-3 whitespace-nowrap">
                        <p className="font-semibold text-sm mb-2">{modelName}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Performance:</span>
                            <span className="font-medium">{(scores.performance_score * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Fairness:</span>
                            <span className="font-medium">{(scores.fairness_score * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Combined:</span>
                            <span className="font-medium">{(scores.combined_score * 100).toFixed(1)}%</span>
                          </div>
                          {isPareto && (
                            <Badge variant="outline" className="mt-1">Pareto Optimal</Badge>
                          )}
                          {isBest && (
                            <Badge className="mt-1">Best Overall</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600 ring-2 ring-green-200" />
              <span>Best Overall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Pareto Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Other Models</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Model Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-right p-2">Accuracy</th>
                  <th className="text-right p-2">Precision</th>
                  <th className="text-right p-2">Recall</th>
                  <th className="text-right p-2">Fairness Score</th>
                  <th className="text-right p-2">Combined Score</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.models.map((modelName) => {
                  const perf = data.performance[modelName];
                  const tradeoff = data.tradeoff_analysis[modelName];
                  const isBest = modelName === bestModel[0];
                  const isPareto = tradeoff.is_pareto_optimal;

                  return (
                    <tr key={modelName} className={`border-b ${isBest ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                      <td className="p-2 font-medium">{modelName}</td>
                      <td className="p-2 text-right font-mono">{(perf.accuracy * 100).toFixed(1)}%</td>
                      <td className="p-2 text-right font-mono">{(perf.precision * 100).toFixed(1)}%</td>
                      <td className="p-2 text-right font-mono">{(perf.recall * 100).toFixed(1)}%</td>
                      <td className="p-2 text-right font-mono">{(tradeoff.fairness_score * 100).toFixed(1)}%</td>
                      <td className="p-2 text-right font-mono font-bold">{(tradeoff.combined_score * 100).toFixed(1)}%</td>
                      <td className="p-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {isBest && <Badge>Best</Badge>}
                          {isPareto && <Badge variant="outline">Pareto</Badge>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
