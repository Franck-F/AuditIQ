'use client'

import { useState, useEffect, use } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIChatButton } from '@/components/dashboard/ai/AIChatButton'
import { Badge } from '@/components/ui/badge'
import { Download, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, BarChart3, Users, Target, Sparkles } from 'lucide-react'
import { auditService } from '@/services/auditService'

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [audit, setAudit] = useState<any>(null)
  const [edaData, setEdaData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auditIdIdx = parseInt(id)
        const [auditRes, edaRes] = await Promise.all([
          auditService.getById(auditIdIdx),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/audits/${auditIdIdx}/eda`, { credentials: 'include' }).then(r => r.json())
        ])
        setAudit(auditRes)
        setEdaData(edaRes)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const [downloading, setDownloading] = useState(false)

  const handleDownloadReport = async () => {
    if (!audit) return
    setDownloading(true)
    try {
      // 1. Déclencher la génération
      const genRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/generate/${audit.id}`, {
        credentials: 'include'
      })
      if (!genRes.ok) throw new Error('Erreur generation rapport')
      
      // 2. Déclencher le téléchargement
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/reports/${audit.id}/download`
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="p-6">Chargement...</div>
  if (!audit) return <div className="p-6 font-bold text-red-500">Audit non trouvé</div>

  const metrics = audit.metrics_results || {}
  const overallScore = audit.overall_score || 0
  
  // Mapping des métriques pour l'affichage
  const metricMapping: Record<string, { label: string, desc: string }> = {
    "demographic_parity": { label: "Demographic Parity", desc: "Disparité dans les taux d'acceptation" },
    "equal_opportunity": { label: "Equal Opportunity", desc: "Écart dans les vrais positifs" },
    "equalized_odds": { label: "Equalized Odds", desc: "Équilibre taux FP et FN" },
    "predictive_parity": { label: "Predictive Parity", desc: "Parité valeur prédictive positive" },
    "calibration": { label: "Calibration", desc: "Fiabilité des probabilités prédictives" },
    "statistical_parity_difference": { label: "Statistical Parity Diff", desc: "Différence de taux de sélection" },
    "disparate_impact": { label: "Disparate Impact", desc: "Ratio des taux de sélection" },
    "average_odds_difference": { label: "Avg Odds Diff", desc: "Moyenne des écarts de TPR et FPR" },
    "error_rate_balance": { label: "Error Rate Balance", desc: "Équilibre des erreurs globales" },
    "false_positive_rate_parity": { label: "FPR Parity", desc: "Parité des faux positifs" },
    "false_negative_rate_parity": { label: "FNR Parity", desc: "Parité des faux négatifs" },
    "true_positive_rate_parity": { label: "TPR Parity", desc: "Parité des vrais positifs" },
    "true_negative_rate_parity": { label: "TNR Parity", desc: "Parité des vrais négatifs" },
    "positive_predictive_parity": { label: "PPV Parity", desc: "Parité précision positive" },
    "negative_predictive_parity": { label: "NPV Parity", desc: "Parité précision négative" },
    "treatment_equality": { label: "Treatment Equality", desc: "Ratio des erreurs FN/FP" }
  }

  // Extraire les métriques réelles calculées
  const displayMetrics: any[] = []
  if (audit.sensitive_attributes && audit.sensitive_attributes.length > 0) {
    const attr = audit.sensitive_attributes[0] // On prend le premier pour l'affichage principal
    Object.keys(metricMapping).forEach(mKey => {
      const fullKey = `${attr}_${mKey}`
      if (metrics[fullKey] !== undefined) {
        displayMetrics.push({
          key: mKey,
          label: metricMapping[mKey].label,
          desc: metricMapping[mKey].desc,
          value: metrics[fullKey] / 100, // Retourner au format 0-1
          status: metrics[fullKey] >= 80 ? 'success' : metrics[fullKey] >= 60 ? 'warning' : 'critical'
        })
      }
    })
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{audit.name}</h1>
                {overallScore < 80 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Biais détectés
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Audit réalise le {new Date(audit.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                className="gap-2" 
                onClick={handleDownloadReport}
                disabled={downloading}
              >
                <Download className="h-4 w-4" />
                {downloading ? "Génération..." : "Rapport PDF"}
              </Button>
              <Button className="gap-2 glow-primary">
                <Sparkles className="h-4 w-4" />
                Appliquer corrections
              </Button>
            </div>
          </div>

          {/* Global Score Card */}
          <Card className="p-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Score d'équité global</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold text-gradient">{Math.round(overallScore)}%</p>
                  <Badge 
                    variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'outline' : 'destructive'} 
                    className="mb-2"
                  >
                    {audit.risk_level || (overallScore >= 80 ? 'Low' : overallScore >= 60 ? 'Medium' : 'High')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Moyenne des 16 métriques</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conformité réglementaire</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold">{overallScore >= 80 ? '100%' : Math.round(overallScore * 0.8)}%</p>
                  <div className={`flex items-center gap-1 mb-2 ${overallScore >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                    {overallScore >= 80 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span className="text-sm font-medium">{overallScore >= 80 ? 'Conforme' : 'Attention'}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">AI Act Index (Estimé)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Biais détectés</p>
                <p className="text-5xl font-bold">
                  {Object.values(metrics).filter((v: any) => v < 80).length}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {Object.values(metrics).filter((v: any) => v < 60).length} critiques
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-500">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    {Object.values(metrics).filter((v: any) => v >= 60 && v < 80).length} modérés
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="metrics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="metrics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Métriques ({displayMetrics.length})
              </TabsTrigger>
              <TabsTrigger value="groups" className="gap-2">
                <Users className="h-4 w-4" />
                Analyses Groupes
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Target className="h-4 w-4" />
                Recommandations Gemini
              </TabsTrigger>
              <TabsTrigger value="eda" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Exploration EDA
              </TabsTrigger>
            </TabsList>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayMetrics.map((m, idx) => (
                  <MetricCard
                    key={idx}
                    title={m.label}
                    value={m.value}
                    threshold={0.8}
                    status={m.status}
                    description={m.desc}
                    groups={[]} // On ne peut pas facilement extraire les groupes pour chaque métrique ici
                  />
                ))}
              </div>

              {/* Detailed Analysis from AI */}
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Analyse automatique (Insights)</h3>
                <div className="space-y-4">
                  {audit.ai_recommendations?.insights?.map((insight: any, idx: number) => (
                    <AnalysisItem
                      key={idx}
                      type={insight.type || 'info'}
                      title={insight.title}
                      description={insight.description}
                      metric={insight.impact}
                    />
                  )) || (
                    <p className="text-muted-foreground text-sm italic">Aucun insight spécifique genere.</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Performances par Segment et Attribut
                </h3>
                
                {audit.group_metrics && Object.keys(audit.group_metrics).length > 0 ? (
                  <div className="space-y-12">
                    {Object.entries(audit.group_metrics).map(([attr, groups]: [string, any]) => {
                      const names = Object.keys(groups)
                      const values = names.map(n => groups[n].selection_rate * 100)
                      const scores = names.map(n => groups[n].avg_score || 0)

                      return (
                        <div key={attr} className="space-y-4">
                          <h4 className="font-medium text-muted-foreground border-b pb-2">Attribut: {attr}</h4>
                          <div className="grid lg:grid-cols-2 gap-8">
                            <div className="h-[350px] bg-card rounded-lg border p-4">
                              <Plot
                                data={[
                                  {
                                    x: names,
                                    y: values,
                                    type: 'bar',
                                    marker: { color: '#4F46E5' },
                                    name: 'Taux d\'acceptation (%)'
                                  }
                                ]}
                                layout={{
                                  autosize: true,
                                  title: `Taux d'acceptation par ${attr}`,
                                  margin: { t: 40, b: 40, l: 40, r: 20 },
                                  paper_bgcolor: 'rgba(0,0,0,0)',
                                  plot_bgcolor: 'rgba(0,0,0,0)',
                                  font: { color: '#888' },
                                  yaxis: { range: [0, 100] }
                                }}
                                useResizeHandler={true}
                                className="w-full h-full"
                                config={{ responsive: true, displayModeBar: false }}
                              />
                            </div>
                            <div className="h-[350px] bg-card rounded-lg border p-4">
                              <Plot
                                data={[
                                  {
                                    x: names,
                                    y: scores,
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    marker: { color: '#10B981', size: 10 },
                                    line: { shape: 'spline' },
                                    name: 'Score Moyen'
                                  }
                                ]}
                                layout={{
                                  autosize: true,
                                  title: `Score moyen par ${attr}`,
                                  margin: { t: 40, b: 40, l: 40, r: 20 },
                                  paper_bgcolor: 'rgba(0,0,0,0)',
                                  plot_bgcolor: 'rgba(0,0,0,0)',
                                  font: { color: '#888' },
                                  yaxis: { range: [0, 100] }
                                }}
                                useResizeHandler={true}
                                className="w-full h-full"
                                config={{ responsive: true, displayModeBar: false }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center py-12 text-muted-foreground italic">
                    Aucune donnee de performance par groupe disponible.
                  </p>
                )}
              </Card>

              {/* Intersectional Card could also be upgraded later if needed */}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="space-y-6">
                <div className="grid gap-4">
                  {audit.mitigation_recommendations?.recommendations?.map((rec: any, idx: number) => (
                    <RecommendationCard
                      key={idx}
                      priority={(rec.priority || 'medium').toLowerCase() as any}
                      title={rec.name || rec.strategy}
                      description={rec.description || rec.reasoning}
                      impact={rec.impact || rec.expected_impact || `Impact: ${rec.benefit}`}
                      effort={rec.effort || rec.complexity || 'Medium'}
                      technique={rec.technique || rec.type || 'in-processing'}
                      audit={audit}
                    />
                  )) || (
                    <Card className="p-8 text-center text-muted-foreground">
                      Aucune recommandation de mitigation recue.
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* EDA Exploration Tab */}
            <TabsContent value="eda" className="space-y-6">
              {edaData ? (
                <>
                  <div className="grid gap-6 md:grid-cols-4">
                    <Card className="p-6">
                      <p className="text-sm font-medium text-muted-foreground">Lignes</p>
                      <p className="text-2xl font-bold">{edaData.summary.row_count.toLocaleString()}</p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm font-medium text-muted-foreground">Colonnes</p>
                      <p className="text-2xl font-bold">{edaData.summary.col_count}</p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm font-medium text-muted-foreground">Données manquantes</p>
                      <p className={`text-2xl font-bold ${edaData.data_quality.total_missing > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {edaData.data_quality.total_missing}
                      </p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm font-medium text-muted-foreground">Doublons</p>
                      <p className={`text-2xl font-bold ${edaData.data_quality.duplicate_rows > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {edaData.data_quality.duplicate_rows}
                      </p>
                    </Card>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Correlation Heatmap */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-6">Matrice de Corrélation</h3>
                      <div className="h-[400px]">
                        <Plot
                          data={[
                            {
                              z: edaData.correlation_matrix.data,
                              x: edaData.correlation_matrix.columns,
                              y: edaData.correlation_matrix.columns,
                              type: 'heatmap',
                              colorscale: 'RdBu',
                              zmin: -1,
                              zmax: 1
                            }
                          ]}
                          layout={{
                            autosize: true,
                            margin: { t: 0, b: 50, l: 100, r: 20 },
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#888' }
                          }}
                          useResizeHandler={true}
                          className="w-full h-full"
                          config={{ responsive: true, displayModeBar: false }}
                        />
                      </div>
                    </Card>

                    {/* Distributions View */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-6">Distributions des Variables</h3>
                      <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                        {Object.entries(edaData.distributions).map(([name, dist]: [string, any]) => (
                          <div key={name} className="space-y-2 border-b pb-4 last:border-0">
                            <p className="text-sm font-medium capitalize">{name}</p>
                            <div className="h-[120px]">
                              <Plot
                                data={[
                                  {
                                    x: dist.labels,
                                    y: dist.counts,
                                    type: 'bar',
                                    marker: { color: dist.type === 'numeric' ? '#4F46E5' : '#10B981' }
                                  }
                                ]}
                                layout={{
                                  autosize: true,
                                  margin: { t: 0, b: 20, l: 30, r: 10 },
                                  paper_bgcolor: 'rgba(0,0,0,0)',
                                  plot_bgcolor: 'rgba(0,0,0,0)',
                                  showlegend: false,
                                  font: { size: 10, color: '#999' }
                                }}
                                useResizeHandler={true}
                                className="w-full h-full"
                                config={{ responsive: true, displayModeBar: false }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Stats Table */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Statistiques Descriptives</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-left">
                          <tr>
                            <th className="p-3 font-medium">Colonne</th>
                            <th className="p-3 font-medium">Type</th>
                            <th className="p-3 font-medium">Unique</th>
                            <th className="p-3 font-medium">Manquant</th>
                            <th className="p-3 font-medium">Moyenne / Top</th>
                            <th className="p-3 font-medium">Min</th>
                            <th className="p-3 font-medium">Max</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {edaData.descriptive_stats.map((col: any) => (
                            <tr key={col.name} className="hover:bg-muted/50 transition-colors">
                              <td className="p-3 font-medium">{col.name}</td>
                              <td className="p-3 text-muted-foreground">{col.type}</td>
                              <td className="p-3">{col.unique_count}</td>
                              <td className="p-3">
                                <Badge variant={col.missing_count > 0 ? 'outline' : 'secondary'} className={col.missing_count > 0 ? 'text-orange-500' : ''}>
                                  {col.missing_count} ({col.missing_pct.toFixed(1)}%)
                                </Badge>
                              </td>
                              <td className="p-3">{col.mean !== undefined ? col.mean.toFixed(2) : col.top}</td>
                              <td className="p-3">{col.min !== undefined ? col.min.toFixed(2) : '-'}</td>
                              <td className="p-3">{col.max !== undefined ? col.max.toFixed(2) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              ) : (
                <div className="flex items-center justify-center p-20">
                  <p className="text-lg text-muted-foreground animate-pulse">Calcul de l'analyse exploratoire en cours...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  threshold,
  status,
  description,
  groups
}: {
  title: string
  value: number
  threshold: number
  status: 'success' | 'warning' | 'critical'
  description: string
  groups: { name: string; value: number; total: number }[]
}) {
  const statusColors = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  }

  const statusBadges = {
    success: <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">Conforme</Badge>,
    warning: <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10">Attention</Badge>,
    critical: <Badge variant="destructive">Critique</Badge>
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {statusBadges[status]}
      </div>

      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <p className={`text-4xl font-bold ${statusColors[status]}`}>
            {(value * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            / Seuil {(threshold * 100)}%
          </p>
        </div>

        <div className="space-y-2">
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{group.name}</span>
                <span className="font-medium">{group.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${group.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function AnalysisItem({
  type,
  title,
  description,
  metric
}: {
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  metric: string
}) {
  const icons = {
    critical: <AlertTriangle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <CheckCircle2 className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="flex gap-3 rounded-lg border border-border p-4">
      {icons[type]}
      <div className="flex-1 space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs font-mono text-muted-foreground">{metric}</p>
      </div>
    </div>
  )
}

function GroupPerformance({
  name,
  accepted,
  total,
  avgScore,
  color
}: {
  name: string
  accepted: number
  total: number
  avgScore: number
  color: string
}) {
  const rate = (accepted / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">
          {accepted}/{total} acceptés
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Taux d'acceptation: {rate.toFixed(1)}%</span>
        <span>Score moyen: {avgScore}</span>
      </div>
    </div>
  )
}

function IntersectionalCard({
  group,
  rate,
  status
}: {
  group: string
  rate: number
  status: 'success' | 'warning' | 'critical'
}) {
  const statusColors = {
    success: 'border-green-500/50 bg-green-500/5',
    warning: 'border-yellow-500/50 bg-yellow-500/5',
    critical: 'border-red-500/50 bg-red-500/5'
  }

  return (
    <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
      <p className="text-sm font-medium mb-2">{group}</p>
      <p className="text-2xl font-bold">{rate}%</p>
      <p className="text-xs text-muted-foreground mt-1">Taux d'acceptation</p>
    </div>
  )
}

function RecommendationCard({
  priority,
  title,
  description,
  impact,
  effort,
  technique,
  audit
}: {
  priority: 'critical' | 'high' | 'medium'
  title: string
  description: string
  impact: string
  effort: string
  technique: string
  audit: any
}) {
  const priorityBadges = {
    critical: <Badge variant="destructive">Priorité critique</Badge>,
    high: <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/10">Priorité haute</Badge>,
    medium: <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10">Priorité moyenne</Badge>
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {priorityBadges[priority]}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{impact}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-secondary" />
          <span className="text-muted-foreground">Effort: {effort}</span>
        </div>
        <div>
          <Badge variant="outline">{technique}</Badge>
        </div>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2"
        onClick={() => {
          const target = audit.target_column || 'target'
          const sensitive = (audit.sensitive_attributes && audit.sensitive_attributes[0]) || 'sensitive_attr'
          const tech = technique?.toLowerCase().replace('-', '') || 'inprocessing'
          
          let snippet = ''

          if (tech === 'preprocessing') {
            snippet = `
# Strategie: Pre-processing (Correlation Remover)
from fairlearn.preprocessing import CorrelationRemover

# Charger vos donnees
df = pd.read_csv('votre_dataset.csv')
target_column = '${target}'
sensitive_column = '${sensitive}'

# Selectionner les features a traiter (exclure sensitive et target)
X = df.drop(columns=[target_column, sensitive_column])

# Supprimer la correlation indirecte
remover = CorrelationRemover(sensitive_feature_ids=[sensitive_column], alpha=1.0)
X_transformed = remover.fit_transform(X)

print('Correlation supprimee avec succes!')`
          } else if (tech === 'postprocessing') {
            snippet = `
# Strategie: Post-processing (Threshold Optimizer)
from fairlearn.postprocessing import ThresholdOptimizer

# Charger votre modele deja entraine 'base_model'
# threshold_optimizer = ThresholdOptimizer(
#     estimator=base_model,
#     constraints='demographic_parity',
#     predict_method='predict_proba'
# )

# threshold_optimizer.fit(X, y, sensitive_features=df['${sensitive}'])
# y_pred = threshold_optimizer.predict(X, sensitive_features=df['${sensitive}'])

print('Optimisation des seuils par groupe preparee!')`
          } else {
            snippet = `
# Strategie: In-processing (Exponentiated Gradient)
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
from sklearn.linear_model import LogisticRegression

# Parametres
target_column = '${target}'
sensitive_column = '${sensitive}'

mitigator = ExponentiatedGradient(
    LogisticRegression(max_iter=1000),
    constraints=DemographicParity()
)

# mitigator.fit(X, y, sensitive_features=df[sensitive_column])
print('Optimisation sous contraintes (Fairlearn) initialisee!')`
          }

          const pythonCode = `# Recommandation: ${title}
# Description: ${description}
# Technique: ${technique}

import pandas as pd
import numpy as np
${snippet}

# Note: Ce code est un guide. Assurez-vous d'avoir installe 'fairlearn'.
`
          const blob = new Blob([pythonCode], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `mitigation_${title.toLowerCase().replace(/\s+/g, '_')}.py`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }}
      >
        <Download className="h-4 w-4" />
        Télécharger le code Python
      </Button>
    </Card>
  )
}

function ActionItem({
  status,
  title,
  assignee,
  deadline
}: {
  status: 'completed' | 'in-progress' | 'pending'
  title: string
  assignee: string
  deadline: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded border-2 border-primary" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{assignee}</p>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{deadline}</span>
    </div>
  )
}
