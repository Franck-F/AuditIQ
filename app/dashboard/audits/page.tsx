'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, BarChart3, Clock, ArrowRight, AlertTriangle, Target } from 'lucide-react'
import { auditService } from '../../../services/auditService'

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditsData, statsData] = await Promise.all([
          auditService.getAll(),
          auditService.getStats()
        ])
        setAudits(auditsData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          audit.use_case?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const risk = !audit.score || audit.score === 0 ? 'warning' :
                 audit.score >= 80 ? 'compliant' :
                 audit.score >= 60 ? 'warning' : 'critical'
    
    const matchesStatus = statusFilter === 'all' || risk === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Tous les audits</h1>
              <p className="text-muted-foreground">
                Gerez et consultez l'historique de vos audits de fairness
              </p>
            </div>
            <Link href="/dashboard/upload">
              <Button className="gap-2 glow-primary">
                <Plus className="h-4 w-4" />
                Nouvel audit
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Audits Totaux</p>
                  <p className="text-2xl font-bold">{stats?.total_audits || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-500/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Audits Critiques</p>
                  <p className="text-2xl font-bold">{stats?.critical_biases || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score d'Equite Moyen</p>
                  <p className="text-2xl font-bold">{stats?.avg_fairness_score || 0}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="warning">Attention</SelectItem>
                  <SelectItem value="compliant">Conforme</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Cas d'usage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cas</SelectItem>
                  <SelectItem value="recruitment">Recrutement</SelectItem>
                  <SelectItem value="scoring">Scoring</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </Card>

          {/* Audits List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredAudits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun audit trouve</div>
            ) : (
              filteredAudits.map((audit) => (
                <Link key={audit.id} href={`/dashboard/audits/${audit.id}`}>
                  <AuditCard
                    name={audit.name || `Audit #${audit.id}`}
                    usecase={audit.use_case || 'General'}
                    score={audit.score ? Math.round(audit.score) : 0}
                    status={
                      !audit.score || audit.score === 0 ? 'warning' :
                      audit.score >= 80 ? 'compliant' :
                      audit.score >= 60 ? 'warning' :
                      'critical'
                    }
                    date={new Date(audit.created_at).toLocaleDateString()}
                    biases={audit.critical_bias_count || 0}
                  />
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function AuditCard({
  name,
  usecase,
  score,
  status,
  date,
  biases
}: {
  name: string
  usecase: string
  score: number
  status: 'critical' | 'warning' | 'compliant'
  date: string
  biases: number
}) {
  const statusBadges = {
    critical: <Badge variant="destructive">Critique</Badge>,
    warning: <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10">Attention</Badge>,
    compliant: <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">Conforme</Badge>
  }

  const statusColors = {
    critical: 'text-red-500',
    warning: 'text-yellow-500',
    compliant: 'text-green-500'
  }

  return (
    <Card className="p-6 transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="rounded-lg bg-primary/10 p-3">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{name}</h3>
              {statusBadges[status]}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{usecase}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {date}
              </div>
              {biases > 0 && (
                <>
                  <span>•</span>
                  <span>{biases} biais détecté{biases > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className={`text-3xl font-bold ${statusColors[status]}`}>{score}%</p>
            <p className="text-sm text-muted-foreground">Score d'équité</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}
