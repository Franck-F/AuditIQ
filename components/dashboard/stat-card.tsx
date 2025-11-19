import { type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-500' :
              changeType === 'negative' ? 'text-red-500' :
              'text-muted-foreground'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}
