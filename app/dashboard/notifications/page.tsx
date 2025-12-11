'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle,
  Check,
  Trash2,
  Clock,
  Loader2
} from 'lucide-react'
import { API_URL } from '@/lib/config/api'

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // Try to fetch from API
      const response = await fetch(`${API_URL}/notifications`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        // Use mock data if API not available
        setNotifications(getMockNotifications())
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications(getMockNotifications())
    } finally {
      setLoading(false)
    }
  }

  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      type: 'success',
      category: 'audit',
      title: 'Audit terminé',
      message: 'L\'audit de conformité a été complété avec succès.',
      time: 'Il y a 5 min',
      date: new Date(Date.now() - 5 * 60000),
      read: false,
      actionUrl: '/dashboard/audits'
    },
    {
      id: '2',
      type: 'warning',
      category: 'security',
      title: 'Biais détectés',
      message: 'Des biais critiques ont été détectés et nécessitent une action.',
      time: 'Il y a 45 min',
      date: new Date(Date.now() - 45 * 60000),
      read: false,
      actionUrl: '/dashboard/compliance'
    },
    {
      id: '3',
      type: 'info',
      category: 'team',
      title: 'Nouveau membre',
      message: 'Un nouveau membre a rejoint votre équipe.',
      time: 'Il y a 2h',
      date: new Date(Date.now() - 2 * 3600000),
      read: true,
      actionUrl: '/dashboard/team'
    }
  ]

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
      audit: 'bg-purple-500/10 text-purple-700',
      team: 'bg-blue-500/10 text-blue-700',
      system: 'bg-gray-500/10 text-gray-700',
      security: 'bg-red-500/10 text-red-700'
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

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-64">
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
      <div className="flex-1 md:ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
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
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres avec onglets */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full max-w-3xl mb-6">
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

                <TabsContent value={activeTab}>
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
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{notification.title}</h4>
                                {getCategoryBadge(notification.category)}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Marquer comme lu
                                </Button>
                              )}
                              {notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.location.href = notification.actionUrl!}
                                >
                                  Voir détails
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
