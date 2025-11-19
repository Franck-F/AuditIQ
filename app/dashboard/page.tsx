import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Upload, FileText, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de vos audits de fairness et conformité
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Score d'équité moyen"
              value="87%"
              change="+5% ce mois"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Audits réalisés"
              value="24"
              change="+12 ce mois"
              changeType="positive"
              icon={BarChart3}
            />
            <StatCard
              title="Biais détectés"
              value="3"
              change="2 critiques"
              changeType="negative"
              icon={AlertTriangle}
            />
            <StatCard
              title="Conformité"
              value="92%"
              change="AI Act + RGPD"
              changeType="positive"
              icon={CheckCircle2}
            />
          </div>

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
                <AuditItem
                  name="Système de scoring crédit"
                  status="Critique"
                  score={72}
                  date="Il y a 2 heures"
                  statusColor="text-red-500"
                />
                <AuditItem
                  name="Tri de CV automatisé"
                  status="Conforme"
                  score={94}
                  date="Il y a 1 jour"
                  statusColor="text-green-500"
                />
                <AuditItem
                  name="Priorisation tickets support"
                  status="En cours"
                  score={85}
                  date="Il y a 3 jours"
                  statusColor="text-yellow-500"
                />
                <AuditItem
                  name="Segmentation clients"
                  status="Conforme"
                  score={91}
                  date="Il y a 5 jours"
                  statusColor="text-green-500"
                />
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
                  status="Conforme"
                  progress={100}
                />
                <ComplianceItem
                  title="RGPD Article 22"
                  status="Conforme"
                  progress={100}
                />
                <ComplianceItem
                  title="Documentation technique"
                  status="À jour"
                  progress={92}
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
