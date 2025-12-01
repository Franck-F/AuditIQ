'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { FileUpload } from '@/components/dashboard/file-upload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Database, Upload, FileSpreadsheet, ArrowRight, CheckCircle2, AlertCircle, Info, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ConnectionIcon } from '@/components/ui/connection-icons'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface DatasetPreview {
  dataset_id: number
  filename: string
  row_count: number
  column_count: number
  columns_info: Array<{
    name: string
    type: string
    null_count: number
    null_percentage: number
    unique_count: number
    sample_values: any[]
  }>
  preview_data: any[]
  file_size: number
  encoding: string
}

interface AuditConfig {
  use_case: string
  target_column: string
  sensitive_attributes: string[]
  fairness_metrics: string[]
  anonymization_method?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'connection'>('file')
  const [step, setStep] = useState(1)
  const [preview, setPreview] = useState<DatasetPreview | null>(null)
  const [config, setConfig] = useState<AuditConfig>({
    use_case: '',
    target_column: '',
    sensitive_attributes: [],
    fairness_metrics: []
  })
  const [saving, setSaving] = useState(false)
  const [showMissingValuesModal, setShowMissingValuesModal] = useState(false)
  const [missingValuesAnalysis, setMissingValuesAnalysis] = useState<any>(null)
  const [missingValuesStrategies, setMissingValuesStrategies] = useState<Record<string, string>>({})
  const [processingMissing, setProcessingMissing] = useState(false)

  const handleConnectionClick = () => {
    router.push('/dashboard/connections')
  }

  const handleFileUpload = (uploadedFile: File, previewData: DatasetPreview) => {
    setFile(uploadedFile)
    setPreview(previewData)
    
    // Vérification de sécurité
    if (!previewData.columns_info || !Array.isArray(previewData.columns_info)) {
      toast({
        title: "Erreur de données",
        description: "Les informations de colonnes sont manquantes",
        variant: "destructive"
      })
      return
    }
    
    setStep(2)
    
    toast({
      title: "Upload réussi",
      description: `${previewData.filename} - ${previewData.row_count} lignes, ${previewData.column_count} colonnes`,
    })
  }

