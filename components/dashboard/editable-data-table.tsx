'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableTableProps {
  columns: Array<{ name: string; type: string }>
  data: Array<Record<string, any>>
  onDataChange?: (newData: Array<Record<string, any>>) => void
  onRefresh?: () => Promise<void>
  maxRows?: number
}

export function EditableDataTable({ 
  columns, 
  data, 
  onDataChange,
  onRefresh,
  maxRows = 10 
}: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [tableData, setTableData] = useState(data)
  const [refreshing, setRefreshing] = useState(false)

  // Synchroniser tableData avec les changements de la prop data (pour l'actualisation automatique après traitement des valeurs manquantes)
  useEffect(() => {
    setTableData(data)
  }, [data])

  const handleCellClick = (rowIndex: number, colName: string) => {
    setEditingCell({ row: rowIndex, col: colName })
  }

  const handleCellChange = (rowIndex: number, colName: string, value: string) => {
    const newData = [...tableData]
    newData[rowIndex] = { ...newData[rowIndex], [colName]: value }
    setTableData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
      }
    }
  }

  const displayData = tableData.slice(0, maxRows)

  return (
    <div className="space-y-2">
      {/* En-tête avec bouton d'actualisation */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          💡 Cliquez sur une cellule pour modifier sa valeur • Appuyez sur Entrée pour valider
        </p>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        )}
      </div>
      
      {/* Conteneur de tableau avec largeur fixe pour empêcher le défilement de la page */}
      <div className="w-full">
        <div 
          className="overflow-auto rounded-lg border border-border bg-background"
          style={{ maxHeight: '500px', maxWidth: '100%' }}
        >
          <table className="border-collapse" style={{ minWidth: '100%' }}>
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col.name} 
                    className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap border-b border-border bg-muted"
                  >
                    <div className="flex flex-col">
                      <span>{col.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        ({col.type})
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-accent/50">
                  {columns.map((col) => {
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === col.name
                    const cellValue = row[col.name]?.toString() || ''

                    return (
                      <td 
                        key={col.name} 
                        className={cn(
                          "px-4 py-2 text-sm whitespace-nowrap cursor-pointer transition-colors",
                          isEditing && "p-0"
                        )}
                        onClick={() => !isEditing && handleCellClick(rowIndex, col.name)}
                      >
                        {isEditing ? (
                          <Input
                            autoFocus
                            value={cellValue}
                            onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellBlur()
                              } else if (e.key === 'Escape') {
                                setEditingCell(null)
                              }
                            }}
                            className="h-8 w-full border-0 focus-visible:ring-1"
                          />
                        ) : (
                          <span className="block hover:bg-accent/30 px-2 py-1 rounded">
                            {cellValue || '-'}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground text-right">
        <p>
          {columns.length} colonnes × {displayData.length} lignes affichées
        </p>
      </div>
    </div>
  )
}
