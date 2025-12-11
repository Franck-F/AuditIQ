'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Upload, FileText, ArrowRight, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { API_URL } from '@/lib/config/api'

interface DashboardStats {
  total_audits: number
  avg_fairness_score: number
  critical_biases: number
  compliance_rate: number
  recent_audits_count: number
  audits_this_month: number
}

interface RecentAudit {
  id: number
  name: string
  status: string
  score: number
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAudits, setRecentAudits] = useState<RecentAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer stats
      const statsResponse = await fetch(`${API_URL}/audits/stats`, {
        credentials: 'include'
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else if (statsResponse.status === 401) {
        // Not authenticated - will be handled by middleware
        setError('Non authentifié')
      } else {
        setStats({
          total_audits: 0,
          avg_fairness_score: 0,
          critical_biases: 0,
          compliance_rate: 0,
          recent_audits_count: 0,
          audits_this_month: 0
        })
      }

      // Récupérer recent audits
      const auditsResponse = await fetch(`${API_URL}/audits`, {
        credentials: 'include'
      })

      if (auditsResponse.ok) {
        const auditsData = await auditsResponse.json()
        console.log('Audits fetched:', auditsData)  // Debug
        setRecentAudits(auditsData.slice(0, 4))
      } else {
        console.error('Failed to fetch audits:', auditsResponse.status)
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      // Use default values on erreur
      setStats({
        total_audits: 0,
        avg_fairness_score: 0,
        critical_biases: 0,
        compliance_rate: 0,
        recent_audits_count: 0,
        audits_this_month: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure'
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`
    return `Il y a ${Math.floor(diffInDays / 30)} mois`
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Vue d'overview de vos audits de fairness et conformité
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Score d'équité moyen"
                value={stats ? `${Math.round(stats.avg_fairness_score)}%` : '0%'}
                change={stats && stats.audits_this_month > 0 ? `+${stats.audits_this_month} ce mois` : 'Aucun audit ce mois'}
                changeType={stats && stats.avg_fairness_score >= 80 ? "positive" : "negative"}
                icon={TrendingUp}
              />
              <StatCard
                title="Audits réalisés"
                value={stats ? stats.total_audits.toString() : '0'}
                change={stats && stats.audits_this_month > 0 ? `+${stats.audits_this_month} ce mois` : 'Aucun ce mois'}
                changeType="positive"
                icon={BarChart3}
              />
              <StatCard
                title="Biais détectés"
                value={stats ? stats.critical_biases.toString() : '0'}
                change={stats && stats.critical_biases > 0 ? `${stats.critical_biases} critiques` : 'Aucun critique'}
                changeType={stats && stats.critical_biases > 0 ? "negative" : "positive"}
                icon={AlertTriangle}
              />
              <StatCard
                title="Conformité"
                value={stats ? `${Math.round(stats.compliance_rate)}%` : '0%'}
                change="AI Act + RGPD"
                changeType={stats && stats.compliance_rate >= 90 ? "positive" : "negative"}
                icon={CheckCircle2}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nouvel audit</h3>
                    <p className="text-sm text-muted-foreground">
                      Uploadez vos données pour commencer
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/upload">
                  <Button className="w-full gap-2">
                    Créer un audit
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Rapports de conformité</h3>
                    <p className="text-sm text-muted-foreground">
                      Générez vos rapports AI Act
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/reports">
                  <Button variant="outline" className="w-full gap-2">
                    Voir les rapports
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Audits */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Audits récents</h3>
                <Link href="/dashboard/audits">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentAudits.length > 0 ? (
                  recentAudits.map((audit) => {
                    const score = audit.score || 0
                    const status = score >= 90 ? 'Conforme' : score >= 70 ? 'Acceptable' : 'Critique'
                    const statusColor = score >= 90 ? 'text-green-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500'
                    const timeAgo = getTimeAgo(audit.created_at)
                    
                    return (
                      <AuditItem
                        key={audit.id}
                        name={audit.name || `Audit #${audit.id}`}
                        status={status}
                        score={score}
                        date={timeAgo}
                        statusColor={statusColor}
                      />
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun audit récent</p>
                    <Link href="/dashboard/upload">
                      <Button variant="outline" className="mt-4">
                        Créer votre premier audit
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Compliance Status */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">État de conformité</h3>
              <div className="space-y-4">
                <ComplianceItem
                  title="AI Act Article 10"
                  status={stats && stats.compliance_rate >= 90 ? "Conforme" : stats && stats.compliance_rate >= 70 ? "Partiel" : "Non conforme"}
                  progress={stats ? Math.round(stats.compliance_rate) : 0}
                />
                <ComplianceItem
                  title="RGPD Article 22"
                  status={stats && stats.compliance_rate >= 85 ? "Conforme" : "À améliorer"}
                  progress={stats ? Math.min(100, Math.round(stats.compliance_rate * 1.1)) : 0}
                />
                <ComplianceItem
                  title="Documentation technique"
                  status={stats && stats.total_audits > 0 ? "À jour" : "Manquante"}
                  progress={stats && stats.total_audits > 0 ? Math.min(100, stats.total_audits * 10) : 0}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Alertes et recommandations</h3>
              <div className="space-y-3">
                <AlertItem
                  type="critical"
                  message="Biais détecté sur le système de scoring crédit"
                  time="Il y a 2 heures"
                />
                <AlertItem
                  type="warning"
                  message="Audit programmé pour le système RH dans 3 jours"
                  time="Aujourd'hui"
                />
                <AlertItem
                  type="info"
                  message="Nouveau rapport de conformité disponible"
                  time="Hier"
                />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

function AuditItem({
  name,
  status,
  score,
  date,
  statusColor
}: {
  name: string
  status: string
  score: number
  date: string
  statusColor: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-muted p-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-2xl font-bold">{score}%</p>
          <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  )
}

function ComplianceItem({
  title,
  status,
  progress
}: {
  title: string
  status: string
  progress: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground">{status}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function AlertItem({
  type,
  message,
  time
}: {
  type: 'critical' | 'warning' | 'info'
  message: string
  time: string
}) {
  const colors = {
    critical: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  return (
    <div className="flex gap-3 rounded-lg border border-border p-3">
      <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${colors[type]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