  const handleAnalyzeMissingValues = async () => {
    if (!preview) return

    try {
      const response = await fetch(`${API_URL}/api/upload/datasets/${preview.dataset_id}/missing-values`, {
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Erreur lors de l\'analyse')
      }

      const data = await response.json()
      setMissingValuesAnalysis(data)
      setShowMissingValuesModal(true)
    } catch (error: any) {
      console.error('Erreur analyse valeurs manquantes:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'analyser les valeurs manquantes",
        variant: "destructive"
      })
    }
  }

  const handleApplyMissingValuesStrategy = async () => {
    if (!preview || Object.keys(missingValuesStrategies).length === 0) return

    setProcessingMissing(true)
    try {
      const response = await fetch(`${API_URL}/api/upload/datasets/${preview.dataset_id}/handle-missing-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ strategy: missingValuesStrategies })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Erreur lors du traitement')
      }

      const result = await response.json()
      
      toast({
        title: "Traitement réussi",
        description: `${result.rows_removed} lignes supprimées. ${result.columns_after} colonnes conservées.`
      })

      setShowMissingValuesModal(false)
      setMissingValuesStrategies({})
      
      // Recharger les données du dataset pour mettre à jour le preview
      const detailsResponse = await fetch(`${API_URL}/api/upload/datasets/${preview.dataset_id}`, {
        credentials: 'include'
      })
      
      if (detailsResponse.ok) {
        const updatedDataset = await detailsResponse.json()
        
        // Mettre à jour le preview avec les nouvelles données
        setPreview({
          ...preview,
          row_count: updatedDataset.row_count,
          column_count: updatedDataset.column_count,
          columns_info: updatedDataset.columns_info?.columns || updatedDataset.columns_info || preview.columns_info
        })
        
        toast({
          title: "Données mises à jour",
          description: "Le preview a été actualisé avec les données traitées"
        })
      }
    } catch (error: any) {
      console.error('Erreur traitement valeurs manquantes:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'appliquer le traitement",
        variant: "destructive"
      })
    } finally {
      setProcessingMissing(false)
    }
  }

  const handleSaveConfiguration = async () => {
    if (!preview) return

    // Validation
    if (!config.use_case) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un cas d'usage",
        variant: "destructive"
      })
      return
    }

    if (!config.target_column) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner une variable cible",
        variant: "destructive"
      })
      return
    }

    if (config.sensitive_attributes.length === 0) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner au moins un attribut sensible",
        variant: "destructive"
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`${API_URL}/api/upload/datasets/${preview.dataset_id}/configure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()
      
      toast({
        title: "Configuration enregistrée",
        description: "Vos paramètres ont été sauvegardés avec succès",
      })

      setStep(4)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Upload de données</h1>
            <p className="text-muted-foreground">
              Importez vos données pour démarrer un nouvel audit de fairness
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            <StepIndicator number={1} title="Import" active={step === 1} completed={step > 1} />
            <div className="h-px w-12 bg-border" />
            <StepIndicator number={2} title="Prévisualisation" active={step === 2} completed={step > 2} />
            <div className="h-px w-12 bg-border" />
            <StepIndicator number={3} title="Configuration" active={step === 3} completed={step > 3} />
            <div className="h-px w-12 bg-border" />
            <StepIndicator number={4} title="Audit" active={step === 4} completed={step > 4} />
          </div>

          {/* Upload Methods */}
          {step === 1 && (
            <>
              <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="file" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Fichier
                  </TabsTrigger>
                  <TabsTrigger value="connection" className="gap-2">
                    <Database className="h-4 w-4" />
                    Connexion directe
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-6">
                  <Card className="p-8">
                    <FileUpload onUpload={handleFileUpload} />
                  </Card>

                  <Card className="p-6 mt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Informations importantes
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Les données sont automatiquement anonymisées pour garantir la conformité RGPD</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Les fichiers sont chiffrés en AES-256 et supprimés après 30 jours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Limite : 10k lignes (Freemium), 100k (Pro), 1M+ (Enterprise)</span>
                      </li>
                    </ul>
                  </Card>
                </TabsContent>

                <TabsContent value="connection" className="mt-6">
                  <div className="space-y-4">
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Configuration des connexions</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Configurez d'abord vos connexions aux sources de données, puis revenez ici pour importer les données.
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <ConnectionCard
                        icon={<FileSpreadsheet className="h-6 w-6" />}
                        name="Google Sheets"
                        description="Connectez directement vos feuilles Google"
                        onClick={handleConnectionClick}
                        type="google_sheets"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="Salesforce"
                        description="Import depuis Salesforce CRM"
                        onClick={handleConnectionClick}
                        type="salesforce"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="Workday"
                        description="Données RH depuis Workday"
                        onClick={handleConnectionClick}
                        type="workday"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="BambooHR"
                        description="Données RH depuis BambooHR"
                        onClick={handleConnectionClick}
                        type="bamboohr"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="HubSpot"
                        description="Connectez votre CRM HubSpot"
                        onClick={handleConnectionClick}
                        type="hubspot"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="Pipedrive"
                        description="Connectez votre CRM Pipedrive"
                        onClick={handleConnectionClick}
                        type="pipedrive"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="API REST"
                        description="Connexion via API personnalisée"
                        onClick={handleConnectionClick}
                        type="rest_api"
                      />
                      <ConnectionCard
                        icon={<Database className="h-6 w-6" />}
                        name="Autre"
                        description="Autres sources de données"
                        onClick={handleConnectionClick}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Preview Step */}
          {step === 2 && preview && preview.columns_info && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Prévisualisation des données</h2>
                <p className="text-muted-foreground">
                  Vérifiez que vos données sont correctement formatées
                </p>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {preview.columns_info.slice(0, 6).map((col) => (
                          <th key={col.name} className="px-4 py-3 text-left text-sm font-medium">
                            {col.name}
                            <span className="ml-2 text-xs text-muted-foreground">({col.type})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {preview.preview_data.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-accent/50">
                          {preview.columns_info.slice(0, 6).map((col) => (
                            <td key={col.name} className="px-4 py-3 text-sm">
                              {row[col.name]?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Lignes</p>
                  <p className="text-2xl font-bold">{preview.row_count.toLocaleString()}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Colonnes</p>
                  <p className="text-2xl font-bold">{preview.column_count}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Encodage</p>
                  <p className="text-2xl font-bold">{preview.encoding}</p>
                </Card>
              </div>

              {/* Missing Values Warning */}
              {preview.columns_info.some(col => col.null_count > 0) && (
                <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          Valeurs manquantes détectées
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                          {preview.columns_info.filter(col => col.null_count > 0).length} colonne(s) 
                          contiennent des valeurs manquantes qui peuvent affecter l'audit.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {preview.columns_info
                          .filter(col => col.null_count > 0)
                          .slice(0, 5)
                          .map(col => (
                            <Badge key={col.name} variant="outline" className="bg-white dark:bg-gray-900">
                              {col.name}: {col.null_count} ({col.null_percentage.toFixed(1)}%)
                            </Badge>
                          ))}
                        {preview.columns_info.filter(col => col.null_count > 0).length > 5 && (
                          <Badge variant="outline" className="bg-white dark:bg-gray-900">
                            +{preview.columns_info.filter(col => col.null_count > 0).length - 5} autres
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAnalyzeMissingValues}
                        className="mt-2"
                      >
                        Gérer les valeurs manquantes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fichier : {preview.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    10 premières lignes affichées sur {preview.row_count.toLocaleString()} au total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Données valides</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button onClick={() => setStep(3)} className="gap-2">
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Configuration Step */}
          {step === 3 && preview && preview.columns_info && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Configuration de l'audit</h2>
                <p className="text-muted-foreground">
                  Configurez les paramètres de votre audit de fairness
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="usecase">Cas d'usage *</Label>
                  <Select value={config.use_case} onValueChange={(value) => setConfig({ ...config, use_case: value })}>
                    <SelectTrigger id="usecase">
                      <SelectValue placeholder="Sélectionner un cas d'usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruitment">Recrutement (tri CV)</SelectItem>
                      <SelectItem value="scoring">Scoring client (crédit)</SelectItem>
                      <SelectItem value="support">Service client</SelectItem>
                      <SelectItem value="marketing">Marketing (segmentation)</SelectItem>
                      <SelectItem value="hr_evaluation">Évaluation RH</SelectItem>
                      <SelectItem value="insurance">Assurance (tarification)</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Variable cible (à prédire) *</Label>
                  <Select value={config.target_column} onValueChange={(value) => setConfig({ ...config, target_column: value })}>
                    <SelectTrigger id="target">
                      <SelectValue placeholder="Sélectionner la variable cible" />
                    </SelectTrigger>
                    <SelectContent>
                      {preview.columns_info.map((col) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sensitive">Attributs sensibles *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Sélectionnez les colonnes contenant des informations sensibles (âge, genre, origine, etc.)
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {preview.columns_info.map((col) => (
                      <label key={col.name} className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.sensitive_attributes.includes(col.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({ 
                                ...config, 
                                sensitive_attributes: [...config.sensitive_attributes, col.name] 
                              })
                            } else {
                              setConfig({ 
                                ...config, 
                                sensitive_attributes: config.sensitive_attributes.filter(a => a !== col.name) 
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{col.name}</span>
                        <span className="text-xs text-muted-foreground">({col.type})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="anonymization">Méthode d'anonymisation RGPD</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Anonymisez automatiquement les attributs sensibles pour la conformité RGPD
                  </p>
                  <Select 
                    value={config.anonymization_method || 'none'} 
                    onValueChange={(value) => setConfig({ ...config, anonymization_method: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger id="anonymization">
                      <SelectValue placeholder="Pas d'anonymisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Pas d'anonymisation</SelectItem>
                      <SelectItem value="hash">
                        Hachage (SHA256) - Irréversible
                      </SelectItem>
                      <SelectItem value="pseudonym">
                        Pseudonymisation - Cohérent
                      </SelectItem>
                      <SelectItem value="suppression">
                        Suppression - Masquage complet
                      </SelectItem>
                      <SelectItem value="generalization">
                        Généralisation - Réduction précision
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {config.anonymization_method && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Attention :</strong> L'anonymisation modifiera définitivement les données. Les attributs sensibles sélectionnés seront transformés selon la méthode choisie.
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="metric">Métriques de fairness *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Choisissez les métriques pour évaluer l'équité de votre modèle
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      { value: 'demographic_parity', label: 'Demographic Parity', desc: 'Égalité des taux de décisions positives' },
                      { value: 'equal_opportunity', label: 'Equal Opportunity', desc: 'Égalité des vrais positifs' },
                      { value: 'equalized_odds', label: 'Equalized Odds', desc: 'Égalité des vrais et faux positifs' },
                      { value: 'disparate_impact', label: 'Disparate Impact', desc: 'Ratio des taux de sélection' },
                    ].map((metric) => (
                      <label key={metric.value} className="flex items-start gap-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.fairness_metrics.includes(metric.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({ 
                                ...config, 
                                fairness_metrics: [...config.fairness_metrics, metric.value] 
                              })
                            } else {
                              setConfig({ 
                                ...config, 
                                fairness_metrics: config.fairness_metrics.filter(m => m !== metric.value) 
                              })
                            }
                          }}
                          className="rounded mt-1"
                        />
                        <div>
                          <p className="text-sm font-medium">{metric.label}</p>
                          <p className="text-xs text-muted-foreground">{metric.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Détection automatique activée</p>
                    <p className="text-sm text-muted-foreground">
                      Le système détectera automatiquement les variables proxy (corrélation {'>'} 0.7) et les corrélations suspectes avec les attributs sensibles
                    </p>
                  </div>
                </div>
              </div>

              {/* Résumé de la configuration */}
              {(config.use_case || config.target_column || config.sensitive_attributes.length > 0) && (
                <Card className="p-4 bg-muted/50">
                  <h4 className="text-sm font-semibold mb-3">Résumé de la configuration</h4>
                  <div className="space-y-2 text-sm">
                    {config.use_case && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Cas d'usage :</span> {config.use_case}
                        </div>
                      </div>
                    )}
                    {config.target_column && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Variable cible :</span> {config.target_column}
                        </div>
                      </div>
                    )}
                    {config.sensitive_attributes.length > 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Attributs sensibles :</span> {config.sensitive_attributes.join(', ')}
                        </div>
                      </div>
                    )}
                    {config.fairness_metrics.length > 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Métriques :</span> {config.fairness_metrics.length} sélectionnée(s)
                        </div>
                      </div>
                    )}
                    {config.anonymization_method && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Anonymisation :</span> {
                            config.anonymization_method === 'hash' ? 'Hachage SHA256' :
                            config.anonymization_method === 'pseudonym' ? 'Pseudonymisation' :
                            config.anonymization_method === 'suppression' ? 'Suppression' :
                            config.anonymization_method === 'generalization' ? 'Généralisation' : ''
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button 
                  onClick={handleSaveConfiguration} 
                  className="gap-2 glow-primary"
                  disabled={saving || !config.use_case || !config.target_column || config.sensitive_attributes.length === 0}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      Enregistrer et lancer l'audit
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Processing Step */}
          {step === 4 && (
            <Card className="p-12 text-center space-y-6">
              <div className="inline-flex rounded-full bg-primary/10 p-6 mx-auto">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Audit en cours...</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Analyse des biais, calcul des métriques de fairness et génération des recommandations
                </p>
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <ProcessingStep label="Chargement des données" progress={100} />
                <ProcessingStep label="Analyse des attributs sensibles" progress={100} />
                <ProcessingStep label="Calcul des métriques de fairness" progress={75} />
                <ProcessingStep label="Génération des recommandations" progress={30} />
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Missing Values Modal */}
      <Dialog open={showMissingValuesModal} onOpenChange={setShowMissingValuesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des valeurs manquantes</DialogTitle>
            <DialogDescription>
              Choisissez une stratégie de traitement pour chaque colonne contenant des valeurs manquantes
            </DialogDescription>
          </DialogHeader>

          {missingValuesAnalysis && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{missingValuesAnalysis.columns_with_missing?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Colonnes affectées</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{missingValuesAnalysis.total_rows?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Lignes totales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {missingValuesAnalysis.has_missing_values ? 'Oui' : 'Non'}
                    </p>
                    <p className="text-sm text-muted-foreground">Nécessite un traitement</p>
                  </div>
                </div>
              </Card>

              {/* Column Cards */}
              <div className="space-y-3">
                {missingValuesAnalysis.missing_analysis && Object.entries(missingValuesAnalysis.missing_analysis).map(([columnName, info]: [string, any]) => (
                  <Card key={columnName} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{columnName}</h4>
                            <Badge variant={
                              info.severity === 'critical' ? 'destructive' :
                              info.severity === 'high' ? 'destructive' :
                              info.severity === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {info.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {info.count} valeurs manquantes ({info.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`strategy-${columnName}`}>Stratégie de traitement</Label>
                        <Select
                          value={missingValuesStrategies[columnName] || ''}
                          onValueChange={(value) => {
                            setMissingValuesStrategies(prev => ({
                              ...prev,
                              [columnName]: value
                            }))
                          }}
                        >
                          <SelectTrigger id={`strategy-${columnName}`}>
                            <SelectValue placeholder="Sélectionner une stratégie" />
                          </SelectTrigger>
                          <SelectContent>
                            {info.available_strategies?.map((strategy: string) => {
                              const strategyInfo = missingValuesAnalysis.available_strategies?.[strategy]
                              const displayName = strategyInfo?.name || strategy
                              return (
                                <SelectItem key={strategy} value={strategy}>
                                  {strategy === info.recommended_strategy && '⭐ '}
                                  {displayName}
                                  {strategy === info.recommended_strategy && ' (Recommandé)'}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {missingValuesStrategies[columnName] && missingValuesAnalysis.available_strategies?.[missingValuesStrategies[columnName]] && (
                          <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                            <p className="font-medium">{missingValuesAnalysis.available_strategies[missingValuesStrategies[columnName]].name}</p>
                            <p className="text-muted-foreground">{missingValuesAnalysis.available_strategies[missingValuesStrategies[columnName]].description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMissingValuesModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleApplyMissingValuesStrategy}
              disabled={processingMissing || Object.keys(missingValuesStrategies).length === 0}
            >
              {processingMissing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Appliquer les stratégies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StepIndicator({ number, title, active, completed }: {
  number: number
  title: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors",
        completed && "border-primary bg-primary text-primary-foreground",
        active && !completed && "border-primary text-primary",
        !active && !completed && "border-border text-muted-foreground"
      )}>
        {completed ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <span className={cn(
        "text-sm font-medium",
        (active || completed) ? "text-foreground" : "text-muted-foreground"
      )}>
        {title}
      </span>
    </div>
  )
}

function ConnectionCard({ icon, name, description, onClick, type }: {
  icon: React.ReactNode
  name: string
  description: string
  onClick?: () => void
  type?: string
}) {
  return (
    <Card 
      className="p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer group" 
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow mx-auto">
          {type ? (
            <ConnectionIcon type={type} className="h-12 w-12" />
          ) : (
            <div className="text-primary group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="font-semibold group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </Card>
  )
}

function ProcessingStep({ label, progress }: { label: string; progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
