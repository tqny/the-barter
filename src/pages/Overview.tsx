import { useMemo, useState } from 'react'
import { useVendor } from '@/context/VendorContext'
import { runDiagnostics } from '@/lib/intelligence/diagnostics'
import { generateSummaries } from '@/lib/intelligence/summaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react'
import type { MetricKey, DiagnosticIssue, Severity } from '@/data/types'

// ─── Metric Config ───────────────────────────────────────────

interface MetricConfig {
  key: MetricKey
  label: string
  format: 'currency' | 'number' | 'percent'
  invertDelta?: boolean // true = lower is better (e.g., return rate)
}

const METRICS: MetricConfig[] = [
  { key: 'orderedRevenue', label: 'Ordered Revenue', format: 'currency' },
  { key: 'orderedUnits', label: 'Ordered Units', format: 'number' },
  { key: 'traffic', label: 'Traffic (DPV)', format: 'number' },
  { key: 'conversionRate', label: 'Conversion Rate', format: 'percent' },
  { key: 'inStockRate', label: 'In-Stock Rate', format: 'percent' },
  { key: 'adSpend', label: 'Ad Spend', format: 'currency' },
  { key: 'adAttributedSales', label: 'Ad-Attributed Sales', format: 'currency' },
  { key: 'returnRate', label: 'Return Rate', format: 'percent', invertDelta: true },
]

// ─── Formatting Helpers ──────────────────────────────────────

function formatValue(value: number, format: 'currency' | 'number' | 'percent'): string {
  switch (format) {
    case 'currency':
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
      return `$${value.toFixed(0)}`
    case 'number':
      return value.toLocaleString()
    case 'percent':
      return `${value.toFixed(1)}%`
  }
}

function computeDelta(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// ─── StatusBadge ─────────────────────────────────────────────

function StatusBadge({
  delta,
  invertDelta = false,
}: {
  delta: number
  invertDelta?: boolean
}) {
  const isPositive = invertDelta ? delta < 0 : delta > 0
  const isNeutral = Math.abs(delta) < 0.5
  const displayValue = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3" />
        {displayValue}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive ? 'text-status-good' : 'text-status-bad'
      }`}
    >
      {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {displayValue}
    </span>
  )
}

// ─── TrendSparkline ──────────────────────────────────────────

function TrendSparkline({
  data,
  isPositive,
}: {
  data: { week: string; value: number }[]
  isPositive: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? 'var(--status-good)' : 'var(--status-bad)'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── MetricCard ──────────────────────────────────────────────

function MetricCard({ config, trendData }: {
  config: MetricConfig
  trendData: { week: string; value: number }[]
}) {
  const current = trendData[trendData.length - 1].value
  const previous = trendData[trendData.length - 2].value
  const delta = computeDelta(current, previous)
  const isPositive = config.invertDelta ? delta < 0 : delta > 0

  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <p className="text-xs text-muted-foreground font-medium">{config.label}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xl font-semibold tracking-tight text-foreground">
              {formatValue(current, config.format)}
            </p>
            <StatusBadge delta={delta} invertDelta={config.invertDelta} />
          </div>
          <div className="w-20 shrink-0">
            <TrendSparkline data={trendData} isPositive={isPositive} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── SectionHeader ───────────────────────────────────────────

function SectionHeader({
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

// ─── Severity Badge ──────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    critical: 'bg-status-bad-bg text-status-bad',
    high: 'bg-status-warn-bg text-status-warn',
    moderate: 'bg-status-info-bg text-status-info',
    low: 'bg-surface-raised text-muted-foreground',
  }

  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${styles[severity]}`}>
      {severity}
    </span>
  )
}

// ─── Issue Card (for risks/opportunities) ────────────────────

function IssueCard({ issue }: { issue: DiagnosticIssue }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div className="mt-0.5">
        <SeverityBadge severity={issue.severity} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{issue.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {issue.evidence[0]}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{issue.ownerTeam}</span>
          <span>·</span>
          <span>{issue.confidence} confidence</span>
          <span>·</span>
          <span>{issue.affectedAsins.length} {issue.affectedAsins.length === 1 ? 'ASIN' : 'ASINs'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── GenerationExplainer ─────────────────────────────────────

function GenerationExplainer({ explanation }: { explanation: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info className="size-3 shrink-0" />
        <span>How this was generated</span>
        {open ? <ChevronUp className="ml-auto size-3" /> : <ChevronDown className="ml-auto size-3" />}
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed font-sans">
            {explanation}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Overview Page ───────────────────────────────────────────

export function Overview() {
  const { selectedVendor, vendorProducts, vendorTrends } = useVendor()

  const diagnostics = useMemo(() => {
    if (!vendorTrends) return null
    return runDiagnostics(selectedVendor.id, vendorProducts, vendorTrends)
  }, [selectedVendor.id, vendorProducts, vendorTrends])

  const summaries = useMemo(() => {
    if (!vendorTrends || !diagnostics) return null
    return generateSummaries(selectedVendor, vendorProducts, vendorTrends, diagnostics.result)
  }, [selectedVendor, vendorProducts, vendorTrends, diagnostics])

  if (!vendorTrends) return null

  const issues = diagnostics?.result ?? []
  const risks = issues.filter((i) => i.severity === 'critical' || i.severity === 'high')
  const opportunities = issues.filter((i) => i.severity === 'moderate' || i.severity === 'low')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Executive Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Portfolio performance for{' '}
          <span className="font-medium text-foreground">{selectedVendor.name}</span>
        </p>
      </div>

      {/* Scorecard band */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCard
            key={metric.key}
            config={metric}
            trendData={vendorTrends.metrics[metric.key]}
          />
        ))}
      </div>

      {/* AI Summary */}
      {summaries && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-sm">AI Performance Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {summaries.result.executiveSummary}
            </p>

            {summaries.result.keyFindings.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Key Findings
                </p>
                <ul className="space-y-1.5">
                  {summaries.result.keyFindings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <GenerationExplainer explanation={summaries.explanation} />
          </CardContent>
        </Card>
      )}

      {/* Risks & Opportunities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Risks */}
        <div>
          <SectionHeader icon={AlertTriangle} title="Top Risks" className="mb-3" />
          {risks.length > 0 ? (
            <div className="space-y-2">
              {risks.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <Card size="sm">
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No critical or high-priority risks detected.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Opportunities */}
        <div>
          <SectionHeader icon={Lightbulb} title="Opportunities" className="mb-3" />
          {opportunities.length > 0 ? (
            <div className="space-y-2">
              {opportunities.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <Card size="sm">
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No improvement opportunities flagged — account is performing well.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diagnostics explainer */}
      {diagnostics && (
        <GenerationExplainer explanation={diagnostics.explanation} />
      )}
    </div>
  )
}
