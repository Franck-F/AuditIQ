interface TechBadgeProps {
  name: string
  icon: string
  url?: string
}

export function TechBadge({ name, icon, url }: TechBadgeProps) {
  const badge = (
    <div className="flex-shrink-0 snap-center rounded-lg border border-border bg-white p-4 transition-all hover:border-primary/50 hover:shadow-md w-32 flex items-center justify-center cursor-pointer">
      <img src={icon || "/placeholder.svg"} alt={name} className="h-12 w-auto max-w-full object-contain" />
    </div>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {badge}
      </a>
    )
  }

  return badge
}
