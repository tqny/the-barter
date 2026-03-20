import { useMemo } from 'react'
import { useVendor } from '@/context/VendorContext'
import { runDiagnostics } from '@/lib/intelligence/diagnostics'
import { generateSummaries } from '@/lib/intelligence/summaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  AlertTriangle,
  Lightbulb,
  Sparkles,
  DollarSign,
  ShoppingCart,
  Eye,
  Target,
  Package,
  Megaphone,
  BarChart3,
  RotateCcw,
  ShieldAlert,
  PieChartIcon,
} from 'lucide-react'
import { GenerationExplainer } from '@/components/shared/GenerationExplainer'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import type { MetricKey, DiagnosticIssue, Severity } from '@/data/types'

// ─── Metric Config ───────────────────────────────────────────

interface MetricConfig {
  key: MetricKey
  label: string
  format: 'currency' | 'number' | 'percent'
  invertDelta?: boolean
  icon: React.ComponentType<{ className?: string }>
}

const METRICS: MetricConfig[] = [
  { key: 'orderedRevenue', label: 'Ordered Revenue', format: 'currency', icon: DollarSign },
  { key: 'orderedUnits', label: 'Ordered Units', format: 'number', icon: ShoppingCart },
  { key: 'traffic', label: 'Traffic (DPV)', format: 'number', icon: Eye },
  { key: 'conversionRate', label: 'Conversion Rate', format: 'percent', icon: Target },
  { key: 'inStockRate', label: 'In-Stock Rate', format: 'percent', icon: Package },
  { key: 'adSpend', label: 'Ad Spend', format: 'currency', icon: Megaphone },
  { key: 'adAttributedSales', label: 'Ad-Attributed Sales', format: 'currency', icon: BarChart3 },
  { key: 'returnRate', label: 'Return Rate', format: 'percent', invertDelta: true, icon: RotateCcw },
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

function formatAbsoluteChange(value: number, format: 'currency' | 'number' | 'percent'): string {
  switch (format) {
    case 'currency':
      if (Math.abs(value) >= 1_000_000) return `$${(Math.abs(value) / 1_000_000).toFixed(1)}M`
      if (Math.abs(value) >= 1_000) return `$${(Math.abs(value) / 1_000).toFixed(1)}K`
      return `$${Math.abs(value).toFixed(0)}`
    case 'number':
      return Math.abs(value).toLocaleString()
    case 'percent':
      return `${Math.abs(value).toFixed(1)}pp`
  }
}

function computeDelta(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// ─── Unified Stats Band ─────────────────────────────────────

function StatsBand({ metrics, trendData }: {
  metrics: MetricConfig[]
  trendData: Record<MetricKey, { week: string; value: number }[]>
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="grid grid-cols-2 divide-x-0 divide-y divide-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {metrics.slice(0, 4).map((config) => {
          const data = trendData[config.key]
          const current = data[data.length - 1].value
          const previous = data[data.length - 2].value
          const delta = computeDelta(current, previous)
          const absoluteChange = current - previous
          const isPositive = config.invertDelta ? delta < 0 : delta > 0
          const isNeutral = Math.abs(delta) < 0.5
          const Icon = config.icon

          return (
            <div key={config.key} className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="size-4" />
                <span className="text-xs font-medium sm:text-sm">{config.label}</span>
              </div>
              <p className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                {formatValue(current, config.format)}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs xl:flex-nowrap">
                <span className={`font-medium ${isNeutral ? 'text-muted-foreground' : isPositive ? 'text-status-good' : 'text-status-bad'}`}>
                  {isNeutral ? (
                    <>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</>
                  ) : (
                    <>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                      <span className="hidden sm:inline"> ({formatAbsoluteChange(absoluteChange, config.format)})</span>
                    </>
                  )}
                </span>
                <span className="hidden items-center gap-2 text-muted-foreground sm:inline-flex">
                  <span className="size-1 rounded-full bg-muted-foreground" />
                  <span className="whitespace-nowrap">vs Last Week</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="border-t border-border grid grid-cols-2 divide-x-0 divide-y divide-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {metrics.slice(4, 8).map((config) => {
          const data = trendData[config.key]
          const current = data[data.length - 1].value
          const previous = data[data.length - 2].value
          const delta = computeDelta(current, previous)
          const absoluteChange = current - previous
          const isPositive = config.invertDelta ? delta < 0 : delta > 0
          const isNeutral = Math.abs(delta) < 0.5
          const Icon = config.icon

          return (
            <div key={config.key} className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="size-4" />
                <span className="text-xs font-medium sm:text-sm">{config.label}</span>
              </div>
              <p className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                {formatValue(current, config.format)}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs xl:flex-nowrap">
                <span className={`font-medium ${isNeutral ? 'text-muted-foreground' : isPositive ? 'text-status-good' : 'text-status-bad'}`}>
                  {isNeutral ? (
                    <>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</>
                  ) : (
                    <>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                      <span className="hidden sm:inline"> ({formatAbsoluteChange(absoluteChange, config.format)})</span>
                    </>
                  )}
                </span>
                <span className="hidden items-center gap-2 text-muted-foreground sm:inline-flex">
                  <span className="size-1 rounded-full bg-muted-foreground" />
                  <span className="whitespace-nowrap">vs Last Week</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Revenue Trend Chart ─────────────────────────────────────

const revenueTrendConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

function RevenueTrendChart({ data }: { data: { week: string; value: number }[] }) {
  const chartData = data.map((d) => ({
    week: d.week,
    revenue: d.value,
  }))
  const totalRevenue = chartData.reduce((acc, d) => acc + d.revenue, 0)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xl font-semibold tracking-tight sm:text-2xl">
            {formatValue(totalRevenue, 'currency')}
          </p>
          <p className="text-xs text-muted-foreground">
            Total Revenue (8-Week)
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Revenue</span>
        </div>
      </div>

      <div className="h-[200px] w-full min-w-0 sm:h-[240px]">
        <ChartContainer config={revenueTrendConfig} className="h-full w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatValue(v, 'currency')}
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatValue(value as number, 'currency')}
                  hideIndicator
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#fillRevenue)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}

// ─── Issue Distribution Widget ──────────────────────────────

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'var(--status-bad)',
  high: 'var(--status-warn)',
  moderate: 'var(--primary)',
  low: 'var(--color-muted-foreground)',
}

function IssueDistributionWidget({ issues }: { issues: DiagnosticIssue[] }) {
  const counts: Record<Severity, number> = { critical: 0, high: 0, moderate: 0, low: 0 }
  for (const issue of issues) {
    counts[issue.severity]++
  }
  const total = issues.length
  const segments = (['critical', 'high', 'moderate', 'low'] as Severity[]).filter(s => counts[s] > 0)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md border border-border sm:size-8">
          <ShieldAlert className="size-4 text-muted-foreground" />
        </div>
        <div>
          <span className="text-sm font-medium">Issue Distribution</span>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            {total} {total === 1 ? 'issue' : 'issues'} detected
          </p>
        </div>
      </div>

      {total > 0 ? (
        <>
          <div className="flex h-3 w-full overflow-hidden rounded-full sm:h-4">
            {segments.map((severity) => (
              <div
                key={severity}
                className="transition-all"
                style={{
                  width: `${(counts[severity] / total) * 100}%`,
                  backgroundColor: SEVERITY_COLORS[severity],
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            {segments.map((severity) => (
              <div key={severity} className="flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[severity] }}
                />
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  {counts[severity]} {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground py-2">All KPIs within thresholds.</p>
      )}
    </div>
  )
}

// ─── Revenue by Category Donut ──────────────────────────────

const CATEGORY_COLORS = [
  'var(--primary)',
  'color-mix(in oklch, var(--primary) 75%, var(--background))',
  'color-mix(in oklch, var(--primary) 55%, var(--background))',
  'color-mix(in oklch, var(--primary) 40%, var(--background))',
  'color-mix(in oklch, var(--primary) 25%, var(--background))',
]

function RevenueByCategoryWidget({ products }: { products: { category: string; orderedRevenue: number }[] }) {
  const categoryMap = new Map<string, number>()
  for (const p of products) {
    categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + p.orderedRevenue)
  }
  const categories = [...categoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  const totalRevenue = categories.reduce((acc, c) => acc + c.value, 0)

  const chartConfig: ChartConfig = {}
  categories.forEach((c) => {
    chartConfig[c.name] = { label: c.name, color: c.color }
  })

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md border border-border sm:size-8">
          <PieChartIcon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <span className="text-sm font-medium">Revenue by Category</span>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            Product mix breakdown
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4 sm:gap-6">
        <div className="relative size-[100px] shrink-0 sm:size-[120px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {categories.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-semibold">{formatValue(totalRevenue, 'currency')}</span>
            <span className="text-[8px] text-muted-foreground sm:text-[10px]">Total</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:gap-3">
          {categories.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full sm:size-2.5"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-muted-foreground sm:text-xs">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <span className="font-medium tabular-nums">{formatValue(item.value, 'currency')}</span>
                <span className="text-muted-foreground tabular-nums">
                  {totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Issue Row (compact) ─────────────────────────────────────

function IssueRow({ issue }: { issue: DiagnosticIssue }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-surface-raised/50 transition-colors">
      <SeverityBadge severity={issue.severity} />
      <span className="text-sm font-medium text-foreground flex-1 truncate">{issue.title}</span>
      <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{issue.ownerTeam}</span>
      <span className="text-xs text-muted-foreground shrink-0">
        {issue.affectedAsins.length} {issue.affectedAsins.length === 1 ? 'ASIN' : 'ASINs'}
      </span>
    </div>
  )
}

// ─── Key Findings Grid ───────────────────────────────────────

function KeyFindingsGrid({ findings }: { findings: string[] }) {
  if (findings.length === 0) return null

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {findings.map((finding, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/50 px-3 py-2.5"
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            {i + 1}
          </span>
          <p className="text-sm text-foreground leading-snug">{finding}</p>
        </div>
      ))}
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

      {/* Stats Band — unified container with dividers */}
      <StatsBand metrics={METRICS} trendData={vendorTrends.metrics} />

      {/* Chart + Side Widgets */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row">
        <RevenueTrendChart data={vendorTrends.metrics.orderedRevenue} />
        <div className="flex w-full flex-col gap-4 xl:w-[380px]">
          <IssueDistributionWidget issues={issues} />
          <RevenueByCategoryWidget products={vendorProducts} />
        </div>
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
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              {summaries.result.executiveSummary}
            </p>

            <KeyFindingsGrid findings={summaries.result.keyFindings} />

            <GenerationExplainer explanation={summaries.explanation} />
          </CardContent>
        </Card>
      )}

      {/* Risks & Opportunities */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-status-warn" />
                <CardTitle className="text-sm">Top Risks</CardTitle>
              </div>
              {risks.length > 0 && (
                <span className="text-xs text-muted-foreground">{risks.length} issues</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {risks.length > 0 ? (
              <div className="divide-y divide-border -mx-3">
                {risks.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No critical or high-priority risks detected.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4 text-primary" />
                <CardTitle className="text-sm">Opportunities</CardTitle>
              </div>
              {opportunities.length > 0 && (
                <span className="text-xs text-muted-foreground">{opportunities.length} items</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {opportunities.length > 0 ? (
              <div className="divide-y divide-border -mx-3">
                {opportunities.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No improvement opportunities flagged — account is performing well.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diagnostics explainer */}
      {diagnostics && (
        <GenerationExplainer explanation={diagnostics.explanation} />
      )}
    </div>
  )
}
