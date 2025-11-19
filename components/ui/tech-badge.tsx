interface TechBadgeProps {
  name: string
  icon: string
}

export function TechBadge({ name, icon }: TechBadgeProps) {
  return (
    <div className="flex-shrink-0 snap-center rounded-lg border border-border bg-white p-4 transition-all hover:border-primary/50 hover:shadow-md">
      <img src={icon || "/placeholder.svg"} alt={name} className="h-12 w-auto" />
    </div>
  )
}
