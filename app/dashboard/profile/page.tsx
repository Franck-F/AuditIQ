'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Rediriger vers settings en attendant que la page soit corrigée
    router.push('/dashboard/settings')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
