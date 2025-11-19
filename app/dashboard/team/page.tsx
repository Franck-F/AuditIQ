'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, MoreVertical, Mail, Shield, User } from 'lucide-react'

export default function TeamPage() {
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
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Inviter un membre
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Invitations en attente</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Rôles différents</p>
              </div>
            </Card>
          </div>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Membres de l'équipe</h3>
              <p className="text-sm text-muted-foreground">Gérez les accès et permissions de vos collaborateurs</p>
            </div>
            <div className="space-y-3">
              <TeamMember
                name="Jean Dupont"
                email="jean@entreprise.com"
                role="Admin"
                roleColor="destructive"
                initials="JD"
              />
              <TeamMember
                name="Marie Martin"
                email="marie@entreprise.com"
                role="Auditeur"
                roleColor="default"
                initials="MM"
              />
              <TeamMember
                name="Pierre Dubois"
                email="pierre@entreprise.com"
                role="Auditeur"
                roleColor="default"
                initials="PD"
              />
              <TeamMember
                name="Sophie Laurent"
                email="sophie@entreprise.com"
                role="Lecteur"
                roleColor="secondary"
                initials="SL"
              />
              <TeamMember
                name="Thomas Bernard"
                email="thomas@entreprise.com"
                role="Lecteur"
                roleColor="secondary"
                initials="TB"
              />
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Invitations en attente</h3>
              <p className="text-sm text-muted-foreground">Membres invités en attente d'acceptation</p>
            </div>
            <div className="space-y-3">
              <PendingInvite
                email="julie@entreprise.com"
                role="Auditeur"
                sentDate="Il y a 2 jours"
              />
              <PendingInvite
                email="lucas@entreprise.com"
                role="Lecteur"
                sentDate="Il y a 5 jours"
              />
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

function TeamMember({
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
