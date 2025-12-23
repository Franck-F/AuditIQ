'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Upload, Target, Sparkles } from 'lucide-react'

type OnboardingStep = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [useCase, setUseCase] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const progress = (step / 3) * 100

  async function handleComplete() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    try {
      // Only update if user selected a use case
      if (useCase) {
        const res = await fetch(`${API_URL}/api/settings/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Send cookies
          body: JSON.stringify({
            use_case: useCase,
            onboarding_completed: 4
          })
        })

        if (!res.ok) {
          console.warn('Impossible de sauvegarder l\'onboarding, continuation vers le dashboard')
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde de l\'onboarding:', error)
    } finally {
      // Always redirect to dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo className="justify-center mb-6" />
            <h1 className="text-3xl font-bold mb-2">Bienvenue sur Audit-IQ !</h1>
            <p className="text-muted-foreground">Configurons votre plateforme en 3 étapes rapides</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm">
              <span className={step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                1. Présentation
              </span>
              <span className={step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                2. Cas d'usage
              </span>
              <span className={step >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                3. Premier dataset
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Présentation */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Découvrez Audit-IQ
                </CardTitle>
                <CardDescription>
                  Votre plateforme d'audit de fairness algorithmique conforme AI Act
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <FeatureItem
                    icon={<CheckCircle className="h-5 w-5" />}
                    title="Détection automatique des biais"
                    description="8+ métriques de fairness pour identifier les discriminations"
                  />
                  <FeatureItem
                    icon={<CheckCircle className="h-5 w-5" />}
                    title="Rapports de conformité"
                    description="Génération automatique des rapports AI Act et RGPD"
                  />
                  <FeatureItem
                    icon={<CheckCircle className="h-5 w-5" />}
                    title="Recommandations IA"
                    description="Suggestions personnalisées de mitigation des biais"
                  />
                  <FeatureItem
                    icon={<CheckCircle className="h-5 w-5" />}
                    title="Sécurité maximale"
                    description="Hébergement UE, chiffrement AES-256, conformité RGPD"
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-center">
                    <strong className="text-primary">Commencez dès maintenant</strong> - Toutes les fonctionnalités incluses
                  </p>
                </div>

                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  Commencer la configuration
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Configuration cas d'usage */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Quel est votre cas d'usage principal ?
                </CardTitle>
                <CardDescription>
                  Nous personnaliserons votre expérience en fonction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={useCase} onValueChange={setUseCase}>
                  <div className="space-y-3">
                    <UseCaseOption
                      value="recrutement"
                      title="Recrutement"
                      description="Audit des algorithmes de tri de CV et de matching candidats"
                      icon="👔"
                    />
                    <UseCaseOption
                      value="scoring"
                      title="Scoring crédit / risque"
                      description="Vérification de l'équité des modèles de notation"
                      icon="💳"
                    />
                    <UseCaseOption
                      value="service_client"
                      title="Service client"
                      description="Analyse des systèmes de routage et priorisation"
                      icon="💬"
                    />
                    <UseCaseOption
                      value="marketing"
                      title="Marketing / Pricing"
                      description="Audit des algorithmes de ciblage et tarification"
                      icon="📊"
                    />
                    <UseCaseOption
                      value="autre"
                      title="Autre cas d'usage"
                      description="Nous vous accompagnerons pour configurer votre besoin"
                      icon="⚙️"
                    />
                  </div>
                </RadioGroup>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1">
                    Retour
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!useCase}
                    size="lg" 
                    className="flex-1"
                  >
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Import dataset */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Importez votre premier dataset de test
                </CardTitle>
                <CardDescription>
                  Optionnel - Vous pourrez le faire plus tard depuis le dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.json"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-2">
                      {file ? file.name : 'Cliquez pour sélectionner un fichier'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formats supportés : CSV, Excel, JSON (max 10MB)
                    </p>
                  </label>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium">📋 Format recommandé :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Une ligne par observation</li>
                    <li>Une colonne pour la variable cible (décision de l'algorithme)</li>
                    <li>Les attributs protégés clairement identifiés (genre, âge, origine...)</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(2)} variant="outline" size="lg" className="flex-1">
                    Retour
                  </Button>
                  <Button onClick={handleComplete} size="lg" className="flex-1">
                    {file ? 'Terminer et analyser' : 'Passer cette étape'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 text-primary mt-0.5">{icon}</div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function UseCaseOption({ value, title, description, icon }: { 
  value: string; 
  title: string; 
  description: string; 
  icon: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
      <RadioGroupItem value={value} id={value} className="mt-1" />
      <label htmlFor={value} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </label>
    </div>
  )
}
