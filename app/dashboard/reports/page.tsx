'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, FileText, Shield, Eye, Calendar, Plus } from 'lucide-react'
import { reportService } from '@/services/reportService'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false) // Initially false as we don't have a list endpoint yet

  const handleGenerate = async (auditId: number) => {
    try {
      await reportService.generate(auditId)
      // Refresh list or show notification
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Rapports de conformité</h1>
              <p className="text-muted-foreground">
                Générez et téléchargez vos rapports AI Act et RGPD
              </p>
            </div>
            <Button className="gap-2 glow-primary">
              <Plus className="h-4 w-4" />
              Générer un rapport
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Rapport AI Act</h3>
                  <p className="text-sm text-muted-foreground">Article 10</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Générer
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Rapport RGPD</h3>
                  <p className="text-sm text-muted-foreground">Article 22</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Générer
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent p-3">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Rapport exécutif</h3>
                  <p className="text-sm text-muted-foreground">Synthèse 2-3 pages</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Générer
              </Button>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Tabs defaultValue="generated" className="space-y-6">
            <TabsList>
              <TabsTrigger value="generated">Rapports générés</TabsTrigger>
              <TabsTrigger value="scheduled">Rapports programmés</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="generated" className="space-y-4">
              {/* TODO: Fetch real reports list from API */}
              <div className="text-center py-8 text-muted-foreground">
                Fonctionnalité de liste des rapports en cours d'intégration.
                <br />
                Veuillez utiliser la page d'un audit spécifique pour générer son rapport.
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              <ScheduledReportCard
                title="Rapport mensuel de conformité"
                frequency="Mensuel"
                nextGeneration="1er février 2025"
                recipients="compliance@entreprise.com"
              />
              <ScheduledReportCard
                title="Rapport hebdomadaire d'audits"
                frequency="Hebdomadaire"
                nextGeneration="Lundi prochain"
                recipients="team@entreprise.com"
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <TemplateCard
                  title="Template AI Act"
                  description="Rapport de conformité AI Act Article 10 avec méthodologie complète"
                  pages={12}
                />
                <TemplateCard
                  title="Template RGPD"
                  description="Rapport RGPD Article 22 sur les décisions automatisées"
                  pages={8}
                />
                <TemplateCard
                  title="Template exécutif"
                  description="Synthèse exécutive avec indicateurs clés et recommandations"
                  pages={3}
                />
                <TemplateCard
                  title="Template technique"
                  description="Rapport technique détaillé avec méthodologie et annexes"
                  pages={20}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function ReportCard({
  title,
  type,
  date,
  size,
  status
}: {
  title: string
  type: string
  date: string
  size: string
  status: 'ready' | 'generating' | 'failed'
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{type}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date}
              </div>
              <span>•</span>
              <span>{size}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">
            Prêt
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ScheduledReportCard({
  title,
  frequency,
  nextGeneration,
  recipients
}: {
  title: string
  frequency: string
  nextGeneration: string
  recipients: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-secondary/10 p-3">
            <Calendar className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{frequency}</span>
              <span>•</span>
              <span>Prochaine génération : {nextGeneration}</span>
              <span>•</span>
              <span>{recipients}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Actif</Badge>
          <Button variant="ghost" size="sm">
            Modifier
          </Button>
        </div>
      </div>
    </Card>
  )
}

function TemplateCard({
  title,
  description,
  pages
}: {
  title: string
  description: string
  pages: number
}) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-muted p-3">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <p className="text-xs text-muted-foreground">{pages} pages</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Prévisualiser
        </Button>
        <Button size="sm" className="flex-1">
          Utiliser
        </Button>
      </div>
    </Card>
  )
}
