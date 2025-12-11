'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, FileText, Shield, Eye, Calendar, Plus, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { reportService, type Report } from '@/services/reportService'
import { useToast } from '@/hooks/use-toast'
import { API_URL } from '@/lib/config/api'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reportsData, auditsData] = await Promise.all([
        reportService.getAll().catch(() => []),
        fetch(`${API_URL}/audits`, { credentials: 'include' })
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      ])
      setReports(reportsData)
      setAudits(auditsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (auditId: number, reportType: string) => {
    try {
      setGenerating(true)
      await reportService.generate(auditId, reportType)
      toast({
        title: "Rapport généré",
        description: "Le rapport a été généré avec succès",
      })
      loadData() // Refresh list
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async (report: Report) => {
    try {
      const blob = await reportService.download(report.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport_${report.id}_${report.report_type}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Téléchargement réussi",
        description: "Le rapport a été téléchargé",
      })
    } catch (error) {
      console.error('Failed to download report:', error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le rapport",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <DashboardHeader />
          <main className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    )
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
              <Button 
                variant="outline" 
                className="w-full gap-2"
                disabled={audits.length === 0 || generating}
                onClick={() => audits.length > 0 && handleGenerate(audits[0].id, 'ai_act')}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {audits.length > 0 ? 'Générer' : 'Aucun audit'}
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
              <Button 
                variant="outline" 
                className="w-full gap-2"
                disabled={audits.length === 0 || generating}
                onClick={() => audits.length > 0 && handleGenerate(audits[0].id, 'rgpd')}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {audits.length > 0 ? 'Générer' : 'Aucun audit'}
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
              <Button 
                variant="outline" 
                className="w-full gap-2"
                disabled={audits.length === 0 || generating}
                onClick={() => audits.length > 0 && handleGenerate(audits[0].id, 'executive')}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {audits.length > 0 ? 'Générer' : 'Aucun audit'}
              </Button>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Tabs defaultValue="generated" className="space-y-6">
            <TabsList>
              <TabsTrigger value="generated">Rapports générés ({reports.length})</TabsTrigger>
              <TabsTrigger value="audits">Audits disponibles ({audits.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="generated" className="space-y-4">
              {reports.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Aucun rapport généré</h3>
                    <p className="text-sm">
                      Générez votre premier rapport en utilisant les boutons ci-dessus
                    </p>
                  </div>
                </Card>
              ) : (
                reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onDownload={() => handleDownload(report)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="audits" className="space-y-4">
              {audits.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Aucun audit disponible</h3>
                    <p className="text-sm mb-4">
                      Créez votre premier audit pour générer des rapports
                    </p>
                    <Button>Créer un audit</Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {audits.map((audit) => (
                    <Card key={audit.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">{audit.name || `Audit #${audit.id}`}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Score: {audit.score || 'N/A'}%</span>
                            <span>•</span>
                            <span>{new Date(audit.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={generating}
                            onClick={() => handleGenerate(audit.id, 'comprehensive')}
                          >
                            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                            Générer rapport
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function ReportCard({ report, onDownload }: { report: Report; onDownload: () => void }) {
  const getStatusIcon = () => {
    switch (report.status) {
      case 'ready':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'generating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (report.status) {
      case 'ready':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">Prêt</Badge>
      case 'generating':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10">En cours</Badge>
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>
      default:
        return <Badge variant="outline">En attente</Badge>
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              {report.audit_name || `Audit #${report.audit_id}`} - {report.report_type}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(report.generated_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
          {report.status === 'ready' && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onDownload}>
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
