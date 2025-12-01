import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Récupérer le cookie d'authentification
    const cookies = request.headers.get('cookie') || ''
    
    // Faire la requête au backend Python
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: data.detail || 'Erreur serveur' },
        { status: response.status }
      )
    }

    // Créer la réponse et supprimer le cookie
    const nextResponse = NextResponse.json({ message: 'Déconnexion réussie' })
    
    // Supprimer le cookie access_token
    nextResponse.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immédiatement
      path: '/',
    })

    return nextResponse
  } catch (error) {
    console.error('Erreur API logout:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
