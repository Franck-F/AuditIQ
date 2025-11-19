'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, CheckCircle2, AlertTriangle, FileText, Download, ExternalLink } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">État de conformité</h1>
            <p className="text-muted-foreground">
              Suivez votre conformité aux réglementations AI Act et RGPD
            </p>
          </div>

          {/* Overall Compliance Score */}
          <Card className="p-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Score de conformité global</p>
                <p className="text-5xl font-bold text-gradient">92%</p>
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">
                  Conforme
                </Badge>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Audits conformes</p>
                <p className="text-5xl font-bold">21/24</p>
                <p className="text-sm text-muted-foreground">87.5% de conformité</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Actions en cours</p>
                <p className="text-5xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Plans de mitigation actifs</p>
              </div>
            </div>
          </Card>

          {/* Compliance Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">AI Act</h3>
                  <p className="text-sm text-muted-foreground">Règlement européen sur l'IA</p>
                </div>
              </div>

              <div className="space-y-4">
                <ComplianceItem
                  title="Article 10 - Transparence"
                  status="compliant"
                  progress={100}
                  description="Documentation technique complète et accessible"
                />
                <ComplianceItem
                  title="Article 13 - Gouvernance des données"
                  status="compliant"
                  progress={100}
                  description="Qualité et représentativité des données validées"
                />
                <ComplianceItem
                  title="Article 14 - Enregistrement des activités"
                  status="warning"
                  progress={85}
                  description="Logs partiellement incomplets (15% manquants)"
                />
                <ComplianceItem
                  title="Article 15 - Précision et robustesse"
                  status="compliant"
                  progress={95}
                  description="Métriques de performance validées"
                />
              </div>

              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Documentation AI Act
              </Button>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">RGPD</h3>
                  <p className="text-sm text-muted-foreground">Règlement général sur la protection des données</p>
                </div>
              </div>

              <div className="space-y-4">
                <ComplianceItem
                  title="Article 22 - Décisions automatisées"
                  status="compliant"
                  progress={100}
                  description="Transparence et droit d'opposition garantis"
                />
                <ComplianceItem
                  title="Article 5 - Minimisation des données"
                  status="compliant"
                  progress={100}
                  description="Collecte limitée au strict nécessaire"
                />
                <ComplianceItem
                  title="Article 25 - Privacy by design"
                  status="compliant"
                  progress={98}
                  description="Sécurité intégrée dès la conception"
                />
                <ComplianceItem
                  title="Article 32 - Sécurité"
                  status="compliant"
                  progress={100}
                  description="Chiffrement AES-256, hébergement UE"
                />
              </div>

              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Documentation RGPD
              </Button>
            </Card>
          </div>

          {/* Actions Required */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Actions requises</h3>
            <div className="space-y-3">
              <ActionCard
                priority="high"
                title="Compléter les logs d'activité"
                description="15% des logs manquants pour l'Article 14 AI Act"
                deadline="Dans 7 jours"
              />
              <ActionCard
                priority="medium"
                title="Mise à jour documentation technique"
                description="Ajouter les nouvelles métriques de fairness dans la documentation"
                deadline="Dans 14 jours"
              />
            </div>
          </Card>

          {/* Resources */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Ressources et documentation</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <ResourceLink
                title="Guide complet AI Act"
                description="Tout ce qu'il faut savoir sur le règlement européen"
                href="#"
              />
              <ResourceLink
                title="Checklist RGPD"
                description="Liste de contrôle pour la conformité RGPD"
                href="#"
              />
              <ResourceLink
                title="Templates de documentation"
                description="Modèles prêts à l'emploi pour vos rapports"
                href="#"
              />
              <ResourceLink
                title="Veille réglementaire"
                description="Dernières mises à jour et nouveautés"
                href="#"
              />
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

function ComplianceItem({
  title,
  status,
  progress,
  description
}: {
  title: string
  status: 'compliant' | 'warning' | 'non-compliant'
  progress: number
  description: string
}) {
  const statusIcons = {
    compliant: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    'non-compliant': <AlertTriangle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {statusIcons[status]}
            <p className="font-semibold">{title}</p>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

function ActionCard({
  priority,
  title,
  description,
  deadline
}: {
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  deadline: string
}) {
  const priorityBadges = {
    high: <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/10">Priorité haute</Badge>,
    medium: <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10">Priorité moyenne</Badge>,
    low: <Badge variant="outline">Priorité basse</Badge>
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {priorityBadges[priority]}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">Échéance : {deadline}</p>
      </div>
      <Button size="sm">Traiter</Button>
    </div>
  )
}

function ResourceLink({
  title,
  description,
  href
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent"
    >
      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
    </a>
  )
}
