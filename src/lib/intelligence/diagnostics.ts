import type {
  Product,
  VendorTrends,
  DiagnosticIssue,
  IntelligenceResult,
  Severity,
  ConfidenceLevel,
  OwnerTeam,
  MetricKey,
} from '../../data/types'

// ─── Thresholds ──────────────────────────────────────────────

const THRESHOLDS = {
  conversionRate: { bad: 4.0, warn: 6.0 },
  inStockRate: { bad: 75, warn: 88 },
  returnRate: { bad: 6.0, warn: 4.0 },
  contentQualityScore: { bad: 65, warn: 75 },
  adRoas: { bad: 2.0, warn: 3.0 }, // ad-attributed sales / ad spend
  trafficWowDecline: 0.05, // 5% week-over-week decline
  revenueWowDecline: 0.05,
  inStockWowDecline: 0.03, // 3% WoW decline in stock rate
} as const

// ─── Helpers ─────────────────────────────────────────────────

function wowChange(trends: VendorTrends, metric: MetricKey): number {
  const data = trends.metrics[metric]
  const current = data[data.length - 1].value
  const previous = data[data.length - 2].value
  return previous === 0 ? 0 : (current - previous) / previous
}

function multiWeekTrend(trends: VendorTrends, metric: MetricKey, weeks: number): number {
  const data = trends.metrics[metric]
  const current = data[data.length - 1].value
  const past = data[data.length - weeks].value
  return past === 0 ? 0 : (current - past) / past
}

function makeId(vendorId: string, category: string, index: number): string {
  return `${vendorId}-${category.toLowerCase().replace(/\s+/g, '-')}-${index}`
}

// ─── Issue Detectors ─────────────────────────────────────────

interface RawIssue {
  category: string
  title: string
  severity: Severity
  evidence: string[]
  affectedAsins: string[]
  ownerTeam: OwnerTeam
}

function detectConversionIssues(products: Product[]): RawIssue[] {
  const weak = products.filter((p) => p.conversionRate < THRESHOLDS.conversionRate.warn)
  if (weak.length === 0) return []

  const critical = weak.filter((p) => p.conversionRate < THRESHOLDS.conversionRate.bad)
  const severity: Severity = critical.length > 0 ? 'critical' : 'high'
  const avgRate = weak.reduce((sum, p) => sum + p.conversionRate, 0) / weak.length

  return [
    {
      category: 'Conversion',
      title: `Low conversion rate across ${weak.length} ASIN${weak.length > 1 ? 's' : ''}`,
      severity,
      evidence: [
        `${weak.length} product${weak.length > 1 ? 's' : ''} converting below ${THRESHOLDS.conversionRate.warn}% (avg ${avgRate.toFixed(1)}%)`,
        ...critical.map(
          (p) => `${p.title} at ${p.conversionRate}% — significantly below threshold`,
        ),
      ],
      affectedAsins: weak.map((p) => p.asin),
      ownerTeam: 'Merchandising',
    },
  ]
}

function detectInventoryIssues(products: Product[], trends: VendorTrends): RawIssue[] {
  const lowStock = products.filter((p) => p.inStockRate < THRESHOLDS.inStockRate.warn)
  if (lowStock.length === 0) return []

  const critical = lowStock.filter((p) => p.inStockRate < THRESHOLDS.inStockRate.bad)
  const severity: Severity = critical.length > 0 ? 'critical' : 'high'
  const avgRate = lowStock.reduce((sum, p) => sum + p.inStockRate, 0) / lowStock.length

  const evidence: string[] = [
    `${lowStock.length} product${lowStock.length > 1 ? 's' : ''} below ${THRESHOLDS.inStockRate.warn}% in-stock (avg ${avgRate.toFixed(0)}%)`,
  ]

  // Check vendor-level trend
  const stockTrend = multiWeekTrend(trends, 'inStockRate', 4)
  if (stockTrend < -THRESHOLDS.inStockWowDecline) {
    evidence.push(
      `Vendor-level in-stock rate declining ${(Math.abs(stockTrend) * 100).toFixed(1)}% over 4 weeks`,
    )
  }

  critical.forEach((p) => {
    evidence.push(`${p.title} at ${p.inStockRate}% — high risk of lost sales`)
  })

  return [
    {
      category: 'Supply Chain',
      title: `Inventory risk on ${lowStock.length} ASIN${lowStock.length > 1 ? 's' : ''}`,
      severity,
      evidence,
      affectedAsins: lowStock.map((p) => p.asin),
      ownerTeam: 'Supply Chain',
    },
  ]
}

