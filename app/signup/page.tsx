'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Eye, EyeOff, CheckCircle, Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1) // Étape 1: formulaire, Étape 2: choix plan

  // Controlled form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [sector, setSector] = useState('')
  const [size, setSize] = useState('')
  const [password, setPassword] = useState('')
  
  // F1.1.3: Profil entreprise étendu
  const [siret, setSiret] = useState('')
  const [address, setAddress] = useState('')
  const [dpoContact, setDpoContact] = useState('')
  
  // F1.1.5: Choix du plan
  const [plan, setPlan] = useState('freemium')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Validation du mot de passe
  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasLowerCase = /[a-z]/.test(pwd)
    
    return {
      isValid: hasMinLength && hasSpecialChar && hasNumber && hasUpperCase && hasLowerCase,
      hasMinLength,
      hasSpecialChar,
      hasNumber,
      hasUpperCase,
      hasLowerCase,
    }
  }

  const passwordValidation = validatePassword(password)

  // Validation étape 1
  const isStep1Valid = firstName && lastName && email && company && sector && size && password && passwordValidation.isValid

  async function handleFreemiumSignup() {
    await handleSubmit('freemium')
  }

  async function handleProSignup() {
    // Rediriger vers la page de paiement Stripe
    router.push('/payment?plan=pro')
  }

  async function handleEnterpriseRequest() {
    setLoading(true)
    setError(null)
    
    // TODO: Envoyer une demande à l'équipe AuditIQ via API
    try {
      // Simuler l'envoi de la demande
      await new Promise(resolve => setTimeout(resolve, 1000))
      setError('✅ Votre demande a été envoyée avec succès ! Notre équipe vous contactera sous 24h à l\'adresse : ' + email)
    } catch (err) {
      setError('Erreur lors de l\'envoi de la demande')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(selectedPlan: string) {
    setError(null)
    setLoading(true)

    const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8001'

    const payload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      company_name: company,
      sector,
      company_size: size,
      siret,
      company_address: address,
      dpo_contact: dpoContact,
      plan: selectedPlan,
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => null)
        let parsed: any = null
        try {
          parsed = body ? JSON.parse(body) : null
        } catch {
          parsed = null
        }

        if (parsed) {
          if (parsed.detail) setError(typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail))
          else if (parsed.message) setError(parsed.message)
          else setError(JSON.stringify(parsed))
        } else {
          setError(body || 'Erreur lors de la création du compte')
        }
        setLoading(false)
        return
      }

      // Server sets HttpOnly cookie for authentication. Redirect to onboarding.
      router.push('/onboarding')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  function handleNextStep() {
    if (!isStep1Valid) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    setError(null)
    setCurrentStep(2)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form - Scrollable */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Logo className="justify-center mb-6" />
            <h1 className="text-3xl font-bold tracking-tight">
              {currentStep === 1 ? 'Créez votre compte' : 'Choisissez votre plan'}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 1 
                ? 'Commencez à auditer vos algorithmes en quelques minutes'
                : 'Sélectionnez le plan qui correspond à vos besoins'}
            </p>
          </div>

          {currentStep === 1 ? (
            // ÉTAPE 1: FORMULAIRE D'INSCRIPTION
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email professionnelle</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Nom de l'entreprise</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Votre Entreprise SAS"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger id="sector" className="h-11">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="rh">Ressources Humaines</SelectItem>
                    <SelectItem value="retail">Commerce</SelectItem>
                    <SelectItem value="tech">Technologie</SelectItem>
                    <SelectItem value="health">Santé</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Taille entreprise</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger id="size" className="h-11">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employés</SelectItem>
                    <SelectItem value="11-50">11-50 employés</SelectItem>
                    <SelectItem value="51-200">51-200 employés</SelectItem>
                    <SelectItem value="201-500">201-500 employés</SelectItem>
                    <SelectItem value="500+">500+ employés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* F1.1.3: Profil entreprise étendu */}
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
              <Input
                id="siret"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                placeholder="123 456 789 00012"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse entreprise <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 rue de la République, 75001 Paris"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dpo">Contact DPO <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
              <Input
                id="dpo"
                value={dpoContact}
                onChange={(e) => setDpoContact(e.target.value)}
                placeholder="dpo@entreprise.com"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Si votre entreprise a un Délégué à la Protection des Données</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {password && (
                <div className="space-y-1 text-xs mt-2">
                  <div className={`flex items-center gap-1 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span>{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span>{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                    <span>Une lettre majuscule</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span>{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                    <span>Une lettre minuscule</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                    <span>Un chiffre</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                    <span>Un caractère spécial (!@#$%^&*...)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" className="mt-1" required />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                J'accepte les{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-11 text-base glow-primary" disabled={!isStep1Valid}>
              Suivant
            </Button>

            {error && (
              <p className="text-sm text-red-600 mt-2" role="alert">
                {error}
              </p>
            )}
          </form>
          ) : (
            // ÉTAPE 2: CHOIX DU PLAN
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Plan Freemium */}
                <div className="rounded-xl border-2 border-border hover:border-primary/50 p-6 space-y-4 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Freemium</h3>
                      <p className="text-3xl font-bold text-primary mt-2">Gratuit</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      Idéal pour démarrer
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>1 audit par mois</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Rapports basiques PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Support communautaire</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Documentation complète</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleFreemiumSignup} 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Inscription...' : 'Commencer gratuitement'}
                  </Button>
                </div>

                {/* Plan Pro */}
                <div className="rounded-xl border-2 border-primary p-6 space-y-4 bg-primary/5 relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    Le plus populaire
                  </span>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Pro</h3>
                      <p className="text-3xl font-bold text-primary mt-2">49€ <span className="text-base font-normal text-muted-foreground">/mois</span></p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span><strong>Audits illimités</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Rapports avancés avec recommandations IA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>API REST pour intégration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Support prioritaire (&lt; 24h)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Exports multiples (PDF, Excel, JSON)</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleProSignup} 
                    className="w-full glow-primary" 
                    size="lg"
                    disabled={loading}
                  >
                    Procéder au paiement
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Sans engagement • Résiliation à tout moment
                  </p>
                </div>

                {/* Plan Enterprise */}
                <div className="rounded-xl border-2 border-border hover:border-primary/50 p-6 space-y-4 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Enterprise</h3>
                      <p className="text-3xl font-bold text-primary mt-2">Sur mesure</p>
                    </div>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">
                      Contact commercial
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Tout du plan Pro +</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span><strong>Déploiement on-premise possible</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>SLA garanti 99.9%</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Account manager dédié</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Formation sur site</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Personnalisation des métriques</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleEnterpriseRequest} 
                    variant="outline"
                    className="w-full" 
                    size="lg"
                  >
                    Demander un devis
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Notre équipe vous contactera sous 24h
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-center text-primary mt-2" role="alert">
                  {error}
                </p>
              )}

              <Button 
                onClick={() => setCurrentStep(1)} 
                variant="ghost" 
                className="w-full"
              >
                ← Retour
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou s'inscrire avec
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-11" type="button">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iX9UGe131WleCUasf7qjg2thc6Wi6s.png" 
                    alt="Google" 
                    className="h-5 w-auto"
                  />
                </Button>
                <Button variant="outline" className="h-11" type="button">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TXyB1H5UL38Cd2ucnrBLnkF3XEd3fJ.png" 
                    alt="Microsoft" 
                    className="h-5 w-auto"
                  />
                </Button>
                <Button variant="outline" className="h-11" type="button">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-GLZgyggMq90d5POLFrkYrgRtMSoZ4L.png" 
                    alt="AWS" 
                    className="h-5 w-auto"
                  />
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-center">
              <strong className="text-primary">Plan Freemium disponible</strong> - Aucune carte bancaire requise
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits - Fixed and centered */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-secondary/20 via-primary/20 to-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(75,195,215,0.1),transparent_50%)]" />
        <div className="relative flex flex-col justify-center p-12 space-y-8 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Pourquoi Audit-IQ ?</h2>
            <p className="text-muted-foreground text-lg">
              La solution complète pour garantir l'équité de vos algorithmes
            </p>
          </div>
          
          <div className="space-y-6">
            <BenefitItem 
              icon="✓"
              title="Conformité garantie"
              description="Rapports AI Act et RGPD automatiques"
            />
            <BenefitItem 
              icon="✓"
              title="Détection avancée"
              description="8+ métriques de fairness et analyse intersectionnelle"
            />
            <BenefitItem 
              icon="✓"
              title="Recommandations IA"
              description="Suggestions de mitigation personnalisées"
            />
            <BenefitItem 
              icon="✓"
              title="Sécurité maximale"
              description="Hébergement UE, chiffrement AES-256"
            />
            <BenefitItem 
              icon="✓"
              title="Support dédié"
              description="Onboarding personnalisé et documentation complète"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BenefitItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
