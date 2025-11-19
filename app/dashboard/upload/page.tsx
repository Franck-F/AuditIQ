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
import { Database, Upload, FileSpreadsheet, ArrowRight, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'connection'>('file')
  const [step, setStep] = useState(1)

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setStep(2)
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
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <ConnectionCard
                      icon={<FileSpreadsheet className="h-6 w-6" />}
                      name="Google Sheets"
                      description="Connectez directement vos feuilles Google"
                    />
                    <ConnectionCard
                      icon={<Database className="h-6 w-6" />}
                      name="Salesforce"
                      description="Import depuis Salesforce CRM"
                    />
                    <ConnectionCard
                      icon={<Database className="h-6 w-6" />}
                      name="Workday"
                      description="Données RH depuis Workday"
                    />
                    <ConnectionCard
                      icon={<Database className="h-6 w-6" />}
                      name="HubSpot"
                      description="Connectez votre CRM HubSpot"
                    />
                    <ConnectionCard
                      icon={<Database className="h-6 w-6" />}
                      name="API REST"
                      description="Connexion via API personnalisée"
                    />
                    <ConnectionCard
                      icon={<Database className="h-6 w-6" />}
                      name="Autre"
                      description="Autres sources de données"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Preview Step */}
          {step === 2 && file && (
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
                        <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Âge</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Genre</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Décision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="hover:bg-accent/50">
                          <td className="px-4 py-3 text-sm">***{i}</td>
                          <td className="px-4 py-3 text-sm">{25 + i * 5}</td>
                          <td className="px-4 py-3 text-sm">{i % 2 === 0 ? 'F' : 'M'}</td>
                          <td className="px-4 py-3 text-sm">{70 + i * 3}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              i % 3 === 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {i % 3 === 0 ? 'Accepté' : 'Rejeté'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fichier : {file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    50 premières lignes affichées - {Math.floor(Math.random() * 1000)} lignes au total
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
          {step === 3 && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Configuration de l'audit</h2>
                <p className="text-muted-foreground">
                  Configurez les paramètres de votre audit de fairness
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="usecase">Cas d'usage</Label>
                  <Select>
                    <SelectTrigger id="usecase">
                      <SelectValue placeholder="Sélectionner un cas d'usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruitment">Recrutement (tri CV)</SelectItem>
                      <SelectItem value="scoring">Scoring client (crédit)</SelectItem>
                      <SelectItem value="support">Service client</SelectItem>
                      <SelectItem value="marketing">Marketing (segmentation)</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Variable cible (à prédire)</Label>
                  <Select>
                    <SelectTrigger id="target">
                      <SelectValue placeholder="Sélectionner la variable cible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="decision">Décision</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="class">Classification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensitive">Attributs sensibles</Label>
                  <Select>
                    <SelectTrigger id="sensitive">
                      <SelectValue placeholder="Sélectionner les attributs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="age">Âge</SelectItem>
                      <SelectItem value="gender">Genre</SelectItem>
                      <SelectItem value="origin">Origine</SelectItem>
                      <SelectItem value="multiple">Plusieurs attributs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metric">Métriques de fairness</Label>
                  <Select>
                    <SelectTrigger id="metric">
                      <SelectValue placeholder="Sélectionner les métriques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les métriques</SelectItem>
                      <SelectItem value="demographic">Demographic Parity</SelectItem>
                      <SelectItem value="equal">Equal Opportunity</SelectItem>
                      <SelectItem value="equalized">Equalized Odds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Détection automatique activée</p>
                    <p className="text-sm text-muted-foreground">
                      Le système détectera automatiquement les variables proxy et les corrélations suspectes
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button onClick={() => setStep(4)} className="gap-2 glow-primary">
                  Lancer l'audit
                  <ArrowRight className="h-4 w-4" />
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

function ConnectionCard({ icon, name, description }: {
  icon: React.ReactNode
  name: string
  description: string
}) {
  return (
    <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer group">
      <div className="space-y-3">
        <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
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
