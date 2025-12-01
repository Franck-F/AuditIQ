'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { logoutUser } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Edit, Save, X, CheckCircle } from 'lucide-react'

interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  company_name: string
  company_size: string
  sector: string
  role: string
  plan: string
  is_active: boolean
  language: string
  timezone: string
  notifications_enabled: boolean
  last_login: string | null
  created_at: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoadingProfile(true)
    
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else if (res.status === 401) {
        // Non authentifié, rediriger vers login
        router.push('/login')
      } else {
        setError('Erreur lors du chargement du profil')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleLogout = async () => {
    setError(null)
    setLoading(true)
    try {
      await logoutUser()
      router.push('/')  // Redirection vers la landing page
    } catch (err) {
      setError('Erreur lors de la déconnexion, veuillez réessayer')
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications
      setEditedProfile({})
      setIsEditing(false)
    } else {
      // Commencer l'édition
      setEditedProfile({
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        company_name: profile?.company_name,
        company_size: profile?.company_size,
        sector: profile?.sector,
        role: profile?.role,
        language: profile?.language,
        timezone: profile?.timezone,
        notifications_enabled: profile?.notifications_enabled
      })
      setIsEditing(true)
    }
    setSaveSuccess(false)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError(null)
    setSaveSuccess(false)
    
    console.log('📤 Données à envoyer:', editedProfile)
    
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile),
        credentials: 'include'
      })
      
      console.log('✅ Réponse du serveur:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('📥 Données reçues:', data)
        await fetchProfile()  // Recharger le profil
        setIsEditing(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setError('Erreur lors de la sauvegarde du profil')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; color: string }> = {
      admin: { label: 'Administrateur', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      auditor: { label: 'Auditeur', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      reader: { label: 'Lecteur', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    }
    const roleInfo = roles[role] || roles.reader
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`}>
        {roleInfo.label}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    const plans: Record<string, { label: string; color: string }> = {
      free: { label: 'Gratuit', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
      pro: { label: 'Pro', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      enterprise: { label: 'Enterprise', color: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-500 border-purple-500/20' }
    }
    const planInfo = plans[plan] || plans.free
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${planInfo.color}`}>
        {planInfo.label}
      </span>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6 max-w-3xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Profil utilisateur</h1>
            <p className="text-muted-foreground">
              Gérez les informations de votre compte et votre session.
            </p>
          </div>

          {loadingProfile ? (
            <Card className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </Card>
          ) : profile ? (
            <>
              {saveSuccess && (
                <Card className="p-4 bg-green-500/10 border-green-500/50">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Profil mis à jour avec succès !</span>
                  </div>
                </Card>
              )}

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Informations personnelles</h2>
                  <Button
                    variant={isEditing ? "ghost" : "outline"}
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </>
                    )}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input
                          id="first_name"
                          value={editedProfile.first_name || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          id="last_name"
                          value={editedProfile.last_name || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select
                        value={editedProfile.role || profile.role}
                        onValueChange={(value) => setEditedProfile({ ...editedProfile, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="auditor">Auditeur</SelectItem>
                          <SelectItem value="reader">Lecteur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Nom complet :</span>
                      <span className="col-span-2 text-sm">
                        {profile.first_name} {profile.last_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Email :</span>
                      <span className="col-span-2 text-sm">{profile.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Rôle :</span>
                      <span className="col-span-2">{getRoleBadge(profile.role)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Plan :</span>
                      <span className="col-span-2">{getPlanBadge(profile.plan)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Statut :</span>
                      <span className="col-span-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile.is_active 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {profile.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Entreprise</h2>
                </div>
                {isEditing ? (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nom de l'entreprise</Label>
                      <Input
                        id="company_name"
                        value={editedProfile.company_name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, company_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">Secteur</Label>
                      <Select
                        value={editedProfile.sector || profile.sector}
                        onValueChange={(value) => setEditedProfile({ ...editedProfile, sector: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technologie">Technologie</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Santé">Santé</SelectItem>
                          <SelectItem value="Éducation">Éducation</SelectItem>
                          <SelectItem value="Commerce">Commerce</SelectItem>
                          <SelectItem value="Industrie">Industrie</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_size">Taille de l'entreprise</Label>
                      <Select
                        value={editedProfile.company_size || profile.company_size}
                        onValueChange={(value) => setEditedProfile({ ...editedProfile, company_size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une taille" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employés</SelectItem>
                          <SelectItem value="11-50">11-50 employés</SelectItem>
                          <SelectItem value="51-200">51-200 employés</SelectItem>
                          <SelectItem value="201-500">201-500 employés</SelectItem>
                          <SelectItem value="500+">500+ employés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Entreprise :</span>
                      <span className="col-span-2 text-sm">{profile.company_name || 'Non renseigné'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Secteur :</span>
                      <span className="col-span-2 text-sm">{profile.sector || 'Non renseigné'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Taille :</span>
                      <span className="col-span-2 text-sm">{profile.company_size || 'Non renseigné'}</span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Préférences</h2>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="language">Langue</Label>
                        <Select
                          value={editedProfile.language || 'fr'}
                          onValueChange={(value) => setEditedProfile({ ...editedProfile, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuseau horaire</Label>
                        <Select
                          value={editedProfile.timezone || 'Europe/Paris'}
                          onValueChange={(value) => setEditedProfile({ ...editedProfile, timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <Label>Notifications</Label>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                      </div>
                      <Switch
                        checked={editedProfile.notifications_enabled ?? true}
                        onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, notifications_enabled: checked })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Langue :</span>
                      <span className="col-span-2 text-sm">{profile.language === 'fr' ? 'Français' : profile.language}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Fuseau horaire :</span>
                      <span className="col-span-2 text-sm">{profile.timezone}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Notifications :</span>
                      <span className="col-span-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile.notifications_enabled 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                            : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                        }`}>
                          {profile.notifications_enabled ? 'Activées' : 'Désactivées'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Informations de session</h2>
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Dernière connexion :</span>
                    <span className="col-span-2 text-sm">{formatDate(profile.last_login)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Membre depuis :</span>
                    <span className="col-span-2 text-sm">{formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Impossible de charger les informations du profil
              </p>
            </Card>
          )}

          <Card className="p-6 space-y-4 border-destructive/40">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Session & sécurité</h2>
              <p className="text-sm text-muted-foreground">
                Déconnectez-vous de votre session actuelle. Le cookie d&apos;authentification et le
                token local seront supprimés.
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </Button>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          </Card>
        </main>
      </div>
    </div>
  )
}


