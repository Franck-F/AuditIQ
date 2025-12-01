import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Récupérer le cookie d'authentification
    const cookies = request.headers.get('cookie') || ''
    
    // Faire la requête au backend Python
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Erreur serveur' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API auth/me GET:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Récupérer le cookie d'authentification
    const cookies = request.headers.get('cookie') || ''
    
    // Récupérer le body de la requête
    const body = await request.json()
    
    // Faire la requête au backend Python
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Erreur serveur' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API auth/me PUT:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    )
  }
}
