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
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  // Controlled form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [sector, setSector] = useState('')
  const [size, setSize] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

      // Server sets HttpOnly cookie for authentication. Redirect on success.
      router.push('/dashboard')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Logo className="justify-center mb-6" />
            <h1 className="text-3xl font-bold tracking-tight">Créez votre compte</h1>
            <p className="text-muted-foreground">Commencez à auditer vos algorithmes en quelques minutes</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" className="mt-1" />
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

            <Button type="submit" className="w-full h-11 text-base glow-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>

            {error && (
              <p className="text-sm text-red-600 mt-2" role="alert">
                {error}
              </p>
            )}

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
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-center">
              <strong className="text-primary">14 jours d'essai gratuit</strong> - Aucune carte bancaire requise
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-secondary/20 via-primary/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(75,195,215,0.1),transparent_50%)]" />
        <div className="relative flex flex-col justify-center p-12 space-y-8">
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
