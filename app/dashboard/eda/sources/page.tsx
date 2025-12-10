'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Database, Trash2, Play, Calendar } from 'lucide-react'
import Link from 'next/link'
import { edaService, type EDADataSource } from '@/services/edaService'
import { useRouter } from 'next/navigation'

export default function DataSourcesPage() {
  const [sources, setSources] = useState<EDADataSource[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      const data = await edaService.getDataSources()
      setSources(data)
    } catch (error) {
      console.error('Error loading sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) return
    
    try {
      await edaService.deleteDataSource(id)
      setSources(sources.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting source:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleRunAnalysis = async (sourceId: number) => {
    try {
      await edaService.runAnalysis({
        data_source_id: sourceId,
        metrics: { revenue: { type: 'sum' } },
        dimensions: ['region'],
        confidence_level: 0.95
      })
      alert('Analyse lancée avec succès!')
      router.push('/dashboard/eda/analyses')
    } catch (error) {
      console.error('Error running analysis:', error)
      alert('Erreur lors du lancement de l\'analyse')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sources de Données</h1>
          <p className="text-muted-foreground">
            Gérez vos sources d'ingestion pour l'analyse EDA
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/eda/sources/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Source
          </Link>
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune source configurée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre première source de données
            </p>
            <Button asChild>
              <Link href="/dashboard/eda/sources/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer une source
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {source.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                  <Badge variant={source.is_active ? 'default' : 'secondary'}>
                    {source.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{source.source_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fréquence</p>
                    <p className="font-medium capitalize">{source.ingestion_schedule}</p>
                  </div>
                </div>

                {source.last_ingestion && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Dernière ingestion: {new Date(source.last_ingestion).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRunAnalysis(source.id)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Analyser
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
