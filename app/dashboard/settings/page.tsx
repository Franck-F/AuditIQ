'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Building, Bell, Shield, Key, Trash2, History, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ProfileSettings {
  first_name: string
  last_name: string
  email: string
  phone: string
  language: string
}

interface CompanySettings {
  company_name: string
  siret: string
  sector: string
  company_size: string
}

interface NotificationSettings {
  critical_bias: boolean
  weekly_reports: boolean
  scheduled_audits: boolean
  product_updates: boolean
}

export default function SettingsPage() {
  const [loginHistory, setLoginHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Profile state
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    language: 'fr'
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  
  // Company state
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    company_name: '',
    siret: '',
    sector: '',
    company_size: ''
  })
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [savingCompany, setSavingCompany] = useState(false)
  
  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    critical_bias: true,
    weekly_reports: true,
    scheduled_audits: true,
    product_updates: false
  })
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)
  
  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    fetchProfileSettings()
    fetchCompanySettings()
    fetchNotificationSettings()
  }, [])

  const fetchProfileSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/profile`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setProfileSettings(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchCompanySettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/company`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setCompanySettings(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'entreprise:', error)
    } finally {
      setLoadingCompany(false)
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/notifications`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setNotificationSettings(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const saveProfileSettings = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileSettings)
      })
      
      if (res.ok) {
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Erreur",
          description: error.detail || "Erreur lors de la mise à jour",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil",
        variant: "destructive"
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const saveCompanySettings = async () => {
    setSavingCompany(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(companySettings)
      })
      
      if (res.ok) {
        toast({
          title: "Succès",
          description: "Informations entreprise mises à jour avec succès",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Erreur",
          description: error.detail || "Erreur lors de la mise à jour",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'entreprise",
        variant: "destructive"
      })
    } finally {
      setSavingCompany(false)
    }
  }

  const saveNotificationSettings = async () => {
    setSavingNotifications(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(notificationSettings)
      })
      
      if (res.ok) {
        toast({
          title: "Succès",
          description: "Préférences de notifications mises à jour",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des notifications",
        variant: "destructive"
      })
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      })
      return
    }
    
    setChangingPassword(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })
      
      if (res.ok) {
        toast({
          title: "Succès",
          description: "Mot de passe changé avec succès",
        })
        setPasswordDialogOpen(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const error = await res.json()
        toast({
          title: "Erreur",
          description: error.detail || "Erreur lors du changement de mot de passe",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du changement de mot de passe",
        variant: "destructive"
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SUPPRIMER') {
      toast({
        title: "Erreur",
        description: "Veuillez taper 'SUPPRIMER' pour confirmer",
        variant: "destructive"
      })
      return
    }
    
    setDeletingAccount(true)
    try {
      const res = await fetch(`${API_URL}/api/settings/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation
        })
      })
      
      if (res.ok) {
        toast({
          title: "Compte supprimé",
          description: "Votre compte a été supprimé avec succès",
        })
        // Rediriger vers la page d'accueil
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        const error = await res.json()
        toast({
          title: "Erreur",
          description: error.detail || "Erreur lors de la suppression",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du compte",
        variant: "destructive"
      })
    } finally {
      setDeletingAccount(false)
    }
  }

  const fetchLoginHistory = async () => {
    setLoadingHistory(true)
    
    try {
      const res = await fetch(`${API_URL}/api/auth/login-history?limit=10`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setLoginHistory(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleExportData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/export`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `auditiq-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Succès",
          description: "Vos données ont été exportées",
        })
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export des données",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
            <p className="text-muted-foreground">Gérez les paramètres de votre compte et de votre entreprise</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="company" className="gap-2">
                <Building className="h-4 w-4" />
                Entreprise
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informations personnelles</h3>
                  <p className="text-sm text-muted-foreground">Mettez à jour vos informations de profil</p>
                </div>
                
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input 
                          id="firstName" 
                          value={profileSettings.first_name}
                          onChange={(e) => setProfileSettings({...profileSettings, first_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input 
                          id="lastName" 
                          value={profileSettings.last_name}
                          onChange={(e) => setProfileSettings({...profileSettings, last_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profileSettings.email}
                          onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input 
                          id="phone" 
                          value={profileSettings.phone || ''}
                          onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Langue</Label>
                        <Select 
                          value={profileSettings.language}
                          onValueChange={(value) => setProfileSettings({...profileSettings, language: value})}
                        >
                          <SelectTrigger id="language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={saveProfileSettings} disabled={savingProfile}>
                      {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enregistrer les modifications
                    </Button>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informations entreprise</h3>
                  <p className="text-sm text-muted-foreground">Gérez les informations de votre entreprise</p>
                </div>
                
                {loadingCompany ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nom de l'entreprise</Label>
                        <Input 
                          id="companyName" 
                          value={companySettings.company_name || ''}
                          onChange={(e) => setCompanySettings({...companySettings, company_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siret">SIRET</Label>
                        <Input 
                          id="siret" 
                          value={companySettings.siret || ''}
                          onChange={(e) => setCompanySettings({...companySettings, siret: e.target.value})}
                          placeholder="123 456 789 00012"
                        />
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="sector">Secteur d'activité</Label>
                          <Select 
                            value={companySettings.sector || 'tech'}
                            onValueChange={(value) => setCompanySettings({...companySettings, sector: value})}
                          >
                            <SelectTrigger id="sector">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tech">Technologie</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="retail">Commerce</SelectItem>
                              <SelectItem value="healthcare">Santé</SelectItem>
                              <SelectItem value="education">Éducation</SelectItem>
                              <SelectItem value="manufacturing">Industrie</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="size">Taille</Label>
                          <Select 
                            value={companySettings.company_size || '51-200'}
                            onValueChange={(value) => setCompanySettings({...companySettings, company_size: value})}
                          >
                            <SelectTrigger id="size">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employés</SelectItem>
                              <SelectItem value="11-50">11-50 employés</SelectItem>
                              <SelectItem value="51-200">51-200 employés</SelectItem>
                              <SelectItem value="201-500">201-500 employés</SelectItem>
                              <SelectItem value="501+">501+ employés</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button onClick={saveCompanySettings} disabled={savingCompany}>
                      {savingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enregistrer les modifications
                    </Button>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Préférences de notifications</h3>
                  <p className="text-sm text-muted-foreground">Choisissez comment vous souhaitez être notifié</p>
                </div>
                
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <NotificationSetting
                        title="Biais critiques détectés"
                        description="Recevoir une alerte immédiate en cas de détection de biais critique"
                        checked={notificationSettings.critical_bias}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, critical_bias: checked})}
                      />
                      <NotificationSetting
                        title="Rapports hebdomadaires"
                        description="Recevoir un résumé hebdomadaire de vos audits"
                        checked={notificationSettings.weekly_reports}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weekly_reports: checked})}
                      />
                      <NotificationSetting
                        title="Audits programmés"
                        description="Rappels pour les audits automatiques programmés"
                        checked={notificationSettings.scheduled_audits}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, scheduled_audits: checked})}
                      />
                      <NotificationSetting
                        title="Mises à jour produit"
                        description="Nouvelles fonctionnalités et améliorations"
                        checked={notificationSettings.product_updates}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, product_updates: checked})}
                      />
                    </div>
                    <Button onClick={saveNotificationSettings} disabled={savingNotifications}>
                      {savingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enregistrer les modifications
                    </Button>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sécurité du compte</h3>
                  <p className="text-sm text-muted-foreground">Gérez la sécurité de votre compte</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Authentification à deux facteurs</p>
                      <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <Button variant="outline">Activer</Button>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Changer le mot de passe</p>
                      <p className="text-sm text-muted-foreground">Modifiez votre mot de passe régulièrement</p>
                    </div>
                    <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Key className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Changer le mot de passe</DialogTitle>
                          <DialogDescription>
                            Entrez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="current">Mot de passe actuel</Label>
                            <Input
                              id="current"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new">Nouveau mot de passe</Label>
                            <Input
                              id="new"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                            <Input
                              id="confirm"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleChangePassword} disabled={changingPassword}>
                            {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Modifier le mot de passe
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Historique des connexions</p>
                      <p className="text-sm text-muted-foreground">Consultez vos dernières connexions</p>
                    </div>
                    <Button variant="outline" onClick={fetchLoginHistory} disabled={loadingHistory}>
                      {loadingHistory ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <History className="h-4 w-4 mr-2" />
                      )}
                      Voir l'historique
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Historique des connexions */}
              {loginHistory.length > 0 && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Historique des connexions</h3>
                      <p className="text-sm text-muted-foreground">Dernières tentatives de connexion à votre compte</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {loginHistory.map((log, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          {log.success ? (
                            <div className="rounded-full bg-green-500/10 p-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-destructive/10 p-2">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{log.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.ip_address} · {new Date(log.timestamp).toLocaleString('fr-FR')}
                            </p>
                            {!log.success && log.failure_reason && (
                              <p className="text-xs text-destructive mt-1">
                                Raison: {log.failure_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${log.success ? 'text-green-500' : 'text-destructive'}`}>
                          {log.success ? 'Succès' : 'Échec'}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Export RGPD */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Exportation des données (RGPD)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Téléchargez toutes vos données personnelles conformément au RGPD
                </p>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger mes données
                </Button>
              </Card>

              {/* Zone de danger */}
              <Card className="p-6 space-y-4 border-destructive">
                <div className="flex items-center gap-3 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Zone de danger</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Actions irréversibles concernant votre compte. Toutes vos données seront exportées avant suppression.
                </p>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Supprimer mon compte</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer définitivement le compte</DialogTitle>
                      <DialogDescription>
                        Cette action est irréversible. Toutes vos données seront supprimées de façon permanente.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="delete-password">Mot de passe</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Entrez votre mot de passe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">Tapez "SUPPRIMER" pour confirmer</Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="SUPPRIMER"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
                        {deletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Supprimer définitivement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

interface NotificationSettingProps {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function NotificationSetting({ title, description, checked, onCheckedChange }: NotificationSettingProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

