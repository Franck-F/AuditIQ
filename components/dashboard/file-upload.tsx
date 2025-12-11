'use client'

import { useState, useCallback, DragEvent } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { API_URL } from '@/lib/config/api'

interface FileUploadProps {
  onUpload: (file: File, preview: any) => void
  onError?: (error: string) => void
}

export function FileUpload({ onUpload, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateFile = (file: File): string | null => {
    // F2.1.2: Validation du type MIME
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return 'Type de fichier non autorisé. Formats acceptés: CSV (.csv), Excel (.xls, .xlsx)'
    }
    
    // Limite de taille (50 MB pour l'upload initial)
    const maxSize = 50 * 1024 * 1024 // 50 MB
    if (file.size > maxSize) {
      return `Fichier trop volumineux. Taille maximum: ${maxSize / (1024 * 1024)} MB`
    }
    
    return null
  }

  const handleFile = async (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      if (onError) onError(validationError)
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(false)
    setUploading(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simuler la progression de l'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`${API_URL}/upload/file`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de l\'upload')
      }

      const preview = await response.json()
      setSuccess(true)
      
      // Appeler le callback avec le fichier et la prévisualisation
      setTimeout(() => {
        onUpload(selectedFile, preview)
      }, 500)

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload du fichier')
      if (onError) onError(err.message)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-4">
      {/* F2.1.1: Zone de drop avec drag & drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
          isDragging && "border-primary bg-primary/5",
          !isDragging && !file && "border-border hover:border-primary/50 hover:bg-accent/50",
          file && !uploading && "border-border",
          uploading && "border-primary bg-primary/5"
        )}
      >
        {!file && !uploading && (
          <>
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              {isDragging ? 'Déposez votre fichier ici' : 'Glissez-déposez votre fichier'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              ou cliquez pour sélectionner un fichier
            </p>
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <span>CSV, Excel (.xls, .xlsx) - Max 50 MB</span>
            </div>
          </>
        )}

        {uploading && file && (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-xs">{file.name}</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {uploadProgress < 30 && "Upload en cours..."}
              {uploadProgress >= 30 && uploadProgress < 60 && "Détection de l'encodage..."}
              {uploadProgress >= 60 && uploadProgress < 90 && "Analyse des colonnes..."}
              {uploadProgress >= 90 && "Finalisation..."}
            </p>
          </div>
        )}

        {file && success && !uploading && (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-4">
              <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="hover:bg-red-500/10 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-sm text-green-600 font-medium">
              ✓ Fichier uploadé avec succès
            </p>
          </div>
        )}
      </div>

      {/* F2.1.2: Messages d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informations sur les limites */}
      {!file && !uploading && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="text-sm font-semibold mb-2">Limites par plan</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span><strong>Freemium:</strong> 10,000 lignes maximum</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span><strong>Pro:</strong> 100,000 lignes maximum</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span><strong>Enterprise:</strong> 1,000,000+ lignes</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
