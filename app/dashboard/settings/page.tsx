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
import { User, Building, Bell, Shield, Key, Trash2 } from 'lucide-react'

export default function SettingsPage() {
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
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" defaultValue="Jean" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" defaultValue="Dupont" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="jean@entreprise.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" defaultValue="+33 6 12 34 56 78" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select defaultValue="fr">
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
                <Button>Enregistrer les modifications</Button>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informations entreprise</h3>
                  <p className="text-sm text-muted-foreground">Gérez les informations de votre entreprise</p>
                </div>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input id="companyName" defaultValue="Entreprise SAS" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input id="siret" defaultValue="123 456 789 00012" />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sector">Secteur d'activité</Label>
                      <Select defaultValue="tech">
                        <SelectTrigger id="sector">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technologie</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Commerce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Taille</Label>
                      <Select defaultValue="51-200">
                        <SelectTrigger id="size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employés</SelectItem>
                          <SelectItem value="11-50">11-50 employés</SelectItem>
                          <SelectItem value="51-200">51-200 employés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button>Enregistrer les modifications</Button>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Préférences de notifications</h3>
                  <p className="text-sm text-muted-foreground">Choisissez comment vous souhaitez être notifié</p>
                </div>
                <div className="space-y-4">
                  <NotificationSetting
                    title="Biais critiques détectés"
                    description="Recevoir une alerte immédiate en cas de détection de biais critique"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Rapports hebdomadaires"
                    description="Recevoir un résumé hebdomadaire de vos audits"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Audits programmés"
                    description="Rappels pour les audits automatiques programmés"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Mises à jour produit"
                    description="Nouvelles fonctionnalités et améliorations"
                    defaultChecked={false}
                  />
                </div>
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
                    <Button variant="outline">Modifier</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Sessions actives</p>
                      <p className="text-sm text-muted-foreground">Gérez vos sessions de connexion</p>
                    </div>
                    <Button variant="outline">Voir</Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 border-destructive">
                <div className="flex items-center gap-3 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Zone de danger</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Actions irréversibles concernant votre compte
                </p>
                <Button variant="destructive">Supprimer mon compte</Button>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function NotificationSetting({
  title,
  description,
  defaultChecked
}: {
  title: string
  description: string
  defaultChecked: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
