'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus, Mail, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InviteMemberDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function InviteMemberDialog({ trigger, onSuccess }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('reader')
  const [isLoading, setIsLoading] = useState(false)

  const handleInvite = async () => {
    setIsLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    try {
      const res = await fetch(`${API_URL}/api/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Nécessaire pour l'authentification
        body: JSON.stringify({
          email,
          role
        })
      })

      if (!res.ok) {
        throw new Error('Erreur lors de l\'invitation')
      }

      const data = await res.json()
      console.log('Invite success:', data)
      setOpen(false)
      setEmail('')
      setRole('reader')
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Failed to invite member:', error)
      // Idéalement afficher un toast d'erreur ici, mais le composant parent gère les membres
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Inviter un membre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter un membre de l'équipe
          </DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email pour ajouter un nouveau membre à votre équipe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Adresse email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="membre@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Rôle et permissions
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>Admin</span>
                    <Badge variant="destructive" className="text-xs">
                      Accès complet
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="auditor">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>Auditeur</span>
                    <Badge variant="default" className="text-xs">
                      Lecture/Écriture
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="reader">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>Lecteur</span>
                    <Badge variant="secondary" className="text-xs">
                      Lecture seule
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-medium">Permissions du rôle {role === 'admin' ? 'Admin' : role === 'auditor' ? 'Auditeur' : 'Lecteur'}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {role === 'admin' && (
                <>
                  <li>✓ Créer, modifier et supprimer des audits</li>
                  <li>✓ Inviter et gérer les membres de l'équipe</li>
                  <li>✓ Modifier les paramètres de l'entreprise</li>
                  <li>✓ Accès complet à toutes les fonctionnalités</li>
                </>
              )}
              {role === 'auditor' && (
                <>
                  <li>✓ Créer et modifier des audits</li>
                  <li>✓ Voir tous les audits de l'entreprise</li>
                  <li>✓ Générer des rapports</li>
                  <li>✗ Gérer les membres et paramètres</li>
                </>
              )}
              {role === 'reader' && (
                <>
                  <li>✓ Voir tous les audits de l'entreprise</li>
                  <li>✓ Consulter les rapports</li>
                  <li>✗ Créer ou modifier des audits</li>
                  <li>✗ Gérer les membres et paramètres</li>
                </>
              )}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleInvite} disabled={!email || isLoading}>
            {isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
