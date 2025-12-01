'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, RefreshCw, Trash2, Settings, CheckCircle2, XCircle, Loader2, Database } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ConnectionIcon } from '@/components/ui/connection-icons'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ConnectionType {
  type: string
  name: string
  description: string
  required_fields: string[]
  auth_types: string[]
  icon: string
}

interface Connection {
  id: number
  connection_type: string
  name: string
  config: any
  is_active: boolean
  last_sync: string | null
  last_sync_status: string | null
  auto_sync_enabled: boolean
  sync_frequency: string | null
  created_at: string
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<number | null>(null)
  
  // Form state
  const [selectedType, setSelectedType] = useState('')
  const [connectionName, setConnectionName] = useState('')
  const [config, setConfig] = useState<Record<string, any>>({})
  const [credentials, setCredentials] = useState<Record<string, any>>({})

  useEffect(() => {
    loadConnectionTypes()
    loadConnections()
  }, [])

  useEffect(() => {
    console.log('🎯 État actuel:', {
      showCreateModal,
      connectionTypesCount: connectionTypes.length,
      selectedType,
      connectionName
    })
  }, [showCreateModal, connectionTypes, selectedType, connectionName])

  const loadConnectionTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/connections/types`, {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('📋 Types de connexion chargés:', data)
      setConnectionTypes(data)
    } catch (error) {
      console.error('❌ Erreur chargement types:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les types de connexions",
        variant: "destructive"
      })
    }
  }

  const loadConnections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/connections/`, {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        // Non authentifié - rediriger vers login
        console.log('❌ Non authentifié - redirection vers login')
        window.location.href = '/login'
        return
      }
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Connexions chargées:', data)
      setConnections(data)
    } catch (error: any) {
      console.error('❌ Erreur chargement connexions:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les connexions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConnection = async () => {
    if (!selectedType || !connectionName) {
      toast({
        title: "Validation",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      })
      return
    }

    try {
      // Test de la connexion d'abord
      const testResponse = await fetch(`${API_URL}/connections/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connection_type: selectedType,
          config,
          credentials: Object.keys(credentials).length > 0 ? credentials : null
        })
      })

      const testResult = await testResponse.json()

      if (!testResult.success) {
        toast({
          title: "Test de connexion échoué",
          description: testResult.error || "Impossible de se connecter",
          variant: "destructive"
        })
        return
      }

      // Créer la connexion
      const response = await fetch(`${API_URL}/connections/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connection_type: selectedType,
          name: connectionName,
          config,
          credentials: Object.keys(credentials).length > 0 ? credentials : null,
          auto_sync_enabled: false
        })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Connexion créée avec succès"
        })
        setShowCreateModal(false)
        resetForm()
        loadConnections()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la connexion",
        variant: "destructive"
      })
    }
  }

  const handleSync = async (connectionId: number) => {
    setSyncing(connectionId)
    try {
      const response = await fetch(`${API_URL}/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          save_as_dataset: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Synchronisation réussie",
          description: `${result.rows_fetched} lignes récupérées`
        })
        loadConnections()
      }
    } catch (error: any) {
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "La synchronisation a échoué",
        variant: "destructive"
      })
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (connectionId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette connexion ?")) return

    try {
      const response = await fetch(`${API_URL}/connections/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Connexion supprimée"
        })
        loadConnections()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la connexion",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setSelectedType('')
    setConnectionName('')
    setConfig({})
    setCredentials({})
  }

  const getConnectionTypeInfo = (type: string) => {
    return connectionTypes.find(ct => ct.type === type)
  }

  const renderConfigFields = () => {
    const typeInfo = getConnectionTypeInfo(selectedType)
    if (!typeInfo) return null

    return typeInfo.required_fields.map(field => (
      <div key={field} className="space-y-2">
        <Label htmlFor={field}>{field}</Label>
        <Input
          id={field}
          value={config[field] || ''}
          onChange={(e) => setConfig({ ...config, [field]: e.target.value })}
          placeholder={`Entrez ${field}`}
        />
      </div>
    ))
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Connexions de Données
                </h1>
                <p className="text-muted-foreground text-sm md:text-lg">
                  Connectez et synchronisez vos sources de données externes
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                <span className="sm:inline">Nouvelle Connexion</span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="p-4 md:p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-primary/10 rounded-lg shrink-0">
                    <Database className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Connexions actives</p>
                    <p className="text-xl md:text-2xl font-bold truncate">
                      {connections.filter(c => c.is_active).length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 md:p-6 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-green-500/10 rounded-lg shrink-0">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Syncs réussies</p>
                    <p className="text-xl md:text-2xl font-bold truncate">
                      {connections.filter(c => c.last_sync_status === 'success').length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 md:p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg shrink-0">
                    <Settings className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Total connexions</p>
                    <p className="text-xl md:text-2xl font-bold truncate">{connections.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Connexions List */}
            {loading ? (
              <Card className="p-8 md:p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
                  <p className="text-sm md:text-base text-muted-foreground">Chargement des connexions...</p>
                </div>
              </Card>
            ) : connections.length === 0 ? (
              <Card className="p-8 md:p-16 text-center border-dashed border-2 bg-gradient-to-br from-muted/30 to-muted/50">
                <div className="mx-auto w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner">
                  <Database className="h-12 w-12 md:h-16 md:w-16 text-primary/60" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Aucune connexion configurée</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">
                  Créez votre première connexion pour commencer à importer des données automatiquement depuis vos sources externes
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-5 w-5" />
                  Créer ma première connexion
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg md:text-xl font-semibold">Mes connexions</h2>
                  <Badge variant="secondary" className="text-xs md:text-sm w-fit">
                    {connections.length} connexion{connections.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                  {connections.map(connection => {
                    const typeInfo = getConnectionTypeInfo(connection.connection_type)
                    const isActive = connection.is_active
                    const lastSyncSuccess = connection.last_sync_status === 'success'
                    
                    return (
                      <Card 
                        key={connection.id} 
                        className={`group hover:shadow-lg transition-all duration-200 ${
                          isActive ? 'border-primary/20' : 'border-muted'
                        }`}
                      >
                        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                              <div className={`p-1.5 md:p-2 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive 
                                  ? 'bg-white dark:bg-gray-800 shadow-sm' 
                                  : 'bg-muted'
                              }`}>
                                <ConnectionIcon type={connection.connection_type} className="h-6 w-6 md:h-8 md:w-8" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base md:text-lg truncate group-hover:text-primary transition-colors">
                                  {connection.name}
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">
                                  {typeInfo?.name || connection.connection_type}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={isActive ? "default" : "secondary"}
                              className="shrink-0 text-xs"
                            >
                              {isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </div>

                          {/* Sync Status */}
                          {connection.last_sync && (
                            <div className={`flex items-center gap-2 p-2 md:p-3 rounded-lg ${
                              lastSyncSuccess 
                                ? 'bg-green-500/10 border border-green-500/20' 
                                : 'bg-red-500/10 border border-red-500/20'
                            }`}>
                              {lastSyncSuccess ? (
                                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {lastSyncSuccess ? 'Dernière synchronisation réussie' : 'Échec de synchronisation'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {new Date(connection.last_sync).toLocaleString('fr-FR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}
                                </p>
                              </div>
                            </div>
                          )}

                          {!connection.last_sync && (
                            <div className="flex items-center gap-2 p-2 md:p-3 rounded-lg bg-muted/50 border border-dashed">
                              <Settings className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                Aucune synchronisation effectuée
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSync(connection.id)}
                              disabled={syncing === connection.id}
                              className="flex-1 gap-1.5 md:gap-2 text-xs md:text-sm"
                            >
                              {syncing === connection.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                                  <span className="hidden sm:inline">Synchronisation...</span>
                                  <span className="sm:hidden">Sync...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                  <span className="hidden sm:inline">Synchroniser</span>
                                  <span className="sm:hidden">Sync</span>
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(connection.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 md:px-3"
                            >
                              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Connection Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">Nouvelle Connexion</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Sélectionnez et configurez une source de données externe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="type" className="text-sm md:text-base font-semibold">
                Type de connexion
              </Label>
              
              {/* Version boutons - Grille moderne */}
              {connectionTypes.length === 0 ? (
                <div className="p-6 md:p-8 text-center border border-dashed rounded-lg bg-muted/30">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary mx-auto mb-2 md:mb-3" />
                  <p className="text-xs md:text-sm text-muted-foreground">Chargement des types de connexion...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {connectionTypes.map(type => {
                    const isSelected = selectedType === type.type
                    return (
                      <button
                        key={type.type}
                        type="button"
                        onClick={() => {
                          console.log('🔄 Type sélectionné (bouton):', type.type)
                          setSelectedType(type.type)
                        }}
                        className={`group p-3 md:p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className={`p-1.5 md:p-2 rounded-lg transition-colors bg-white dark:bg-gray-800 shrink-0 ${
                            isSelected 
                              ? 'shadow-md' 
                              : 'shadow-sm group-hover:shadow-md'
                          }`}>
                            <ConnectionIcon type={type.type} className="h-6 w-6 md:h-8 md:w-8" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`font-semibold text-sm md:text-base transition-colors truncate ${
                                isSelected ? 'text-primary' : 'group-hover:text-primary'
                              }`}>
                                {type.name}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedType && (
              <div className="space-y-4 md:space-y-5 pt-3 md:pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base font-semibold">
                    Nom de la connexion
                  </Label>
                  <Input
                    id="name"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    placeholder="Ex: Mon CRM Salesforce"
                    className="h-10 md:h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Donnez un nom explicite pour identifier facilement cette connexion
                  </p>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label className="text-sm md:text-base font-semibold">
                    Configuration
                  </Label>
                  <div className="space-y-3 md:space-y-4 p-3 md:p-4 rounded-lg bg-muted/30 border">
                    {renderConfigFields()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}
              className="gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateConnection}
              disabled={!selectedType || !connectionName}
              className="gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Créer la connexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
