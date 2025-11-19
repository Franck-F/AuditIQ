'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, BarChart3, Clock, ArrowRight } from 'lucide-react'

export default function AuditsPage() {
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
                Gérez et consultez l'historique de vos audits de fairness
              </p>
            </div>
            <Link href="/dashboard/upload">
              <Button className="gap-2 glow-primary">
                <Plus className="h-4 w-4" />
                Nouvel audit
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-10" />
              </div>
              <Select defaultValue="all">
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
                  <SelectItem value="support">Support client</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Plus de filtres
              </Button>
            </div>
          </Card>

          {/* Audits List */}
          <div className="space-y-4">
            <Link href="/dashboard/audits/1">
              <AuditCard
                name="Système de scoring crédit"
                usecase="Scoring client"
                score={72}
                status="critical"
                date="Il y a 2 heures"
                biases={3}
              />
            </Link>
            <Link href="/dashboard/audits/2">
              <AuditCard
                name="Tri de CV automatisé"
                usecase="Recrutement"
                score={94}
                status="compliant"
                date="Il y a 1 jour"
                biases={0}
              />
            </Link>
            <Link href="/dashboard/audits/3">
              <AuditCard
                name="Priorisation tickets support"
                usecase="Service client"
                score={85}
                status="warning"
                date="Il y a 3 jours"
                biases={1}
              />
            </Link>
            <Link href="/dashboard/audits/4">
              <AuditCard
                name="Segmentation clients"
                usecase="Marketing"
                score={91}
                status="compliant"
                date="Il y a 5 jours"
                biases={0}
              />
            </Link>
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
