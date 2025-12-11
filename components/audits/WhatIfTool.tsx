/**
 * What-If Tool Interactive Component
 * 
 * Provides interactive exploration of model predictions with counterfactuals
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, BarChart3, Lightbulb, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface WhatIfToolProps {
  auditId: number;
}

export function WhatIfTool({ auditId }: WhatIfToolProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [counterfactual, setCounterfactual] = useState<any>(null);
  const [featureImportance, setFeatureImportance] = useState<any>(null);
  const [exploration, setExploration] = useState<any>(null);

  // Load sample instances
  const loadInstances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/audits/enhanced/${auditId}/whatif/instances`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInstances(response.data.instances);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load instances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate counterfactual
  const generateCounterfactual = async (desiredOutcome: number) => {
    if (!selectedInstance) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/audits/enhanced/${auditId}/whatif/counterfactual`,
        {
          instance_index: selectedInstance.index,
          desired_outcome: desiredOutcome,
          max_changes: 3,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCounterfactual(response.data);
        toast({
          title: 'Counterfactual Generated',
          description: response.data.explanation,
        });
      } else {
        toast({
          title: 'No Counterfactual Found',
          description: response.data.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to generate counterfactual',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate feature importance
  const calculateFeatureImportance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/audits/enhanced/${auditId}/whatif/feature-importance`,
        { method: 'shap', sample_size: 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeatureImportance(response.data);
      toast({
        title: 'Feature Importance Calculated',
        description: `Using ${response.data.explanation_type} method`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to calculate feature importance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Explore prediction
  const explorePrediction = async () => {
    if (!selectedInstance) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/audits/enhanced/${auditId}/whatif/explore`,
        { instance_index: selectedInstance.index },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExploration(response.data.exploration);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to explore prediction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadInstances();
  }, [auditId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            What-If Tool
          </CardTitle>
          <CardDescription>
            Interactive exploration of model predictions and counterfactuals
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="counterfactual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="counterfactual">Counterfactuals</TabsTrigger>
          <TabsTrigger value="importance">Feature Importance</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>

        {/* Counterfactual Tab */}
        <TabsContent value="counterfactual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Counterfactual</CardTitle>
              <CardDescription>
                Find minimal changes to flip the prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instance selector */}
              <div>
                <Label>Select Instance</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {instances.slice(0, 6).map((instance) => (
                    <Button
                      key={instance.index}
                      variant={selectedInstance?.index === instance.index ? 'default' : 'outline'}
                      onClick={() => setSelectedInstance(instance)}
                      className="h-auto py-2"
                    >
                      <div className="text-left w-full">
                        <div className="text-xs text-muted-foreground">Instance #{instance.index}</div>
                        <div className="text-sm font-semibold">
                          Pred: {instance.predicted_label === 1 ? 'Positive' : 'Negative'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedInstance && (
                <>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Current Instance</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">True Label:</span>
                        <Badge className="ml-2">
                          {selectedInstance.true_label === 1 ? 'Positive' : 'Negative'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Predicted:</span>
                        <Badge className="ml-2" variant="outline">
                          {selectedInstance.predicted_label === 1 ? 'Positive' : 'Negative'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateCounterfactual(1)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Generate for Positive Outcome
                    </Button>
                    <Button
                      onClick={() => generateCounterfactual(0)}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      Generate for Negative Outcome
                    </Button>
                  </div>
                </>
              )}

              {/* Counterfactual Result */}
              {counterfactual && counterfactual.success && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold">Counterfactual Found!</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Original</h5>
                      <div className="bg-muted rounded p-3 space-y-1 text-sm">
                        <div>Prediction: {(counterfactual.original_prediction * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Counterfactual</h5>
                      <div className="bg-green-50 dark:bg-green-950/20 rounded p-3 space-y-1 text-sm">
                        <div>Prediction: {(counterfactual.counterfactual_prediction * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Features Changed ({counterfactual.features_changed.length})</h5>
                    <div className="flex flex-wrap gap-2">
                      {counterfactual.features_changed.map((feature: string) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {counterfactual.explanation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Importance Tab */}
        <TabsContent value="importance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Importance Analysis
              </CardTitle>
              <CardDescription>
                Understand which features drive predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={calculateFeatureImportance} disabled={loading}>
                Calculate Feature Importance (SHAP)
              </Button>

              {featureImportance && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Top Features</h4>
                    <Badge>{featureImportance.explanation_type}</Badge>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(featureImportance.feature_importances)
                      .slice(0, 10)
                      .map(([feature, importance]: [string, any], idx) => (
                        <div key={feature} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {idx + 1}. {feature}
                            </span>
                            <span className="text-muted-foreground">
                              {importance.toFixed(4)}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${(importance / Math.max(...Object.values(featureImportance.feature_importances))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Exploration</CardTitle>
              <CardDescription>
                See how predictions change as you modify features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedInstance ? (
                <>
                  <Button onClick={explorePrediction} disabled={loading}>
                    Explore Prediction Sensitivity
                  </Button>

                  {exploration && (
                    <div className="space-y-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Current Prediction:</span>
                        <span className="ml-2 font-semibold">
                          {(exploration.original_prediction * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Most Sensitive Features</h4>
                        <div className="space-y-3">
                          {exploration.most_sensitive_features.slice(0, 5).map((feature: string) => {
                            const sensitivity = exploration.feature_sensitivity[feature];
                            return (
                              <div key={feature} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{feature}</span>
                                  <Badge variant="outline">
                                    Max change: {(sensitivity.max_change * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Current value: {sensitivity.current_value.toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select an instance to explore
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
