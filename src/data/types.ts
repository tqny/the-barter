// ─── Vendor ───────────────────────────────────────────────────

export type HealthStatus = 'good' | 'warn' | 'bad'

export interface Vendor {
  id: string
  name: string
  brand: string
  category: string
  healthStatus: HealthStatus
  accountManager: string
}

// ─── Products ─────────────────────────────────────────────────

export type IssueType =
  | 'low-conversion'
  | 'low-traffic'
  | 'high-return-rate'
  | 'low-in-stock'
  | 'content-quality'
  | 'ad-inefficiency'
  | 'price-erosion'

export interface Product {
  asin: string
  vendorId: string
  title: string
  category: string
  orderedRevenue: number
  orderedUnits: number
  traffic: number // detail page views
  conversionRate: number // percentage
  inStockRate: number // percentage
  adSpend: number
  adAttributedSales: number
  returnRate: number // percentage
  contentQualityScore: number // 1-100
  issues: IssueType[]
}

// ─── Trends ───────────────────────────────────────────────────

export type MetricKey =
  | 'orderedRevenue'
  | 'orderedUnits'
  | 'traffic'
  | 'conversionRate'
  | 'inStockRate'
  | 'adSpend'
  | 'adAttributedSales'
  | 'returnRate'

export interface WeeklyDataPoint {
  week: string // e.g. "W1", "W2", ...
  value: number
}

export interface VendorTrends {
  vendorId: string
  metrics: Record<MetricKey, WeeklyDataPoint[]>
}

// ─── Intelligence Layer Output Types ──────────────────────────

export type Severity = 'critical' | 'high' | 'moderate' | 'low'
export type ConfidenceLevel = 'high' | 'moderate'

export interface DiagnosticIssue {
  id: string
  vendorId: string
  category: string
  title: string
  severity: Severity
  confidence: ConfidenceLevel
  evidence: string[]
  affectedAsins: string[]
  ownerTeam: OwnerTeam
}

export type OwnerTeam =
  | 'Marketing'
  | 'Merchandising'
  | 'Supply Chain'
  | 'Operational Excellence'

export interface Recommendation {
  id: string
  title: string
  description: string
  ownerTeam: OwnerTeam
  priority: Severity
  dueDate: string
  relatedIssueIds: string[]
}

export interface RecommendationGroup {
  ownerTeam: OwnerTeam
  recommendations: Recommendation[]
}

export type FindingType =
  | 'revenue-trend'
  | 'traffic-trend'
  | 'in-stock-health'
  | 'return-rate'
  | 'issue-evidence'
  | 'conversion-fallback'

export type KeyFindingVizData =
  | { type: 'revenue-trend'; series: WeeklyDataPoint[] }
  | { type: 'traffic-trend'; series: WeeklyDataPoint[] }
  | { type: 'in-stock-health'; series: WeeklyDataPoint[]; benchmark: number }
  | { type: 'return-rate'; series: WeeklyDataPoint[]; threshold: number }
  | { type: 'issue-evidence'; issue: DiagnosticIssue }
  | { type: 'conversion-fallback'; series: WeeklyDataPoint[]; productCount: number }

export interface KeyFinding {
  type: FindingType
  text: string
  vizData: KeyFindingVizData
}

export interface Summary {
  executiveSummary: string
  keyFindings: KeyFinding[]
  qbrTalkingPoints: string[]
  followUpDraft: string
}

export type ActionStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue'

export interface ActionItem {
  recommendationId: string
  status: ActionStatus
}

/** All intelligence functions return this shape */
export interface IntelligenceResult<T> {
  result: T
  explanation: string
}

// ─── Scorecard ────────────────────────────────────────────────

export interface MetricSummary {
  key: MetricKey
  label: string
  value: number
  previousValue: number
  format: 'currency' | 'number' | 'percent'
}
