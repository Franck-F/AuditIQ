'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AnimeNavBar } from '@/components/ui/anime-navbar'
import { Home, Sparkles, DollarSign, BookOpen, FileText, Shield, Mail, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from '@/components/ui/logo'
import { API_ENDPOINTS } from '@/lib/config/api'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface UserProfile {
  first_name: string
  last_name: string
  email: string
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsAuthenticated(true)
        setUserProfile({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email
        })
      } else {
        setIsAuthenticated(false)
        setUserProfile(null)
      }
    } catch (err) {
      setIsAuthenticated(false)
      setUserProfile(null)
    }
  }

  const getInitials = () => {
    if (!userProfile) return 'U'
    return `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`.toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        credentials: 'include',
      })
      setIsAuthenticated(false)
      setUserProfile(null)
      router.push('/')
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    }
  }

  const navItems = [
    { name: 'Accueil', url: '/', icon: Home },
    { name: 'Fonctionnalités', url: '/#features', icon: Sparkles },
    { name: 'Tarifs', url: '/pricing', icon: DollarSign },
    { name: 'Blog', url: '/blog', icon: BookOpen },
    { name: 'Documentation', url: '/docs', icon: FileText },
    { name: 'Conformité', url: '/compliance', icon: Shield },
    { name: 'Contact', url: '/contact', icon: Mail },
  ]

  return (
    <>
      {/* Logo - Fixed top left - Hidden on dashboard AND on phones */}
      {/* Logo - Fixed top left - Hidden on dashboard AND on phones */}
      {!pathname.startsWith('/dashboard') && (
        <div className="fixed top-4 left-4 md:top-6 md:left-6 z-[10000] hidden sm:block">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      )}
      
      {/* Desktop Navigation - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <AnimeNavBar items={navItems} defaultActive="Accueil" />
      </div>
      
      {/* Mobile Menu Button - Only on mobile/tablet */}
      {/* Mobile Menu Button - Only on mobile/tablet */}
      {!pathname.startsWith('/dashboard') && (
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-[10000] p-2 rounded-lg bg-black/50 border border-white/10 backdrop-blur-lg hover:bg-black/70 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>
      )}
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && !pathname.startsWith('/dashboard') && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl pt-20">
          <nav className="container mx-auto px-4 py-8">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
      
      {/* User Menu - Fixed top right */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[10000] flex items-center gap-3">
        <ThemeToggle />
        {isAuthenticated && userProfile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-black/50 border border-white/10 backdrop-blur-lg hover:bg-black/70">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile.first_name} {userProfile.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
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
        ) : pathname !== '/login' && pathname !== '/signup' ? (
          <div className="flex items-center gap-2">
            <Button 
              asChild 
              variant="ghost" 
              className="hidden sm:inline-flex bg-black/50 border border-white/10 backdrop-blur-lg text-white hover:bg-black/70"
            >
              <a href="/login">Se connecter</a>
            </Button>
            <Button 
              asChild 
              className="bg-primary hover:bg-primary/90"
            >
              <a href="/signup">Commencer</a>
            </Button>
          </div>
        ) : null}
      </div>
    </>
  )
}
