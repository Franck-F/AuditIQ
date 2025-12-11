'use client'

import { useState, useEffect, use } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Download, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, BarChart3, Users, Target, Sparkles } from 'lucide-react'
import { auditService } from '@/services/auditService'

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const data = await auditService.getById(parseInt(id))
        setAudit(data)
      } catch (error) {
        console.error('Failed to fetch audit:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAudit()
  }, [id])

  if (loading) return <div className="p-6">Chargement...</div>
  if (!audit) return <div className="p-6">Audit non trouvé</div>

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
                {audit.score && audit.score < 80 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Biais critiques
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Audit réalisé le {new Date(audit.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Rapport PDF
              </Button>
              <Button className="gap-2 glow-primary">
                <Sparkles className="h-4 w-4" />
                Appliquer corrections
              </Button>
            </div>
          </div>

          {/* Global Score */}
          <Card className="p-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Score d'équité global</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold text-gradient">72%</p>
                  <Badge variant="destructive" className="mb-2">Critique</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Seuil minimal : 80%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conformité réglementaire</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold">68%</p>
                  <div className="flex items-center gap-1 text-red-500 mb-2">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">Non conforme</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">AI Act Article 10</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Biais détectés</p>
                <p className="text-5xl font-bold">3</p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    2 critiques
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-500">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    1 modéré
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
                Métriques
              </TabsTrigger>
              <TabsTrigger value="groups" className="gap-2">
                <Users className="h-4 w-4" />
                Groupes
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Target className="h-4 w-4" />
                Recommandations
              </TabsTrigger>
            </TabsList>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <MetricCard
                  title="Demographic Parity"
                  value={0.65}
                  threshold={0.8}
                  status="critical"
                  description="Disparité dans les taux d'acceptation entre groupes"
                  groups={[
                    { name: 'Hommes', value: 85, total: 100 },
                    { name: 'Femmes', value: 55, total: 100 }
                  ]}
                />
                <MetricCard
                  title="Equal Opportunity"
                  value={0.72}
                  threshold={0.8}
                  status="warning"
                  description="Écart dans les vrais positifs entre groupes"
                  groups={[
                    { name: 'Groupe A', value: 78, total: 100 },
                    { name: 'Groupe B', value: 56, total: 100 }
                  ]}
                />
                <MetricCard
                  title="Equalized Odds"
                  value={0.89}
                  threshold={0.8}
                  status="success"
                  description="Équilibre des faux positifs et négatifs"
                  groups={[
                    { name: 'Groupe A', value: 92, total: 100 },
                    { name: 'Groupe B', value: 82, total: 100 }
                  ]}
                />
                <MetricCard
                  title="Predictive Parity"
                  value={0.76}
                  threshold={0.8}
                  status="warning"
                  description="Parité dans la valeur prédictive positive"
                  groups={[
                    { name: 'Groupe A', value: 84, total: 100 },
                    { name: 'Groupe B', value: 64, total: 100 }
                  ]}
                />
              </div>

              {/* Detailed Analysis */}
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Analyse détaillée</h3>
                <div className="space-y-4">
                  <AnalysisItem
                    type="critical"
                    title="Disparité importante dans le scoring"
                    description="Les femmes ont 30% moins de chances d'être acceptées que les hommes à score équivalent"
                    metric="Demographic Parity: 0.65"
                  />
                  <AnalysisItem
                    type="warning"
                    title="Variables proxy détectées"
                    description="La variable 'secteur d'activité' est corrélée à 0.78 avec le genre et influence la décision"
                    metric="Corrélation: 0.78"
                  />
                  <AnalysisItem
                    type="info"
                    title="Performance globale"
                    description="Le modèle a une précision de 87% mais avec des disparités entre groupes"
                    metric="Accuracy: 87%"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance par genre</h3>
                  <div className="space-y-4">
                    <GroupPerformance
                      name="Hommes"
                      accepted={850}
                      total={1000}
                      avgScore={78}
                      color="bg-blue-500"
                    />
                    <GroupPerformance
                      name="Femmes"
                      accepted={550}
                      total={1000}
                      avgScore={76}
                      color="bg-pink-500"
                    />
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Disparate Impact</span>
                      <span className="font-semibold text-red-500">0.65 (Non conforme)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Règle des 80% : Le taux d'acceptation du groupe défavorisé devrait être ≥ 80% du groupe favorisé
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance par âge</h3>
                  <div className="space-y-4">
                    <GroupPerformance
                      name="18-35 ans"
                      accepted={620}
                      total={800}
                      avgScore={75}
                      color="bg-green-500"
                    />
                    <GroupPerformance
                      name="36-55 ans"
                      accepted={710}
                      total={900}
                      avgScore={79}
                      color="bg-yellow-500"
                    />
                    <GroupPerformance
                      name="56+ ans"
                      accepted={245}
                      total={300}
                      avgScore={77}
                      color="bg-orange-500"
                    />
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Disparate Impact</span>
                      <span className="font-semibold text-green-500">0.83 (Conforme)</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Intersectional Analysis */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Analyse intersectionnelle</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Analyse des biais combinés selon plusieurs attributs sensibles
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <IntersectionalCard
                    group="Femmes 18-35 ans"
                    rate={52}
                    status="critical"
                  />
                  <IntersectionalCard
                    group="Hommes 18-35 ans"
                    rate={78}
                    status="success"
                  />
                  <IntersectionalCard
                    group="Femmes 36-55 ans"
                    rate={58}
                    status="warning"
                  />
                  <IntersectionalCard
                    group="Hommes 36-55 ans"
                    rate={82}
                    status="success"
                  />
                  <IntersectionalCard
                    group="Femmes 56+ ans"
                    rate={48}
                    status="critical"
                  />
                  <IntersectionalCard
                    group="Hommes 56+ ans"
                    rate={88}
                    status="success"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommandations prioritaires</h3>
                  <p className="text-sm text-muted-foreground">
                    Actions recommandées par ordre de priorité pour corriger les biais détectés
                  </p>
                </div>

                <div className="space-y-4">
                  <RecommendationCard
                    priority="critical"
                    title="Reweighting des échantillons"
                    description="Appliquer une pondération aux données d'entraînement pour équilibrer les groupes sous-représentés"
                    impact="Amélioration estimée du score : +18%"
                    effort="Moyen"
                    technique="pre-processing"
                  />
                  <RecommendationCard
                    priority="high"
                    title="Ajustement des seuils de décision"
                    description="Calibrer les seuils de décision spécifiquement pour chaque groupe protégé"
                    impact="Amélioration estimée du score : +12%"
                    effort="Faible"
                    technique="post-processing"
                  />
                  <RecommendationCard
                    priority="medium"
                    title="Suppression variable proxy"
                    description="Retirer ou transformer la variable 'secteur d'activité' corrélée au genre"
                    impact="Amélioration estimée du score : +8%"
                    effort="Faible"
                    technique="feature-engineering"
                  />
                  <RecommendationCard
                    priority="medium"
                    title="Resampling stratifié"
                    description="Augmenter les données du groupe minoritaire par sur-échantillonnage"
                    impact="Amélioration estimée du score : +7%"
                    effort="Moyen"
                    technique="pre-processing"
                  />
                </div>
              </Card>

              {/* Action Plan */}
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Plan d'action</h3>
                <div className="space-y-3">
                  <ActionItem
                    status="pending"
                    title="Appliquer le reweighting"
                    assignee="Data Science Team"
                    deadline="Dans 5 jours"
                  />
                  <ActionItem
                    status="pending"
                    title="Ajuster les seuils de décision"
                    assignee="ML Engineering Team"
                    deadline="Dans 7 jours"
                  />
                  <ActionItem
                    status="pending"
                    title="Valider les corrections"
                    assignee="Compliance Officer"
                    deadline="Dans 14 jours"
                  />
                </div>
              </Card>
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
  technique
}: {
  priority: 'critical' | 'high' | 'medium'
  title: string
  description: string
  impact: string
  effort: string
  technique: string
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

      <Button variant="outline" size="sm" className="w-full gap-2">
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
