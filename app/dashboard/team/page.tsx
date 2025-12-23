'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreVertical, Mail, UserPlus, Users, Shield, Trash2, Loader2 } from 'lucide-react'
import { InviteMemberDialog } from '@/components/dashboard/invite-member-dialog'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface TeamMember {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  role: string
  created_at: string
  last_login: string | null
}

interface Organization {
  id: number
  name: string
  slug: string
  members: TeamMember[]
}

export default function TeamPage() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [stats, setStats] = useState({ active_members: 0, pending_invitations: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch organization and members
      const orgRes = await fetch(`${API_URL}/api/team/me`, { credentials: 'include' })
      const statsRes = await fetch(`${API_URL}/api/team/stats`, { credentials: 'include' })
      
      if (orgRes.ok && statsRes.ok) {
        setOrg(await orgRes.json())
        setStats(await statsRes.json())
      } else {
        setError('Erreur lors du chargement des données de l\'équipe')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/team/member/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        toast({ title: "Rôle mis à jour", description: `Le membre est maintenant ${newRole}` })
        fetchData()
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de modifier le rôle", variant: "destructive" })
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Voulez-vous vraiment retirer ce membre de l'équipe ?")) return

    try {
      const res = await fetch(`${API_URL}/api/team/member/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        toast({ title: "Membre retiré", description: "L'utilisateur ne fait plus partie de l'organisation" })
        fetchData()
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de retirer le membre", variant: "destructive" })
    }
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName || !lastName) return "?"
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role.toLowerCase()) {
      case 'admin': return 'destructive'
      case 'member': case 'auditor': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-8 max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Gestion d'Équipe</h1>
              </div>
              <p className="text-muted-foreground">
                Espace de travail : <span className="font-semibold text-foreground">{org?.name || 'Chargement...'}</span>
              </p>
            </div>
            <InviteMemberDialog onSuccess={fetchData} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatsCard label="Membres actifs" value={stats.active_members} icon={<Users className="h-5 w-5" />} />
            <StatsCard label="Invitations en attente" value={stats.pending_invitations} icon={<Mail className="h-5 w-5" />} />
            <StatsCard label="Rôles définis" value={3} icon={<Shield className="h-5 w-5" />} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="p-12 text-center text-destructive border-destructive/20 bg-destructive/5 backdrop-blur-sm">
              <p className="font-medium text-lg">{error}</p>
              <Button variant="ghost" className="mt-4" onClick={fetchData}>Réessayer</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-md">
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-lg font-semibold">Membres de l'organisation</h3>
                <p className="text-sm text-muted-foreground">Les membres de cette liste partagent l'accès aux audits et datasets de l'entreprise.</p>
              </div>
              <div className="divide-y">
                {org?.members.map((member) => (
                  <TeamMemberRow
                    key={member.id}
                    member={member}
                    onUpdateRole={handleUpdateRole}
                    onRemove={handleRemoveMember}
                    initials={getInitials(member.first_name, member.last_name)}
                    badgeVariant={getRoleBadgeVariant(member.role)}
                  />
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

function StatsCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="p-6 transition-all hover:shadow-md border-none ring-1 ring-border/50">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function TeamMemberRow({
  member,
  onUpdateRole,
  onRemove,
  initials,
  badgeVariant
}: {
  member: TeamMember
  onUpdateRole: (id: number, role: string) => void
  onRemove: (id: number) => void
  initials: string
  badgeVariant: any
}) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{member.first_name} {member.last_name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            {member.email}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end gap-1">
          <Badge variant={badgeVariant} className="capitalize">
            {member.role}
          </Badge>
          <p className="text-[10px] text-muted-foreground">Depuis le {new Date(member.created_at).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue={member.role.toLowerCase()} onValueChange={(val) => onUpdateRole(member.id, val)}>
            <SelectTrigger className="w-32 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Membre</SelectItem>
              <SelectItem value="viewer">Lecteur</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onRemove(member.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
