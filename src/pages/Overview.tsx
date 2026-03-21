import React, { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVendor } from '@/context/VendorContext'
import { runDiagnostics } from '@/lib/intelligence/diagnostics'
import { generateSummaries } from '@/lib/intelligence/summaries'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Sector,
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
  ArrowRight,
  TrendingDown,
  PackageX,
  FileWarning,
  FlaskConical,
  X,
  Loader2,
} from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { GenerationExplainer } from '@/components/shared/GenerationExplainer'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import type { MetricKey, DiagnosticIssue, Severity, VendorTrends, Product } from '@/data/types'

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

// ─── Unified Stats Band (with hover effect) ─────────────────

function StatsBand({ metrics, trendData, onMetricClick }: {
  metrics: MetricConfig[]
  trendData: Record<MetricKey, { week: string; value: number }[]>
  onMetricClick: (key: MetricKey) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {metrics.map((config) => {
        const data = trendData[config.key]
        const current = data[data.length - 1].value
        const previous = data[data.length - 2].value
        const delta = computeDelta(current, previous)
        const absoluteChange = current - previous
        const isPositive = config.invertDelta ? delta < 0 : delta > 0
        const isNeutral = Math.abs(delta) < 0.5
        const Icon = config.icon

        return (
          <motion.button
            key={config.key}
            type="button"
            onClick={() => onMetricClick(config.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="space-y-3 rounded-xl border bg-card p-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-surface-raised/40 transition-colors sm:p-5"
            style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 35%, transparent)' }}
          >
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
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Metric Detail Dialog ───────────────────────────────────

const metricDialogConfig = {
  metric: { label: 'Value', color: 'var(--primary)' },
} satisfies ChartConfig

function MetricDetailDialog({
  metricKey,
  metrics,
  trendData,
  onClose,
}: {
  metricKey: MetricKey | null
  metrics: MetricConfig[]
  trendData: Record<MetricKey, { week: string; value: number }[]>
  onClose: () => void
}) {
  if (!metricKey) return null

  const config = metrics.find((m) => m.key === metricKey)!
  const fullData = trendData[metricKey]
  const data = fullData.slice(-4).map((d) => ({ week: d.week, metric: d.value }))
  const Icon = config.icon

  const current = data[data.length - 1].metric
  const first = data[0].metric
  const delta = first > 0 ? ((current - first) / first) * 100 : 0
  const trending = config.invertDelta ? delta < 0 : delta > 0

  // Compute Y domain with padding so small-range metrics (rates/%) aren't flat
  const values = data.map((d) => d.metric)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || max * 0.1
  const padding = range * 0.3
  const yMin = config.format === 'percent' ? Math.max(0, Math.floor(min - padding)) : Math.max(0, min - padding)
  const yMax = config.format === 'percent' ? Math.min(100, Math.ceil(max + padding)) : max + padding

  return (
    <Dialog open={!!metricKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" />
            {config.label}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Last 4 weeks</p>
        </DialogHeader>
        <div className="h-[200px] w-full">
          <ChartContainer config={metricDialogConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
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
                tickFormatter={(v) => formatValue(v, config.format)}
                width={55}
                domain={[yMin, yMax]}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatValue(value as number, config.format)}
                    hideLabel
                  />
                }
              />
              <Line
                dataKey="metric"
                type="natural"
                stroke="var(--color-metric)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-metric)' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div className={`flex items-center gap-2 font-medium leading-none ${trending ? 'text-status-good' : 'text-status-bad'}`}>
            {trending ? 'Trending up' : 'Trending down'} by {Math.abs(delta).toFixed(1)}% over 4 weeks
          </div>
          <div className="text-xs leading-none text-muted-foreground">
            {formatValue(data[0].metric, config.format)} → {formatValue(current, config.format)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Revenue Trend Chart ─────────────────────────────────────

const revenueTrendConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--primary)',
  },
  roas: {
    label: 'ROAS',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

function RevenueTrendChart({ revenueData, adSpendData }: {
  revenueData: { week: string; value: number }[]
  adSpendData: { week: string; value: number }[]
}) {
  const chartData = revenueData.map((d, i) => ({
    week: d.week,
    revenue: d.value,
    roas: adSpendData[i].value > 0 ? d.value / adSpendData[i].value : 0,
  }))
  const totalRevenue = chartData.reduce((acc, d) => acc + d.revenue, 0)

  const revValues = chartData.map((d) => d.revenue)
  const revMin = Math.min(...revValues)
  const revMax = Math.max(...revValues)
  const revRange = revMax - revMin || revMax * 0.1
  const revPadding = revRange * 0.3

  const roasValues = chartData.map((d) => d.roas)
  const roasMin = Math.min(...roasValues)
  const roasMax = Math.max(...roasValues)
  const roasRange = roasMax - roasMin || roasMax * 0.1
  const roasPadding = roasRange * 0.3

  const latestRoas = chartData[chartData.length - 1].roas

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border-2 bg-card p-4 sm:gap-5 sm:p-5 transition-colors hover:bg-surface-raised/30"
      style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xl font-semibold tracking-tight sm:text-2xl">
            {formatValue(totalRevenue, 'currency')}
          </p>
          <p className="text-xs text-muted-foreground">
            Total Revenue (8-Week)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded-full border-t-2 border-dashed" style={{ borderColor: 'var(--chart-2)' }} />
            <span className="text-xs text-muted-foreground">ROAS {latestRoas.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full min-w-0 sm:h-[240px]">
        <ChartContainer config={revenueTrendConfig} className="h-full w-full">
          <AreaChart data={chartData} accessibilityLayer>
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
              yAxisId="revenue"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatValue(v, 'currency')}
              width={50}
              domain={[Math.max(0, revMin - revPadding), revMax + revPadding]}
            />
            <YAxis
              yAxisId="roas"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `${Number(v).toFixed(1)}x`}
              width={40}
              domain={[Math.max(0, roasMin - roasPadding), roasMax + roasPadding]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    name === 'roas'
                      ? `${(value as number).toFixed(2)}x`
                      : formatValue(value as number, 'currency')
                  }
                />
              }
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#fillRevenue)"
              dot={{ fill: 'var(--color-revenue)', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'var(--color-revenue)', stroke: 'var(--background)', strokeWidth: 2 }}
            />
            <Line
              yAxisId="roas"
              type="monotone"
              dataKey="roas"
              stroke="var(--color-roas)"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ fill: 'var(--color-roas)', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'var(--color-roas)', stroke: 'var(--background)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </motion.div>
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
  const [hoveredSeverity, setHoveredSeverity] = useState<Severity | null>(null)
  const counts: Record<Severity, number> = { critical: 0, high: 0, moderate: 0, low: 0 }
  for (const issue of issues) {
    counts[issue.severity]++
  }
  const total = issues.length
  const segments = (['critical', 'high', 'moderate', 'low'] as Severity[]).filter(s => counts[s] > 0)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex flex-col gap-4 rounded-xl border-2 bg-card p-4 sm:p-5 transition-colors hover:bg-surface-raised/30"
      style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}>
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
                className="transition-all duration-200 cursor-pointer"
                style={{
                  width: `${(counts[severity] / total) * 100}%`,
                  backgroundColor: SEVERITY_COLORS[severity],
                  opacity: hoveredSeverity && hoveredSeverity !== severity ? 0.3 : 1,
                  transform: hoveredSeverity === severity ? 'scaleY(1.25)' : 'scaleY(1)',
                }}
                onMouseEnter={() => setHoveredSeverity(severity)}
                onMouseLeave={() => setHoveredSeverity(null)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            {segments.map((severity) => (
              <div
                key={severity}
                className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200"
                style={{ opacity: hoveredSeverity && hoveredSeverity !== severity ? 0.3 : 1 }}
                onMouseEnter={() => setHoveredSeverity(severity)}
                onMouseLeave={() => setHoveredSeverity(null)}
              >
                <div
                  className="size-2 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: SEVERITY_COLORS[severity],
                    transform: hoveredSeverity === severity ? 'scale(1.5)' : 'scale(1)',
                  }}
                />
                <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${hoveredSeverity === severity ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {counts[severity]} {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground py-2">All KPIs within thresholds.</p>
      )}
    </motion.div>
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex flex-1 flex-col gap-4 rounded-xl border-2 bg-card p-4 sm:p-5 transition-colors hover:bg-surface-raised/30"
      style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}>
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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
                {...{
                  activeIndex: activeIndex ?? undefined,
                  activeShape: (props: unknown) => {
                    const p = props as Record<string, unknown>
                    const { outerRadius = 0, ...rest } = p
                    return <g><Sector {...rest} outerRadius={(outerRadius as number) + 6} /></g>
                  },
                } as Record<string, unknown>}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {categories.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={activeIndex !== null && activeIndex !== i ? 0.3 : 1}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {activeIndex !== null ? (
              <>
                <span className="text-sm font-semibold">{formatValue(categories[activeIndex].value, 'currency')}</span>
                <span className="text-[8px] text-muted-foreground sm:text-[10px]">{categories[activeIndex].name}</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold">{formatValue(totalRevenue, 'currency')}</span>
                <span className="text-[8px] text-muted-foreground sm:text-[10px]">Total</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:gap-3">
          {categories.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 cursor-pointer transition-opacity duration-200 rounded-md px-1 -mx-1 hover:bg-surface-raised/50"
              style={{ opacity: activeIndex !== null && activeIndex !== i ? 0.3 : 1 }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full sm:size-2.5 transition-transform duration-200"
                  style={{
                    backgroundColor: item.color,
                    transform: activeIndex === i ? 'scale(1.5)' : 'scale(1)',
                  }}
                />
                <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${activeIndex === i ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{item.name}</span>
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
    </motion.div>
  )
}

// ─── Issue Category Icons ────────────────────────────────────

const ISSUE_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Revenue: BarChart3,
  Conversion: TrendingDown,
  'Supply Chain': PackageX,
  Returns: AlertTriangle,
  Content: FileWarning,
  Advertising: Megaphone,
  Traffic: TrendingDown,
}

// ─── Severity Icon Backgrounds ──────────────────────────────

const SEVERITY_ICON_BG: Record<Severity, string> = {
  critical: 'bg-status-bad/25 ring-1 ring-status-bad/30',
  high: 'bg-status-warn/25 ring-1 ring-status-warn/30',
  moderate: 'bg-status-info/25 ring-1 ring-status-info/30',
  low: 'bg-surface-raised ring-1 ring-border',
}

// ─── Issue Row (List2-style with popover) ────────────────────

function IssueRow({ issue }: { issue: DiagnosticIssue }) {
  const Icon = ISSUE_CATEGORY_ICONS[issue.category] ?? ShieldAlert

  return (
    <Popover>
      <PopoverTrigger
        className="grid w-full items-center gap-3 px-2 py-4 text-left transition-all duration-200 cursor-pointer hover:bg-surface-raised/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[1fr_auto_auto] sm:gap-4"
      >
          <div className="flex items-center gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${SEVERITY_ICON_BG[issue.severity]}`}>
              <Icon className="size-4 text-muted-foreground" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-foreground tracking-tight">{issue.title}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{issue.ownerTeam}</span>
            </div>
          </div>
          <SeverityBadge severity={issue.severity} />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span className="tabular-nums">{issue.affectedAsins.length} ASINs</span>
            <ArrowRight className="size-3.5" />
          </div>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] !rounded-xl p-0 border-0 shadow-2xl shadow-black/40 ring-0" side="top" align="start" sideOffset={8}>
        <div className="rounded-xl p-5 space-y-4 max-h-64 overflow-y-auto" style={{ backgroundColor: 'color-mix(in srgb, var(--background) 85%, black)', border: '1px solid color-mix(in srgb, var(--chart-2) 35%, transparent)' }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[14px] font-semibold text-white tracking-tight">{issue.title}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <span className="uppercase tracking-widest font-semibold">{issue.ownerTeam}</span>
              <span className="text-white/20">|</span>
              <span>{issue.category}</span>
              <span className="text-white/20">|</span>
              <span className="capitalize">{issue.confidence} confidence</span>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">Evidence</span>
            {issue.evidence.map((e, i) => (
              <div key={i} className="rounded-lg bg-white/[0.04] px-3 py-2 hover:bg-white/[0.07] transition-colors" style={{ border: '1px solid color-mix(in srgb, var(--chart-2) 25%, transparent)' }}>
                <span className="text-[12.5px] text-white/80 leading-snug">{e}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 text-center pt-1">
            {issue.affectedAsins.length} {issue.affectedAsins.length === 1 ? 'ASIN' : 'ASINs'} affected
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Simulate Week Dialog ────────────────────────────────────

type SimulatedValues = Record<MetricKey, number>

function sliderRange(value: number, format: 'currency' | 'number' | 'percent'): { min: number; max: number; step: number } {
  if (format === 'percent') return { min: Math.max(0, value * 0.8), max: Math.min(100, value * 1.2), step: 0.1 }
  if (value > 10000) return { min: Math.round(value * 0.8), max: Math.round(value * 1.2), step: Math.round(value * 0.005) }
  return { min: Math.round(value * 0.8), max: Math.round(value * 1.2), step: 1 }
}

function SimulateWeekDialog({
  open,
  onClose,
  onSimulate,
  currentValues,
}: {
  open: boolean
  onClose: () => void
  onSimulate: (values: SimulatedValues) => void
  currentValues: SimulatedValues
}) {
  const [values, setValues] = useState<SimulatedValues>(currentValues)

  // Reset when dialog opens with new values
  React.useEffect(() => {
    if (open) setValues(currentValues)
  }, [open, currentValues])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            Simulate Week 9
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Adjust vendor-level metrics to see how the AI analysis responds. Start from Week 8 actuals.
          </p>
        </DialogHeader>
        <div className="space-y-5 py-2 max-h-[55vh] overflow-y-auto pr-1">
          {METRICS.map((config) => {
            const w8 = currentValues[config.key]
            const { min, max, step } = sliderRange(w8, config.format)
            const current = values[config.key]
            const delta = w8 > 0 ? ((current - w8) / w8) * 100 : 0
            const Icon = config.icon

            return (
              <div key={config.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold tabular-nums">{formatValue(current, config.format)}</span>
                    {Math.abs(delta) >= 0.1 && (
                      <span className={`text-xs font-medium ${config.invertDelta ? (delta < 0 ? 'text-status-good' : 'text-status-bad') : (delta > 0 ? 'text-status-good' : 'text-status-bad')}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={[current]}
                  onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setValues((prev) => ({ ...prev, [config.key]: val })) }}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                  <span>{formatValue(min, config.format)}</span>
                  <span className="text-muted-foreground/50">W8: {formatValue(w8, config.format)}</span>
                  <span>{formatValue(max, config.format)}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-raised transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSimulate(values)}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Run Analysis
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Analyzing Overlay ──────────────────────────────────────

function AnalyzingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            <Loader2 className="size-8 text-primary" />
          </motion.div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">Running AI diagnostics...</p>
            <p className="text-xs text-muted-foreground">Analyzing Week 9 performance data</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Simulation helpers ─────────────────────────────────────

function buildSimulatedData(
  vendorTrends: VendorTrends,
  vendorProducts: Product[],
  w9Values: SimulatedValues,
) {
  // Append W9 to each metric trend
  const newMetrics = {} as Record<MetricKey, { week: string; value: number }[]>
  for (const key of Object.keys(vendorTrends.metrics) as MetricKey[]) {
    newMetrics[key] = [
      ...vendorTrends.metrics[key],
      { week: 'W9', value: w9Values[key] },
    ]
  }

  // Scale ASIN data proportionally with jitter
  const w8Values: SimulatedValues = {} as SimulatedValues
  for (const key of Object.keys(vendorTrends.metrics) as MetricKey[]) {
    const data = vendorTrends.metrics[key]
    w8Values[key] = data[data.length - 1].value
  }

  const scaledProducts = vendorProducts.map((p) => {
    const jitter = () => 0.98 + Math.random() * 0.04
    const scale = (field: MetricKey, value: number) => {
      const ratio = w8Values[field] > 0 ? w9Values[field] / w8Values[field] : 1
      return value * ratio * jitter()
    }

    return {
      ...p,
      orderedRevenue: Math.round(scale('orderedRevenue', p.orderedRevenue)),
      orderedUnits: Math.round(scale('orderedUnits', p.orderedUnits)),
      traffic: Math.round(scale('traffic', p.traffic)),
      conversionRate: Number(scale('conversionRate', p.conversionRate).toFixed(1)),
      inStockRate: Math.min(100, Math.round(scale('inStockRate', p.inStockRate))),
      adSpend: Math.round(scale('adSpend', p.adSpend)),
      adAttributedSales: Math.round(scale('adAttributedSales', p.adAttributedSales)),
      returnRate: Number(scale('returnRate', p.returnRate).toFixed(1)),
    }
  })

  return {
    trends: { ...vendorTrends, metrics: newMetrics },
    products: scaledProducts,
  }
}

// ─── Overview Page ───────────────────────────────────────────

export function Overview() {
  const { selectedVendor, vendorProducts, vendorTrends } = useVendor()
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null)
  const [simDialogOpen, setSimDialogOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [simulation, setSimulation] = useState<{ trends: typeof vendorTrends; products: typeof vendorProducts } | null>(null)

  // Reset simulation when vendor changes
  React.useEffect(() => { setSimulation(null) }, [selectedVendor.id])

  // Current W8 values for slider defaults
  const w8Values = useMemo(() => {
    if (!vendorTrends) return null
    const vals = {} as SimulatedValues
    for (const key of Object.keys(vendorTrends.metrics) as MetricKey[]) {
      const data = vendorTrends.metrics[key]
      vals[key] = data[data.length - 1].value
    }
    return vals
  }, [vendorTrends])

  const handleSimulate = useCallback((values: SimulatedValues) => {
    if (!vendorTrends) return
    setSimDialogOpen(false)
    setAnalyzing(true)
    setTimeout(() => {
      const result = buildSimulatedData(vendorTrends, vendorProducts, values)
      setSimulation(result)
      setAnalyzing(false)
    }, 2000)
  }, [vendorTrends, vendorProducts])

  // Use simulated data if available, otherwise real data
  const activeTrends = simulation?.trends ?? vendorTrends
  const activeProducts = simulation?.products ?? vendorProducts
  const isSimulated = simulation !== null

  const diagnostics = useMemo(() => {
    if (!activeTrends) return null
    return runDiagnostics(selectedVendor.id, activeProducts, activeTrends)
  }, [selectedVendor.id, activeProducts, activeTrends])

  const summaries = useMemo(() => {
    if (!activeTrends || !diagnostics) return null
    return generateSummaries(selectedVendor, activeProducts, activeTrends, diagnostics.result)
  }, [selectedVendor, activeProducts, activeTrends, diagnostics])

  if (!vendorTrends || !activeTrends) return null

  const issues = diagnostics?.result ?? []
  const risks = issues.filter((i) => i.severity === 'critical' || i.severity === 'high')
  const opportunities = issues.filter((i) => i.severity === 'moderate' || i.severity === 'low')

  return (
    <div className="space-y-6">
      {/* Analyzing overlay */}
      <AnalyzingOverlay visible={analyzing} />

      {/* Simulate Week Dialog */}
      {w8Values && (
        <SimulateWeekDialog
          open={simDialogOpen}
          onClose={() => setSimDialogOpen(false)}
          onSimulate={handleSimulate}
          currentValues={w8Values}
        />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Executive Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portfolio performance for{' '}
            <span className="font-medium text-foreground">{selectedVendor.name}</span>
            {isSimulated && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <FlaskConical className="size-3" />
                Simulated · Week 9
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isSimulated && (
            <button
              type="button"
              onClick={() => setSimulation(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors"
            >
              <X className="size-3" />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setSimDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FlaskConical className="size-3" />
            {isSimulated ? 'Re-simulate' : 'Simulate Week 9'}
          </button>
        </div>
      </div>

      {/* Stats Band — unified container with dividers */}
      <StatsBand metrics={METRICS} trendData={activeTrends.metrics} onMetricClick={setSelectedMetric} />

      {/* Metric Detail Dialog */}
      <MetricDetailDialog
        metricKey={selectedMetric}
        metrics={METRICS}
        trendData={activeTrends.metrics}
        onClose={() => setSelectedMetric(null)}
      />

      {/* Chart + Side Widgets */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row">
        <RevenueTrendChart revenueData={activeTrends.metrics.orderedRevenue} adSpendData={activeTrends.metrics.adSpend} />
        <div className="flex w-full flex-col gap-4 xl:w-[380px]">
          <IssueDistributionWidget issues={issues} />
          <RevenueByCategoryWidget products={activeProducts} />
        </div>
      </div>

      {/* AI Summary — two standalone cards side by side */}
      {summaries && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6 lg:items-start" ref={(el) => {
          // Sync heights: left card sets the standard, right card matches and scrolls
          if (!el) return
          const left = el.querySelector<HTMLElement>('[data-ai-left]')
          const right = el.querySelector<HTMLElement>('[data-ai-right]')
          if (left && right) {
            right.style.maxHeight = ''
            requestAnimationFrame(() => {
              right.style.maxHeight = `${left.offsetHeight}px`
            })
          }
        }}>
          {/* Left card — AI Summary */}
          <motion.div
            data-ai-left
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-card via-card to-primary/[0.04] p-4 sm:p-5 transition-colors hover:bg-surface-raised/20 lg:col-span-2"
            style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}
          >
            <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/[0.06] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-32 rounded-full bg-primary/[0.04] blur-2xl" />

            <div className="relative space-y-3">
              <div className="inline-flex rounded-full p-[0.75px] transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_16px_-2px_var(--primary)]" style={{ background: 'linear-gradient(135deg, var(--primary), var(--chart-2), var(--accent), var(--chart-4), var(--chart-5), var(--primary))' }}>
                <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">AI Summary</span>
                </div>
              </div>

              <div className="rounded-xl p-[0.75px]" style={{ background: 'linear-gradient(135deg, var(--primary), var(--chart-2), var(--accent), var(--chart-4), var(--chart-5), var(--primary))' }}>
                <div className="rounded-[11px] bg-black px-4 py-3.5">
                  <p className="text-[13.5px] text-white leading-[1.85] tracking-wide font-normal">
                    {summaries.result.executiveSummary}
                  </p>
                </div>
              </div>

              <GenerationExplainer explanation={summaries.explanation} />
            </div>
          </motion.div>

          {/* Right card — Key Findings (scrollable) */}
          <motion.div
            data-ai-right
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="rounded-xl border-2 bg-card p-4 sm:p-5 overflow-y-auto transition-colors hover:bg-surface-raised/20 lg:col-span-3"
            style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Key Findings</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{summaries.result.keyFindings.length} observations</span>
            </div>
            <ul className="space-y-2">
              {summaries.result.keyFindings.map((finding, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-xl bg-background/30 p-3.5 backdrop-blur-sm transition-all duration-200 hover:bg-background/50"
                  style={{ border: '1px solid color-mix(in srgb, var(--chart-2) 30%, transparent)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--chart-2) 60%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--chart-2) 30%, transparent)' }}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                    <span className="text-sm font-semibold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pt-1.5">{finding}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* Risks & Opportunities */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
        <Card className="transition-colors border-2 hover:bg-surface-raised/30" style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-status-bad-bg px-3 py-1">
                <AlertTriangle className="size-3.5 text-status-bad" />
                <span className="text-xs font-bold text-status-bad uppercase tracking-wider">Top Risks</span>
              </div>
              {risks.length > 0 && (
                <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">{risks.length} issues</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {risks.length > 0 ? (
              <div className="flex flex-col">
                <Separator />
                {risks.map((issue) => (
                  <React.Fragment key={issue.id}>
                    <IssueRow issue={issue} />
                    <Separator />
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2 px-6">
                No critical or high-priority risks detected.
              </p>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
        <Card className="transition-colors border-2 hover:bg-surface-raised/30" style={{ borderColor: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                <Lightbulb className="size-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Opportunities</span>
              </div>
              {opportunities.length > 0 && (
                <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">{opportunities.length} items</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {opportunities.length > 0 ? (
              <div className="flex flex-col">
                <Separator />
                {opportunities.map((issue) => (
                  <React.Fragment key={issue.id}>
                    <IssueRow issue={issue} />
                    <Separator />
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2 px-6">
                No improvement opportunities flagged — account is performing well.
              </p>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Diagnostics explainer */}
      {diagnostics && (
        <GenerationExplainer explanation={diagnostics.explanation} />
      )}
    </div>
  )
}
