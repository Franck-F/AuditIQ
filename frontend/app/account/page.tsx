"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { User, Mail, Lock, Trash2, ArrowLeft, Shield, Cookie, Bell, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Cookie preferences
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: false,
    updates: true,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()

        if (!session) {
          router.push("/sign-in")
          return
        }

        setUser({
          name: session.user.name || "Utilisateur",
          email: session.user.email,
          image: session.user.image,
        })
        setName(session.user.name || "")

        // Load cookie preferences
        const consent = localStorage.getItem("cookie-consent")
        if (consent === "accepted") {
          setCookiePreferences((prev) => ({ ...prev, analytics: true, marketing: true }))
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/sign-in")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleUpdateProfile = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUser((prev) => (prev ? { ...prev, name } : null))
      toast.success("Profil mis à jour avec succès")
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Mot de passe modifié avec succès")
    } catch (error) {
      toast.error("Erreur lors du changement de mot de passe")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await authClient.signOut()
      toast.success("Compte supprimé avec succès")
      router.push("/")
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte")
    }
  }

  const handleSaveCookiePreferences = () => {
    if (cookiePreferences.analytics || cookiePreferences.marketing) {
      localStorage.setItem("cookie-consent", "accepted")
    } else {
      localStorage.setItem("cookie-consent", "rejected")
    }
    toast.success("Préférences de cookies enregistrées")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <header className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-8">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-8">
          <Skeleton className="mb-8 h-10 w-64" />
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-xl font-bold">Audit-IQ</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Tableau de bord
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Paramètres du compte</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du profil
              </CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Photo de profil</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 2MB</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Changer la photo
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" value={user?.email} disabled className="flex-1" />
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                </div>

                <Button onClick={handleUpdateProfile} disabled={isSaving}>
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>Mettez à jour votre mot de passe régulièrement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button onClick={handleChangePassword} disabled={isSaving}>
                {isSaving ? "Modification..." : "Changer le mot de passe"}
              </Button>
            </CardContent>
          </Card>

          {/* Cookie Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Préférences de cookies
              </CardTitle>
              <CardDescription>Gérez vos préférences de cookies et confidentialité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Cookies nécessaires</Label>
                  <p className="text-sm text-muted-foreground">Requis pour le fonctionnement du site</p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analytics">Cookies analytiques</Label>
                  <p className="text-sm text-muted-foreground">Nous aide à améliorer l'expérience utilisateur</p>
                </div>
                <Switch
                  id="analytics"
                  checked={cookiePreferences.analytics}
                  onCheckedChange={(checked) => setCookiePreferences((prev) => ({ ...prev, analytics: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="marketing">Cookies marketing</Label>
                  <p className="text-sm text-muted-foreground">Pour vous proposer du contenu pertinent</p>
                </div>
                <Switch
                  id="marketing"
                  checked={cookiePreferences.marketing}
                  onCheckedChange={(checked) => setCookiePreferences((prev) => ({ ...prev, marketing: checked }))}
                />
              </div>

              <Button onClick={handleSaveCookiePreferences}>Enregistrer les préférences</Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configurez vos préférences de notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notif">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des alertes par email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={notificationPreferences.email}
                  onCheckedChange={(checked) => setNotificationPreferences((prev) => ({ ...prev, email: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notif">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications push</p>
                </div>
                <Switch
                  id="push-notif"
                  checked={notificationPreferences.push}
                  onCheckedChange={(checked) => setNotificationPreferences((prev) => ({ ...prev, push: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="updates">Mises à jour produit</Label>
                  <p className="text-sm text-muted-foreground">Nouvelles fonctionnalités et améliorations</p>
                </div>
                <Switch
                  id="updates"
                  checked={notificationPreferences.updates}
                  onCheckedChange={(checked) => setNotificationPreferences((prev) => ({ ...prev, updates: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Confidentialité et sécurité
              </CardTitle>
              <CardDescription>Gérez vos données et votre sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Télécharger mes données</Label>
                  <p className="text-sm text-muted-foreground">Obtenir une copie de vos données</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-destructive">Zone de danger</Label>
                <p className="text-sm text-muted-foreground">Actions irréversibles concernant votre compte</p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement votre compte et toutes vos données
                      de nos serveurs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Oui, supprimer mon compte
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
