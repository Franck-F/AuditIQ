'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreVertical, Mail } from 'lucide-react'
import { InviteMemberDialog } from '@/components/dashboard/invite-member-dialog'
import { useState, useEffect } from 'react'

interface TeamMember {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  last_login: string | null
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchTeamMembers = async () => {
    setLoading(true)
    
    try {
      const res = await fetch(`${API_URL}/api/team/members`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      } else {
        setError('Erreur lors du chargement des membres')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive'
      case 'auditor':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Admin',
      auditor: 'Auditeur',
      reader: 'Lecteur'
    }
    return roles[role.toLowerCase()] || role
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Équipe</h1>
              <p className="text-muted-foreground">Gérez les membres de votre équipe et leurs permissions</p>
            </div>
            <InviteMemberDialog />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Invitations en attente</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{new Set(members.map(m => m.role)).size}</p>
                <p className="text-sm text-muted-foreground">Rôles différents</p>
              </div>
            </Card>
          </div>

          {loading ? (
            <Card className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-6">
              <p className="text-center text-destructive">{error}</p>
            </Card>
          ) : (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Membres de l'équipe</h3>
                <p className="text-sm text-muted-foreground">Gérez les accès et permissions de vos collaborateurs</p>
              </div>
              <div className="space-y-3">
                {members.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    name={`${member.first_name} ${member.last_name}`}
                    email={member.email}
                    role={getRoleLabel(member.role)}
                    roleColor={getRoleBadgeVariant(member.role)}
                    initials={getInitials(member.first_name, member.last_name)}
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

function TeamMemberCard({
  name,
  email,
  role,
  roleColor,
  initials
}: {
  name: string
  email: string
  role: string
  roleColor: 'default' | 'secondary' | 'destructive'
  initials: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={roleColor}>{role}</Badge>
        <Select defaultValue={role.toLowerCase()}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="auditeur">Auditeur</SelectItem>
            <SelectItem value="lecteur">Lecteur</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function PendingInvite({
  email,
  role,
  sentDate
}: {
  email: string
  role: string
  sentDate: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border border-dashed p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{email}</p>
          <p className="text-sm text-muted-foreground">Invitation envoyée {sentDate}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline">{role}</Badge>
        <Button variant="outline" size="sm">Renvoyer</Button>
        <Button variant="ghost" size="sm">Annuler</Button>
      </div>
    </div>
  )
}
