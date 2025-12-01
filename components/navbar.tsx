'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, LayoutDashboard } from 'lucide-react'

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
  
  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
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
      await fetch('/api/auth/logout', {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/#features" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Fonctionnalités
          </Link>
          <Link 
            href="/pricing" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </Link>
          <Link 
            href="/blog" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <Link 
            href="/docs" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation
          </Link>
          <Link 
            href="/compliance" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Conformité
          </Link>
          <Link 
            href="/contact" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isAuthenticated && userProfile ? (
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
          ) : pathname === '/login' ? (
            <Button asChild variant="default">
              <Link href="/signup">S'inscrire</Link>
            </Button>
          ) : pathname === '/signup' ? (
            <Button asChild variant="outline">
              <Link href="/login">Se connecter</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/signup">Commencer</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
