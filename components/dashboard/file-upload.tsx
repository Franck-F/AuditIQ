'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({ onUpload, accept = ".csv,.xlsx", maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Le fichier est trop volumineux. Taille maximale : ${maxSize / 1024 / 1024}MB`
    }
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!accept.includes(extension)) {
      return `Format non supporté. Formats acceptés : ${accept}`
    }
    return null
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validationError = validateFile(droppedFile)
      
      if (validationError) {
        setError(validationError)
        return
      }

      setFile(droppedFile)
      onUpload(droppedFile)
    }
  }, [accept, maxSize, onUpload])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validationError = validateFile(selectedFile)
      
      if (validationError) {
        setError(validationError)
        return
      }

      setFile(selectedFile)
      onUpload(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all",
          dragActive ? "border-primary bg-primary/5" : "border-border bg-card",
          error && "border-destructive"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept={accept}
        />
        
        {!file ? (
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center p-12 text-center"
          >
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold mb-2">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              ou cliquez pour sélectionner un fichier
            </p>
            <p className="text-xs text-muted-foreground">
              Formats supportés : CSV, Excel - Maximum {maxSize / 1024 / 1024}MB
            </p>
          </label>
        ) : (
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
