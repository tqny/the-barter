import { useMemo, useState } from 'react'
import { useVendor } from '@/context/VendorContext'
import { runDiagnostics } from '@/lib/intelligence/diagnostics'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { GenerationExplainer } from '@/components/shared/GenerationExplainer'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { SectionHeader } from '@/components/shared/SectionHeader'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  PackageX,
  FileWarning,
  Megaphone,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import type { Product, DiagnosticIssue, IssueType, ConfidenceLevel, Severity } from '@/data/types'

// ─── Types ──────────────────────────────────────────────────

type SortKey =
  | 'title'
  | 'orderedRevenue'
  | 'orderedUnits'
  | 'traffic'
  | 'conversionRate'
  | 'inStockRate'
  | 'returnRate'
  | 'adSpend'
  | 'contentQualityScore'
type SortDir = 'asc' | 'desc'

// ─── Helpers ────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}

const ISSUE_LABELS: Record<IssueType, { label: string; color: string }> = {
  'low-conversion': { label: 'Low CVR', color: 'bg-status-warn-bg text-status-warn' },
  'low-traffic': { label: 'Low Traffic', color: 'bg-status-warn-bg text-status-warn' },
  'high-return-rate': { label: 'High Returns', color: 'bg-status-bad-bg text-status-bad' },
  'low-in-stock': { label: 'Low Stock', color: 'bg-status-bad-bg text-status-bad' },
  'content-quality': { label: 'Content', color: 'bg-status-info-bg text-status-info' },
  'ad-inefficiency': { label: 'Ad ROAS', color: 'bg-status-warn-bg text-status-warn' },
  'price-erosion': { label: 'Price', color: 'bg-status-warn-bg text-status-warn' },
}

// ─── Sortable Column Header ────────────────────────────────