function detectReturnRateIssues(products: Product[]): RawIssue[] {
  const highReturn = products.filter((p) => p.returnRate > THRESHOLDS.returnRate.warn)
  if (highReturn.length === 0) return []

  const critical = highReturn.filter((p) => p.returnRate > THRESHOLDS.returnRate.bad)
  const severity: Severity = critical.length > 0 ? 'critical' : 'high'
  const avgRate = highReturn.reduce((sum, p) => sum + p.returnRate, 0) / highReturn.length

  const evidence: string[] = [
    `${highReturn.length} product${highReturn.length > 1 ? 's' : ''} with return rate above ${THRESHOLDS.returnRate.warn}% (avg ${avgRate.toFixed(1)}%)`,
  ]

  // Check for correlation with content quality
  const alsoLowContent = highReturn.filter(
    (p) => p.contentQualityScore < THRESHOLDS.contentQualityScore.warn,
  )
  if (alsoLowContent.length > 0) {
    evidence.push(
      `${alsoLowContent.length} of these also have low content quality scores — possible listing accuracy issue`,
    )
  }

  critical.forEach((p) => {
    evidence.push(`${p.title} at ${p.returnRate}% return rate`)
  })

  return [
    {
      category: 'Returns',
      title: `Elevated return rates on ${highReturn.length} ASIN${highReturn.length > 1 ? 's' : ''}`,
      severity,
      evidence,
      affectedAsins: highReturn.map((p) => p.asin),
      ownerTeam: 'Operational Excellence',
    },
  ]
}

function detectContentIssues(products: Product[]): RawIssue[] {
  const poorContent = products.filter(
    (p) => p.contentQualityScore < THRESHOLDS.contentQualityScore.warn,
  )
  if (poorContent.length === 0) return []

  const critical = poorContent.filter(
    (p) => p.contentQualityScore < THRESHOLDS.contentQualityScore.bad,
  )
  const severity: Severity = critical.length > 0 ? 'high' : 'moderate'
  const avgScore =
    poorContent.reduce((sum, p) => sum + p.contentQualityScore, 0) / poorContent.length

  const evidence: string[] = [
    `${poorContent.length} product${poorContent.length > 1 ? 's' : ''} with content quality below ${THRESHOLDS.contentQualityScore.warn}/100 (avg ${avgScore.toFixed(0)})`,
  ]

  // Check for correlation with conversion
  const alsoLowConversion = poorContent.filter(
    (p) => p.conversionRate < THRESHOLDS.conversionRate.warn,
  )
  if (alsoLowConversion.length > 0) {
    evidence.push(
      `${alsoLowConversion.length} of these also have below-average conversion — content may be suppressing purchase intent`,
    )
  }

  return [
    {
      category: 'Content',
      title: `Content quality gaps on ${poorContent.length} listing${poorContent.length > 1 ? 's' : ''}`,
      severity,
      evidence,
      affectedAsins: poorContent.map((p) => p.asin),
      ownerTeam: 'Merchandising',
    },
  ]
}

