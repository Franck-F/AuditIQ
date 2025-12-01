'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle,
  Check,
  X,
  MoreVertical,
  Filter,
  Clock,
  Mail,
  Archive,
  Trash2,
  Settings,
  Smartphone,
  Monitor,
  Volume2,
  Vibrate
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  category: 'audit' | 'team' | 'system' | 'security'
  title: string
  message: string
  time: string
  date: Date
  read: boolean
  actionUrl?: string
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Paramètres de notification
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      audits: true,
      team: true,
      security: true,
      system: false,
      marketing: false
    },
    push: {
      audits: true,
      team: true,
      security: true,
      system: false,
      marketing: false
    },
    inApp: {
      audits: true,
      team: true,
      security: true,
      system: true,
      marketing: false
    },
    frequency: {
      instant: true,
      daily: false,
      weekly: false
    },
    preferences: {
      sound: true,
      vibration: true,
      desktop: true,
      mobile: true,
      doNotDisturb: false
    }
  })

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      category: 'audit',
      title: 'Audit RGPD terminé',
      message: 'L\'audit de conformité RGPD a été complété avec succès. 15 recommandations ont été identifiées.',
      time: 'Il y a 5 min',
      date: new Date(Date.now() - 5 * 60000),
      read: false,
      actionUrl: '/dashboard/audits/123'
    },
    {
      id: '2',
      type: 'warning',
      category: 'security',
      title: 'Non-conformités critiques détectées',
      message: '3 non-conformités critiques ont été détectées dans votre dernière analyse et nécessitent une action immédiate.',
      time: 'Il y a 45 min',
      date: new Date(Date.now() - 45 * 60000),
      read: false,
      actionUrl: '/dashboard/compliance'
    },
    {
      id: '3',
      type: 'info',
      category: 'team',
      title: 'Nouveau membre ajouté',
      message: 'Marie Dubois a rejoint votre équipe en tant qu\'Auditrice. Elle a maintenant accès aux audits en cours.',
      time: 'Il y a 2h',
      date: new Date(Date.now() - 2 * 3600000),
      read: false,
      actionUrl: '/dashboard/team'
    },
    {
      id: '4',
      type: 'success',
      category: 'audit',
      title: 'Rapport généré',
      message: 'Le rapport d\'audit mensuel (Octobre 2025) est prêt. Vous pouvez le télécharger au format PDF.',
      time: 'Il y a 5h',
      date: new Date(Date.now() - 5 * 3600000),
      read: true,
      actionUrl: '/dashboard/reports'
    },
    {
      id: '5',
      type: 'info',
      category: 'system',
      title: 'Mise à jour système',
      message: 'Une nouvelle version d\'AuditIQ est disponible avec des améliorations de performance et de nouvelles fonctionnalités.',
      time: 'Hier',
      date: new Date(Date.now() - 24 * 3600000),
      read: true
    },
    {
      id: '6',
      type: 'warning',
      category: 'audit',
      title: 'Audit planifié en attente',
      message: 'L\'audit hebdomadaire automatique est en attente de vos documents. Veuillez télécharger les fichiers nécessaires.',
      time: 'Hier',
      date: new Date(Date.now() - 28 * 3600000),
      read: true,
      actionUrl: '/dashboard/upload'
    },
    {
      id: '7',
      type: 'error',
      category: 'security',
      title: 'Tentative de connexion suspecte',
      message: 'Une tentative de connexion depuis une localisation inhabituelle (Paris, France) a été bloquée.',
      time: 'Il y a 2 jours',
      date: new Date(Date.now() - 2 * 24 * 3600000),
      read: true,
      actionUrl: '/dashboard/settings'
    },
    {
      id: '8',
      type: 'info',
      category: 'team',
      title: 'Tâche assignée',
      message: 'Jean Martin vous a assigné une tâche : "Corriger les non-conformités ISO 27001" avec échéance le 25/11/2025.',
      time: 'Il y a 3 jours',
      date: new Date(Date.now() - 3 * 24 * 3600000),
      read: true,
      actionUrl: '/dashboard/audits/124'
    },
    {
      id: '9',
      type: 'success',
      category: 'system',
      title: 'Sauvegarde automatique effectuée',
      message: 'Vos données ont été sauvegardées automatiquement. Toutes vos informations sont sécurisées.',
      time: 'Il y a 3 jours',
      date: new Date(Date.now() - 3 * 24 * 3600000),
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      audit: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      team: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      system: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
      security: 'bg-red-500/10 text-red-700 dark:text-red-400'
    }
    const labels: Record<string, string> = {
      audit: 'Audit',
      team: 'Équipe',
      system: 'Système',
      security: 'Sécurité'
    }
    return (
      <Badge variant="secondary" className={colors[category]}>
        {labels[category]}
      </Badge>
    )
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const archiveNotification = (id: string) => {
    // Implémentation future
    deleteNotification(id)
  }

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'audit':
      case 'team':
      case 'system':
      case 'security':
        return notifications.filter(n => n.category === filter)
      default:
        return notifications
    }
  }

  const filteredNotifications = filterNotifications(activeTab)

  const updateNotificationSetting = (category: string, type: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [type]: value
      }
    }))
  }

  const saveSettings = () => {
    // Sauvegarder les paramètres (API call)
    setSettingsOpen(false)
    // Afficher une notification de succès
    console.log('Paramètres sauvegardés:', notificationSettings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos notifications et alertes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu ({unreadCount})
            </Button>
          )}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Settings className="h-6 w-6" />
                  Paramètres de notification
                </DialogTitle>
                <DialogDescription>
                  Personnalisez comment et quand vous souhaitez recevoir des notifications
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Notifications par email */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Notifications par email</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-audits" className="font-medium">Audits</Label>
                        <p className="text-sm text-muted-foreground">
                          Nouveaux audits, résultats et rapports
                        </p>
                      </div>
                      <Switch
                        id="email-audits"
                        checked={notificationSettings.email.audits}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'audits', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-team" className="font-medium">Équipe</Label>
                        <p className="text-sm text-muted-foreground">
                          Nouveaux membres, mentions et assignations
                        </p>
                      </div>
                      <Switch
                        id="email-team"
                        checked={notificationSettings.email.team}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'team', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-security" className="font-medium">Sécurité</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertes de sécurité et non-conformités critiques
                        </p>
                      </div>
                      <Switch
                        id="email-security"
                        checked={notificationSettings.email.security}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'security', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-system" className="font-medium">Système</Label>
                        <p className="text-sm text-muted-foreground">
                          Mises à jour et maintenances
                        </p>
                      </div>
                      <Switch
                        id="email-system"
                        checked={notificationSettings.email.system}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'system', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-marketing" className="font-medium">Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Nouveautés, conseils et offres spéciales
                        </p>
                      </div>
                      <Switch
                        id="email-marketing"
                        checked={notificationSettings.email.marketing}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'marketing', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Notifications push */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Notifications push</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-audits" className="font-medium">Audits</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertes instantanées pour les audits
                        </p>
                      </div>
                      <Switch
                        id="push-audits"
                        checked={notificationSettings.push.audits}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'audits', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-team" className="font-medium">Équipe</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications d'équipe en temps réel
                        </p>
                      </div>
                      <Switch
                        id="push-team"
                        checked={notificationSettings.push.team}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'team', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-security" className="font-medium">Sécurité</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertes de sécurité urgentes
                        </p>
                      </div>
                      <Switch
                        id="push-security"
                        checked={notificationSettings.push.security}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'security', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Notifications in-app */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Notifications dans l'application</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="app-audits" className="font-medium">Audits</Label>
                        <p className="text-sm text-muted-foreground">
                          Afficher dans le tableau de bord
                        </p>
                      </div>
                      <Switch
                        id="app-audits"
                        checked={notificationSettings.inApp.audits}
                        onCheckedChange={(checked) => updateNotificationSetting('inApp', 'audits', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="app-team" className="font-medium">Équipe</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications d'équipe visibles
                        </p>
                      </div>
                      <Switch
                        id="app-team"
                        checked={notificationSettings.inApp.team}
                        onCheckedChange={(checked) => updateNotificationSetting('inApp', 'team', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="app-security" className="font-medium">Sécurité</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertes de sécurité importantes
                        </p>
                      </div>
                      <Switch
                        id="app-security"
                        checked={notificationSettings.inApp.security}
                        onCheckedChange={(checked) => updateNotificationSetting('inApp', 'security', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="app-system" className="font-medium">Système</Label>
                        <p className="text-sm text-muted-foreground">
                          Informations système
                        </p>
                      </div>
                      <Switch
                        id="app-system"
                        checked={notificationSettings.inApp.system}
                        onCheckedChange={(checked) => updateNotificationSetting('inApp', 'system', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Préférences générales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Préférences générales</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="pref-sound" className="font-medium">Son</Label>
                          <p className="text-sm text-muted-foreground">
                            Jouer un son pour les notifications
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="pref-sound"
                        checked={notificationSettings.preferences.sound}
                        onCheckedChange={(checked) => updateNotificationSetting('preferences', 'sound', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex items-center gap-2">
                        <Vibrate className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="pref-vibration" className="font-medium">Vibration</Label>
                          <p className="text-sm text-muted-foreground">
                            Vibrer sur mobile
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="pref-vibration"
                        checked={notificationSettings.preferences.vibration}
                        onCheckedChange={(checked) => updateNotificationSetting('preferences', 'vibration', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="pref-desktop" className="font-medium">Notifications bureau</Label>
                          <p className="text-sm text-muted-foreground">
                            Afficher sur le bureau
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="pref-desktop"
                        checked={notificationSettings.preferences.desktop}
                        onCheckedChange={(checked) => updateNotificationSetting('preferences', 'desktop', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="pref-mobile" className="font-medium">Notifications mobile</Label>
                          <p className="text-sm text-muted-foreground">
                            Recevoir sur mobile
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="pref-mobile"
                        checked={notificationSettings.preferences.mobile}
                        onCheckedChange={(checked) => updateNotificationSetting('preferences', 'mobile', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pref-dnd" className="font-medium">Mode Ne pas déranger</Label>
                        <p className="text-sm text-muted-foreground">
                          Désactiver temporairement toutes les notifications (sauf critiques)
                        </p>
                      </div>
                      <Switch
                        id="pref-dnd"
                        checked={notificationSettings.preferences.doNotDisturb}
                        onCheckedChange={(checked) => updateNotificationSetting('preferences', 'doNotDisturb', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Fréquence des notifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Fréquence d'envoi</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="freq-instant" className="font-medium">Instantané</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir immédiatement chaque notification
                        </p>
                      </div>
                      <Switch
                        id="freq-instant"
                        checked={notificationSettings.frequency.instant}
                        onCheckedChange={(checked) => updateNotificationSetting('frequency', 'instant', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="freq-daily" className="font-medium">Résumé quotidien</Label>
                        <p className="text-sm text-muted-foreground">
                          Un email récapitulatif par jour à 9h
                        </p>
                      </div>
                      <Switch
                        id="freq-daily"
                        checked={notificationSettings.frequency.daily}
                        onCheckedChange={(checked) => updateNotificationSetting('frequency', 'daily', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="freq-weekly" className="font-medium">Résumé hebdomadaire</Label>
                        <p className="text-sm text-muted-foreground">
                          Un email récapitulatif le lundi matin
                        </p>
                      </div>
                      <Switch
                        id="freq-weekly"
                        checked={notificationSettings.frequency.weekly}
                        onCheckedChange={(checked) => updateNotificationSetting('frequency', 'weekly', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={saveSettings}>
                  <Check className="h-4 w-4 mr-2" />
                  Enregistrer les paramètres
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold mt-1">{unreadCount}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold mt-1">
                  {notifications.filter(n => 
                    new Date(n.date).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertes</p>
                <p className="text-2xl font-bold mt-1">
                  {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1">{notifications.length}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres avec onglets */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full max-w-3xl">
              <TabsTrigger value="all">
                Toutes
                <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="audit">Audits</TabsTrigger>
              <TabsTrigger value="team">Équipe</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="system">Système</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucune notification dans cette catégorie
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    !notification.read 
                      ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                      : 'bg-background hover:bg-muted/50 border-transparent'
                  }`}
                >
                  {/* Indicateur non lu */}
                  {!notification.read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r" />
                  )}

                  {/* Icône */}
                  <div className="mt-0.5 pl-2">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-base">
                            {notification.title}
                          </h4>
                          {getCategoryBadge(notification.category)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Marquer comme lu
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archiver
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>

                    {notification.actionUrl && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-primary hover:text-primary/80"
                      >
                        Voir les détails →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paramètres de notification */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Préférences de notification
          </CardTitle>
          <CardDescription>
            Personnalisez les notifications que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            Gérer les préférences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
