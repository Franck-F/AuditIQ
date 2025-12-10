'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { edaService } from '@/services/edaService'

export default function NewDataSourcePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source_type: 'csv' as 'csv' | 'warehouse' | 'api' | 'google_sheets',
    ingestion_schedule: 'daily' as 'daily' | 'hourly' | 'weekly' | 'manual',
    file_path: '',
    api_url: '',
    api_key: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const connection_config: any = {}
      
      if (formData.source_type === 'csv') {
        connection_config.file_path = formData.file_path
      } else if (formData.source_type === 'api') {
        connection_config.api_url = formData.api_url
        connection_config.api_key = formData.api_key
      }

      await edaService.createDataSource({
        name: formData.name,
        description: formData.description,
        source_type: formData.source_type,
        ingestion_schedule: formData.ingestion_schedule,
        connection_config
      })

      router.push('/dashboard/eda/sources')
    } catch (error) {
      console.error('Error creating source:', error)
      alert('Erreur lors de la création de la source')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/eda/sources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle Source de Données</h1>
        <p className="text-muted-foreground">
          Configurez une nouvelle source pour l'analyse EDA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Renseignez les informations de votre source de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                placeholder="Ex: Données de ventes 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la source..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source_type">Type de Source *</Label>
                <Select
                  value={formData.source_type}
                  onValueChange={(value: any) => setFormData({ ...formData, source_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">Fichier CSV</SelectItem>
                    <SelectItem value="api">API REST</SelectItem>
                    <SelectItem value="warehouse">Data Warehouse</SelectItem>
                    <SelectItem value="google_sheets">Google Sheets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Fréquence d'Ingestion *</Label>
                <Select
                  value={formData.ingestion_schedule}
                  onValueChange={(value: any) => setFormData({ ...formData, ingestion_schedule: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manuelle</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="hourly">Horaire</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configuration spécifique au type */}
            {formData.source_type === 'csv' && (
              <div className="space-y-2">
                <Label htmlFor="file_path">Chemin du Fichier *</Label>
                <Input
                  id="file_path"
                  placeholder="/path/to/data.csv"
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  required
                />
              </div>
            )}

            {formData.source_type === 'api' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="api_url">URL de l'API *</Label>
                  <Input
                    id="api_url"
                    placeholder="https://api.example.com/data"
                    value={formData.api_url}
                    onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">Clé API</Label>
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="Votre clé API..."
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Création...' : 'Créer la Source'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/eda/sources">Annuler</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