function detectAdEfficiencyIssues(products: Product[]): RawIssue[] {
  const inefficient = products.filter((p) => {
    if (p.adSpend === 0) return false
    const roas = p.adAttributedSales / p.adSpend
    return roas < THRESHOLDS.adRoas.warn
  })
  if (inefficient.length === 0) return []

  const critical = inefficient.filter((p) => p.adAttributedSales / p.adSpend < THRESHOLDS.adRoas.bad)
  const severity: Severity = critical.length > 0 ? 'high' : 'moderate'
  const totalWasted = inefficient.reduce((sum, p) => {
    const roas = p.adAttributedSales / p.adSpend
    return sum + (roas < THRESHOLDS.adRoas.bad ? p.adSpend * 0.4 : p.adSpend * 0.2)
  }, 0)

  const evidence: string[] = [
    `${inefficient.length} product${inefficient.length > 1 ? 's' : ''} with ROAS below ${THRESHOLDS.adRoas.warn}x`,
    `Estimated ~$${Math.round(totalWasted).toLocaleString()} in potentially inefficient ad spend`,
  ]

  // Check for correlation with low in-stock (ads driving to OOS pages)
  const alsoOos = inefficient.filter((p) => p.inStockRate < THRESHOLDS.inStockRate.warn)
  if (alsoOos.length > 0) {
    evidence.push(
      `${alsoOos.length} of these have low in-stock rates — ads may be driving traffic to unavailable products`,
    )
  }

  return [
    {
      category: 'Advertising',
      title: `Ad inefficiency on ${inefficient.length} ASIN${inefficient.length > 1 ? 's' : ''}`,
      severity,
      evidence,
      affectedAsins: inefficient.map((p) => p.asin),
      ownerTeam: 'Marketing',
    },
  ]
}

function detectTrafficDecline(trends: VendorTrends, products: Product[]): RawIssue[] {
  const wow = wowChange(trends, 'traffic')
  const fourWeek = multiWeekTrend(trends, 'traffic', 4)

  if (wow >= -THRESHOLDS.trafficWowDecline && fourWeek >= -THRESHOLDS.trafficWowDecline) return []

  const severity: Severity = fourWeek < -0.1 ? 'high' : 'moderate'
  const evidence: string[] = []

  if (wow < -THRESHOLDS.trafficWowDecline) {
    evidence.push(`Traffic declined ${(Math.abs(wow) * 100).toFixed(1)}% week-over-week`)
  }
  if (fourWeek < -THRESHOLDS.trafficWowDecline) {
    evidence.push(`Traffic down ${(Math.abs(fourWeek) * 100).toFixed(1)}% over 4 weeks`)
  }

  // Check if revenue also declining (corroborating signal)
  const revWow = wowChange(trends, 'orderedRevenue')
  if (revWow < -THRESHOLDS.revenueWowDecline) {
    evidence.push(
      `Revenue also declining ${(Math.abs(revWow) * 100).toFixed(1)}% WoW — traffic loss is impacting sales`,
    )
  }

  return [
    {
      category: 'Traffic',
      title: 'Declining traffic trend',
      severity,
      evidence,
      affectedAsins: products.map((p) => p.asin),
      ownerTeam: 'Marketing',
    },
  ]
}

function detectRevenueDecline(trends: VendorTrends, products: Product[]): RawIssue[] {
  const fourWeek = multiWeekTrend(trends, 'orderedRevenue', 4)
  if (fourWeek >= -THRESHOLDS.revenueWowDecline) return []

  const severity: Severity = fourWeek < -0.1 ? 'critical' : 'high'
  const evidence: string[] = [
    `Revenue declined ${(Math.abs(fourWeek) * 100).toFixed(1)}% over 4 weeks`,
  ]

  // Look for corroborating factors
  const convDecline = multiWeekTrend(trends, 'conversionRate', 4)
  if (convDecline < -0.03) {
    evidence.push(
      `Conversion rate also down ${(Math.abs(convDecline) * 100).toFixed(1)}% — demand quality weakening`,
    )
  }

  const stockDecline = multiWeekTrend(trends, 'inStockRate', 4)
  if (stockDecline < -THRESHOLDS.inStockWowDecline) {
    evidence.push(
      `In-stock rate declining — lost sales from availability gaps likely contributing`,
    )
  }

  return [
    {
      category: 'Revenue',
      title: 'Revenue decline trend',
      severity,
      evidence,
      affectedAsins: products.map((p) => p.asin),
      ownerTeam: 'Merchandising',
    },
  ]
}

