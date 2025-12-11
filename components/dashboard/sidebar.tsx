'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Upload, FileText, Settings, Users, Shield, Bell, HelpCircle, ChevronLeft, ChevronRight, User, FileCheck, Cable, TrendingUp, Database, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Audits', href: '/dashboard/audits', icon: FileCheck },
  { name: 'Upload données', href: '/dashboard/upload', icon: Upload },
  { name: 'Connexions', href: '/dashboard/connections', icon: Cable },
  { name: 'Rapports', href: '/dashboard/reports', icon: FileText },
  { name: 'Conformité', href: '/dashboard/compliance', icon: Shield },
  { name: 'Équipe', href: '/dashboard/team', icon: Users },
  { name: 'Profil', href: '/dashboard/profile', icon: User },
  { name: 'Auto EDA', href: '/dashboard/eda', icon: TrendingUp },
  { name: 'Sources EDA', href: '/dashboard/eda/sources', icon: Database },
  { name: 'Analyses EDA', href: '/dashboard/eda/analyses', icon: BarChart3 },
]

const bottomNavigation = [
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Aide', href: '/dashboard/help', icon: HelpCircle },
]

interface UserProfile {
  first_name: string
  last_name: string
  email: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/auth/me`, {
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

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 pt-28",
      collapsed ? "w-16" : "w-64",
      "hidden md:flex" // Hide on mobile, show on desktop
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && <Logo />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border p-3 space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>

        {/* utilisateur Profile */}
        {!collapsed && userProfile && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userProfile.first_name} {userProfile.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
