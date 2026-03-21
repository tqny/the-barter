import type { Severity } from '@/data/types'

const styles: Record<Severity, string> = {
  critical: 'bg-status-bad/20 text-status-bad ring-1 ring-status-bad/30',
  high: 'bg-status-warn/20 text-status-warn ring-1 ring-status-warn/30',
  moderate: 'bg-status-info/20 text-status-info ring-1 ring-status-info/30',
  low: 'bg-surface-raised text-muted-foreground ring-1 ring-border',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${styles[severity]}`}>
      {severity}
    </span>
  )
}