// ─── Confidence Scoring ──────────────────────────────────────

function scoreConfidence(issue: RawIssue): ConfidenceLevel {
  // More evidence = higher confidence
  // 3+ evidence points including correlations → high
  // Otherwise → moderate
  return issue.evidence.length >= 3 ? 'high' : 'moderate'
}

// ─── Severity Ordering ───────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
}

// ─── Main Function ───────────────────────────────────────────

export function runDiagnostics(
  vendorId: string,
  products: Product[],
  trends: VendorTrends,
): IntelligenceResult<DiagnosticIssue[]> {
  const vendorProducts = products.filter((p) => p.vendorId === vendorId)

  // Run all detectors
  const rawIssues: RawIssue[] = [
    ...detectRevenueDecline(trends, vendorProducts),
    ...detectConversionIssues(vendorProducts),
    ...detectInventoryIssues(vendorProducts, trends),
    ...detectReturnRateIssues(vendorProducts),
    ...detectContentIssues(vendorProducts),
    ...detectAdEfficiencyIssues(vendorProducts),
    ...detectTrafficDecline(trends, vendorProducts),
  ]

  // Sort by severity, then by affected ASIN count (most impactful first)
  rawIssues.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (sevDiff !== 0) return sevDiff
    return b.affectedAsins.length - a.affectedAsins.length
  })

  // Convert to DiagnosticIssue with IDs and confidence
  const result: DiagnosticIssue[] = rawIssues.map((raw, i) => ({
    id: makeId(vendorId, raw.category, i),
    vendorId,
    category: raw.category,
    title: raw.title,
    severity: raw.severity,
    confidence: scoreConfidence(raw),
    evidence: raw.evidence,
    affectedAsins: raw.affectedAsins,
    ownerTeam: raw.ownerTeam,
  }))

  // Build explanation for GenerationExplainer
  const explanation = buildExplanation(result)

  return { result, explanation }
}

function buildExplanation(issues: DiagnosticIssue[]): string {
  if (issues.length === 0) {
    return 'No significant issues detected. All monitored KPIs are within acceptable thresholds. Metrics checked: conversion rate, in-stock rate, return rate, content quality score, ad ROAS, traffic trends, and revenue trends.'
  }

  const categories = [...new Set(issues.map((i) => i.category))]
  const thresholds = [
    `Conversion: flagged below ${THRESHOLDS.conversionRate.warn}%`,
    `In-stock: flagged below ${THRESHOLDS.inStockRate.warn}%`,
    `Return rate: flagged above ${THRESHOLDS.returnRate.warn}%`,
    `Content quality: flagged below ${THRESHOLDS.contentQualityScore.warn}/100`,
    `Ad ROAS: flagged below ${THRESHOLDS.adRoas.warn}x`,
    `Traffic/revenue: flagged on ${(THRESHOLDS.trafficWowDecline * 100).toFixed(0)}%+ decline`,
  ]

  return [
    `Detected ${issues.length} issue${issues.length > 1 ? 's' : ''} across ${categories.join(', ')}.`,
    '',
    'Detection method: Rule-based pattern matching against ASIN-level and vendor-level KPIs with the following thresholds:',
    ...thresholds.map((t) => `  \u2022 ${t}`),
    '',
    'Confidence scoring: Issues with 3+ corroborating evidence points (cross-metric correlations, multi-week trends) are rated High confidence. Others are rated Moderate \u2014 verify with vendor.',
  ].join('\n')
}
