export function SectionHeader({
  icon: Icon,
  title,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="size-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  )
}
