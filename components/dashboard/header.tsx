'use client'

import { Bell, Search, User, LogOut, Check, X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface UserProfile {
  first_name: string
  last_name: string
  email: string
}

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  time: string
  read: boolean
}

export function DashboardHeader() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Audit terminé',
      message: 'L\'audit RGPD de votre système a été complété avec succès',
      time: 'Il y a 5 min',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Action requise',
      message: '3 non-conformités critiques détectées nécessitent une attention immédiate',
      time: 'Il y a 1h',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau membre',
      message: 'Marie Dubois a rejoint votre équipe',
      time: 'Il y a 2h',
      read: true
    },
    {
      id: '4',
      type: 'success',
      title: 'Rapport généré',
      message: 'Le rapport d\'audit mensuel est prêt à être téléchargé',
      time: 'Hier',
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setUserProfile({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email
        })
      }
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err)
    }
  }

  const getInitials = () => {
    if (!userProfile) return 'U'
    return `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`.toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/')
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un audit, un dataset..."
            className="pl-10 h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <div className="flex items-center justify-between px-2 py-2">
              <DropdownMenuLabel className="p-0">
                Notifications
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-1 text-xs"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Aucune notification
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group relative flex gap-3 px-3 py-3 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs hover:bg-transparent"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center cursor-pointer"
              onClick={() => router.push('/dashboard/notifications')}
            >
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {userProfile && (
                  <>
                    <p className="text-sm font-medium leading-none">
                      {userProfile.first_name} {userProfile.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile.email}
                    </p>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
