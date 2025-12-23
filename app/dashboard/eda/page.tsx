'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, Database, BarChart3, AlertTriangle, Eye } from 'lucide-react'
import Link from 'next/link'
import { edaService, type MorningReport, type EDADataSource } from '@/services/edaService'

export default function EDADashboard() {
  const [latestReport, setLatestReport] = useState<MorningReport | null>(null)
  const [dataSources, setDataSources] = useState<EDADataSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [report, sources] = await Promise.all([
        edaService.getLatestReport(),
        edaService.getDataSources()
      ])
      setLatestReport(report)
      setDataSources(sources)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <DashboardHeader />
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Auto EDA</h1>
              <p className="text-muted-foreground">
                Analyse exploratoire automatique et détection d'anomalies
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/eda/sources/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Source
              </Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sources Actives</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dataSources.filter(s => s.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {dataSources.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anomalies Critiques</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestReport?.metadata.critical_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Dernières 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anomalies Importantes</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestReport?.metadata.high_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Nécessitent attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestReport?.metadata.total_anomalies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes sévérités
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Morning Report */}
          {latestReport && latestReport.findings && latestReport.findings.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rapport du Jour</CardTitle>
                  <CardDescription>{latestReport.title}</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/eda/analyses/${latestReport.metadata.analysis_id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{latestReport.summary}</p>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Top 3 Anomalies</h3>
                  {latestReport.findings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant={
                          finding.severity === 'critical' ? 'destructive' :
                          finding.severity === 'high' ? 'default' :
                          'secondary'
                        }>
                          #{finding.rank}
                        </Badge>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{finding.metric}</p>
                          <Badge variant="outline">{finding.severity}</Badge>
                        </div>
                        {finding.dimension && (
                          <p className="text-sm text-muted-foreground">
                            {finding.dimension}: {finding.dimension_value}
                          </p>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Observé:</span>{' '}
                            <span className="font-medium">{finding.observed}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Attendu:</span>{' '}
                            <span className="font-medium">{finding.expected}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Écart:</span>{' '}
                            <span className="font-medium">{finding.deviation}</span>
                          </div>
                        </div>
                        {finding.probable_cause && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <p className="font-medium">Cause probable:</p>
                            <p className="text-muted-foreground">{finding.probable_cause}</p>
                            {finding.confidence && (
                              <p className="text-xs mt-1">Confiance: {finding.confidence}%</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {latestReport.recommendations && latestReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Recommandations</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {latestReport.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <Link href="/dashboard/eda/sources">
                <CardHeader>
                  <CardTitle className="text-lg">Sources de Données</CardTitle>
                  <CardDescription>Gérer vos sources d'ingestion</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{dataSources.length}</p>
                  <p className="text-xs text-muted-foreground">sources configurées</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <Link href="/dashboard/eda/analyses">
                <CardHeader>
                  <CardTitle className="text-lg">Analyses</CardTitle>
                  <CardDescription>Historique des analyses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Voir l'historique
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Nouvelle Analyse</CardTitle>
                <CardDescription>Lancer une analyse manuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Démarrer
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
