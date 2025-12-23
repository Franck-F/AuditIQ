'use client'

import { useState, useEffect, use } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Database } from 'lucide-react'
import Link from 'next/link'
import { edaService } from '@/services/edaService'

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function EDAResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await edaService.getAnalysis(parseInt(id))
        setAnalysis(data)
      } catch (error) {
        console.error('Failed to fetch EDA result:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )

  if (!analysis) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <div className="p-6 font-bold text-red-500">Analyse non trouvée</div>
      </div>
    </div>
  )

  const edaData = analysis.summary_stats

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/dashboard/eda/analyses" className="hover:text-primary flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux analyses
                </Link>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Analyse EDA #{analysis.id}</h1>
              <p className="text-muted-foreground">
                Générée le {new Date(analysis.analysis_date).toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-3">
              <Badge variant={analysis.status === 'completed' ? 'default' : 'destructive'}>
                {analysis.status}
              </Badge>
            </div>
          </div>

          {!edaData ? (
             <Card className="p-12 text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
                <h3 className="text-xl font-semibold">Aucune donnée statistique</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Cette analyse ne contient pas encore de rapport statistique complet (EDAService). 
                  Relancez l'analyse pour peupler ces données.
                </p>
             </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid gap-6 md:grid-cols-4">
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-medium">Lignes</span>
                  </div>
                  <p className="text-2xl font-bold">{edaData.summary.row_count.toLocaleString()}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Colonnes</span>
                  </div>
                  <p className="text-2xl font-bold">{edaData.summary.col_count}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Données manquantes</span>
                  </div>
                  <p className={`text-2xl font-bold ${edaData.data_quality.total_missing > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                    {edaData.data_quality.total_missing}
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Anomalies</span>
                  </div>
                  <p className="text-2xl font-bold">{analysis.top_anomalies?.length || 0}</p>
                </Card>
              </div>

              {/* Visualizations */}
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

              {/* Anomalies Findings */}
              {analysis.top_anomalies && analysis.top_anomalies.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Top Anomalies Détectées
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {analysis.top_anomalies.map((f: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{f.metric_name}</p>
                          <Badge variant={f.severity === 'critical' ? 'destructive' : 'outline'}>
                            {f.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {f.dimension}: <span className="text-foreground">{f.dimension_value}</span>
                        </p>
                        <div className="flex justify-between text-xs pt-2">
                          <span>Obs: {f.observed_value}</span>
                          <span>Att: {f.expected_value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

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
          )}
        </main>
      </div>
    </div>
  )
}
