'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/config/api'

// Composant interne qui utilise useSearchParams
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Vérification de votre email en cours...')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de vérification manquant.')
      return
    }

    const verifyToken = async () => {
      try {
        // Attention: L'endpoint est backend/api/auth/verify-email/{token}
        // Il faut adapter l'appel selon votre config API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage(data.message || 'Email vérifié avec succès !')
        } else {
          setStatus('error')
          setMessage(data.detail || 'Échec de la vérification.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('Une erreur est survenue lors de la connexion au serveur.')
      }
    }

    verifyToken()
  }, [token])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Vérification Email</CardTitle>
        <CardDescription>Confirmation de votre inscription</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 py-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-center text-lg font-medium">{message}</p>
            <Button onClick={() => router.push('/login')} className="w-full mt-4">
              Se connecter
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
            </div>
            <p className="text-center text-lg font-medium text-destructive">{message}</p>
            <Button onClick={() => router.push('/login')} variant="outline" className="w-full mt-4">
              Retour à la connexion
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