function SortableHead({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  className = '',
}: {
  label: string
  sortKey: SortKey
  currentSort: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
  className?: string
}) {
  const isActive = currentSort === sortKey
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {isActive ? (
          currentDir === 'asc' ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

// ─── Issue Flag Badges ──────────────────────────────────────

function IssueBadges({ issues }: { issues: IssueType[] }) {
  if (issues.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {issues.map((issue) => (
        <span
          key={issue}
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${ISSUE_LABELS[issue].color}`}
        >
          {ISSUE_LABELS[issue].label}
        </span>
      ))}
    </div>
  )
}

// ─── Top Movers / Weak Converters ───────────────────────────

function classifyProduct(product: Product, allProducts: Product[]): 'top-mover' | 'weak-converter' | null {
  const sorted = [...allProducts].sort((a, b) => b.orderedRevenue - a.orderedRevenue)
  const topN = Math.max(1, Math.ceil(sorted.length * 0.2))

  if (sorted.indexOf(product) < topN) return 'top-mover'
  if (product.conversionRate < 4.0) return 'weak-converter'
  return null
}

function ProductTag({ tag }: { tag: 'top-mover' | 'weak-converter' }) {
  if (tag === 'top-mover') {
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none bg-status-good-bg text-status-good">
        <TrendingUp className="size-2.5" />
        Top Mover
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none bg-status-bad-bg text-status-bad">
      <TrendingDown className="size-2.5" />
      Weak CVR
    </span>
  )
}

// ─── Confidence Tag ─────────────────────────────────────────

function ConfidenceTag({ confidence }: { confidence: ConfidenceLevel }) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'bg-status-good-bg text-status-good',
    moderate: 'bg-status-warn-bg text-status-warn',
  }
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${styles[confidence]}`}>
      {confidence === 'high' ? 'High confidence' : 'Moderate — verify'}
    </span>
  )
}

// ─── Diagnostic Summary Strip ───────────────────────────────

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'moderate', 'low']

const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-status-bad',
  high: 'bg-status-warn',
  moderate: 'bg-primary',
  low: 'bg-muted-foreground/60',
}

function DiagnosticSummaryStrip({ issues }: { issues: DiagnosticIssue[] }) {
  const counts: Record<Severity, number> = { critical: 0, high: 0, moderate: 0, low: 0 }
  for (const issue of issues) {
    counts[issue.severity]++
  }

  const activeSeverities = SEVERITY_ORDER.filter((s) => counts[s] > 0)

  if (activeSeverities.length === 0) return null

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-2.5">
      <span className="text-xs font-medium text-muted-foreground">Issues</span>
      <div className="flex items-center gap-3">
        {activeSeverities.map((severity) => (
          <div key={severity} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${SEVERITY_DOT[severity]}`} />
            <span className="text-sm font-semibold text-foreground">{counts[severity]}</span>
            <span className="text-xs text-muted-foreground capitalize">{severity}</span>
          </div>
        ))}
      </div>
      <span className="ml-auto text-xs text-muted-foreground">
        {issues.length} total
      </span>
    </div>
  )
}

// ─── Category Icons ─────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Revenue: BarChart3,
  Conversion: TrendingDown,
  'Supply Chain': PackageX,
  Returns: AlertTriangle,
  Content: FileWarning,
  Advertising: Megaphone,
  Traffic: TrendingDown,
}

// ─── Collapsible Diagnostic Row ─────────────────────────────

function DiagnosticRow({ issue }: { issue: DiagnosticIssue }) {
  const Icon = CATEGORY_ICONS[issue.category] ?? ShieldAlert

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-3 py-2.5 px-3 rounded-md hover:bg-surface-raised/50 transition-colors text-left group cursor-pointer">
        <ChevronRight className="size-3.5 text-muted-foreground shrink-0 transition-transform group-data-[panel-open]:rotate-90" />
        <Icon className="size-4 text-muted-foreground shrink-0" />
        <SeverityBadge severity={issue.severity} />
        <span className="text-sm font-medium text-foreground flex-1 truncate">{issue.title}</span>
        <ConfidenceTag confidence={issue.confidence} />
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{issue.ownerTeam}</span>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {issue.affectedAsins.length} {issue.affectedAsins.length === 1 ? 'ASIN' : 'ASINs'}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-10 mr-3 mb-2 pl-3 border-l-2 border-border">
          <ul className="space-y-1 py-2">
            {issue.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ─── Diagnostics Page ───────────────────────────────────────

export function Diagnostics() {
  const { selectedVendor, vendorProducts, vendorTrends } = useVendor()

  const diagnostics = useMemo(() => {
    if (!vendorTrends) return null
    return runDiagnostics(selectedVendor.id, vendorProducts, vendorTrends)
  }, [selectedVendor.id, vendorProducts, vendorTrends])

  // Table sort state
  const [sortKey, setSortKey] = useState<SortKey>('orderedRevenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedProducts = useMemo(() => {
    return [...vendorProducts].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      const aNum = aVal as number
      const bNum = bVal as number
      return sortDir === 'asc' ? aNum - bNum : bNum - aNum
    })
  }, [vendorProducts, sortKey, sortDir])

  if (!vendorTrends) return null

  const issues = diagnostics?.result ?? []
  const hasIssues = issues.length > 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Catalog & Diagnostics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Product-level diagnostics for{' '}
          <span className="font-medium text-foreground">{selectedVendor.name}</span>
          {' — '}
          <span>{vendorProducts.length} ASINs</span>
        </p>
      </div>

      {/* Diagnostic Summary Strip */}
      <DiagnosticSummaryStrip issues={issues} />

      {/* ASIN Data Table */}
      <Card>
        <CardHeader>
          <SectionHeader icon={BarChart3} title="Product Performance" />
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Product" sortKey="title" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="pl-4 min-w-[200px]" />
                <SortableHead label="Revenue" sortKey="orderedRevenue" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Units" sortKey="orderedUnits" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Traffic" sortKey="traffic" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="CVR" sortKey="conversionRate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="In-Stock" sortKey="inStockRate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Return %" sortKey="returnRate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Ad Spend" sortKey="adSpend" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Content" sortKey="contentQualityScore" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="text-right" />
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => {
                const tag = classifyProduct(product, vendorProducts)
                const roas = product.adSpend > 0 ? product.adAttributedSales / product.adSpend : null

                return (
                  <TableRow key={product.asin}>
                    <TableCell className="pl-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground truncate max-w-[240px]" title={product.title}>
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{product.asin}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                          {tag && <ProductTag tag={tag} />}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(product.orderedRevenue)}</TableCell>
                    <TableCell className="text-right text-sm">{formatNumber(product.orderedUnits)}</TableCell>
                    <TableCell className="text-right text-sm">{formatNumber(product.traffic)}</TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={product.conversionRate < 4.0 ? 'text-status-bad font-medium' : ''}>
                        {product.conversionRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={product.inStockRate < 85 ? 'text-status-bad font-medium' : product.inStockRate < 90 ? 'text-status-warn font-medium' : ''}>
                        {product.inStockRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={product.returnRate > 6.0 ? 'text-status-bad font-medium' : product.returnRate > 4.0 ? 'text-status-warn font-medium' : ''}>
                        {product.returnRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <div>
                        <span>{formatCurrency(product.adSpend)}</span>
                        {roas !== null && (
                          <span className={`block text-xs ${roas < 2.0 ? 'text-status-bad' : roas < 3.0 ? 'text-status-warn' : 'text-muted-foreground'}`}>
                            {roas.toFixed(1)}x ROAS
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={product.contentQualityScore < 65 ? 'text-status-bad font-medium' : product.contentQualityScore < 75 ? 'text-status-warn font-medium' : ''}>
                        {product.contentQualityScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <IssueBadges issues={product.issues} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diagnostic Analysis — collapsible rows */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <SectionHeader icon={ShieldAlert} title="Diagnostic Analysis" />
            {hasIssues && (
              <span className="text-xs text-muted-foreground">{issues.length} issues detected</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasIssues ? (
            <div className="divide-y divide-border -mx-3">
              {issues.map((issue) => (
                <DiagnosticRow key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <CheckCircle2 className="size-5 text-status-good shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">No issues detected</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All monitored KPIs for {selectedVendor.name} are within acceptable thresholds.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Explainer */}
      {diagnostics && (
        <GenerationExplainer explanation={diagnostics.explanation} />
      )}
    </div>
  )
}
