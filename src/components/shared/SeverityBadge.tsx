import type { Severity } from '@/data/types'

const styles: Record<Severity, string> = {
  critical: 'bg-status-bad-bg text-status-bad',
  high: 'bg-status-warn-bg text-status-warn',
  moderate: 'bg-status-info-bg text-status-info',
  low: 'bg-surface-raised text-muted-foreground',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${styles[severity]}`}>
      {severity}
    </span>
  )
}
