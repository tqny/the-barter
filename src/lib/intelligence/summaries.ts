import type {
  Vendor,
  Product,
  VendorTrends,
  DiagnosticIssue,
  Summary,
  IntelligenceResult,
  MetricKey,
} from '../../data/types'

// ─── Helpers ─────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatDelta(current: number, previous: number): string {
  const change = previous === 0 ? 0 : ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

function getLatest(trends: VendorTrends, metric: MetricKey): number {
  const data = trends.metrics[metric]
  return data[data.length - 1].value
}

function getPrevious(trends: VendorTrends, metric: MetricKey): number {
  const data = trends.metrics[metric]
  return data[data.length - 2].value
}

function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's')
}

// ─── Executive Summary Templates ─────────────────────────────

function buildExecutiveSummary(
  vendor: Vendor,
  products: Product[],
  trends: VendorTrends,
  issues: DiagnosticIssue[],
): string {
  const revenue = getLatest(trends, 'orderedRevenue')
  const prevRevenue = getPrevious(trends, 'orderedRevenue')
  const revDelta = formatDelta(revenue, prevRevenue)
  const units = getLatest(trends, 'orderedUnits')
  const prevUnits = getPrevious(trends, 'orderedUnits')
  const unitsDelta = formatDelta(units, prevUnits)
  const convRate = getLatest(trends, 'conversionRate')

  const criticalCount = issues.filter((i) => i.severity === 'critical').length
  const highCount = issues.filter((i) => i.severity === 'high').length

  // Opening: vendor performance snapshot
  let summary = `${vendor.brand} generated ${formatCurrency(revenue)} in ordered revenue this week (${revDelta} WoW) across ${products.length} active ASINs, with ${units.toLocaleString()} units ordered (${unitsDelta} WoW) at a ${formatPct(convRate)} conversion rate.`

  // Health assessment
  if (issues.length === 0) {
    summary += ` The account is performing well with no significant issues detected. All key metrics are within acceptable ranges.`
  } else if (criticalCount > 0) {
    summary += ` The account requires immediate attention — ${criticalCount} critical ${pluralize(criticalCount, 'issue')} and ${highCount} high-priority ${pluralize(highCount, 'issue')} detected across ${categorySummary(issues)}.`
  } else if (highCount > 0) {
    summary += ` There ${highCount === 1 ? 'is' : 'are'} ${highCount} high-priority ${pluralize(highCount, 'issue')} to address in ${categorySummary(issues)}.`
  } else {
    summary += ` ${issues.length} moderate ${pluralize(issues.length, 'issue')} noted in ${categorySummary(issues)} — worth monitoring but not urgent.`
  }

  // Top concern detail
  if (issues.length > 0) {
    const top = issues[0]
    summary += ` Top priority: ${top.title.toLowerCase()} (${top.confidence} confidence, ${top.affectedAsins.length} ${pluralize(top.affectedAsins.length, 'ASIN')} affected).`
  }

  return summary
}

function categorySummary(issues: DiagnosticIssue[]): string {
  const categories = [...new Set(issues.map((i) => i.category.toLowerCase()))]
  if (categories.length === 1) return categories[0]
  if (categories.length === 2) return `${categories[0]} and ${categories[1]}`
  return `${categories.slice(0, -1).join(', ')}, and ${categories[categories.length - 1]}`
}

// ─── Key Findings ────────────────────────────────────────────

function buildKeyFindings(
  _vendor: Vendor,
  products: Product[],
  trends: VendorTrends,
  issues: DiagnosticIssue[],
): string[] {
  const findings: string[] = []

  // Revenue trend
  const revenue = getLatest(trends, 'orderedRevenue')
  const prevRevenue = getPrevious(trends, 'orderedRevenue')
  const revChange = ((revenue - prevRevenue) / prevRevenue) * 100
  if (Math.abs(revChange) >= 2) {
    findings.push(
      `Revenue ${revChange > 0 ? 'increased' : 'decreased'} ${formatPct(Math.abs(revChange))} week-over-week to ${formatCurrency(revenue)}`,
    )
  }

  // Traffic trend
  const traffic = getLatest(trends, 'traffic')
  const prevTraffic = getPrevious(trends, 'traffic')
  const trafficChange = ((traffic - prevTraffic) / prevTraffic) * 100
  if (Math.abs(trafficChange) >= 3) {
    findings.push(
      `Traffic ${trafficChange > 0 ? 'grew' : 'declined'} ${formatPct(Math.abs(trafficChange))} WoW (${traffic.toLocaleString()} detail page views)`,
    )
  }

  // In-stock health
  const inStock = getLatest(trends, 'inStockRate')
  if (inStock < 90) {
    findings.push(
      `In-stock rate at ${formatPct(inStock)} — below the ${formatPct(90)} benchmark, risking lost sales`,
    )
  }

  // Return rate
  const returnRate = getLatest(trends, 'returnRate')
  if (returnRate > 4) {
    findings.push(
      `Return rate elevated at ${formatPct(returnRate)} — investigate product quality or listing accuracy`,
    )
  }

  // Issue-driven findings
  for (const issue of issues.slice(0, 3)) {
    if (issue.evidence.length > 0) {
      findings.push(issue.evidence[0])
    }
  }

  // Ensure we have at least 3 findings
  if (findings.length < 3) {
    const convRate = getLatest(trends, 'conversionRate')
    findings.push(`Conversion rate at ${formatPct(convRate)} across ${products.length} active ASINs`)
  }

  return findings.slice(0, 6)
}

// ─── QBR Talking Points ──────────────────────────────────────

function buildQbrTalkingPoints(
  vendor: Vendor,
  products: Product[],
  trends: VendorTrends,
  issues: DiagnosticIssue[],
): string[] {
  const points: string[] = []
  const revenue = getLatest(trends, 'orderedRevenue')
  const w1Revenue = trends.metrics.orderedRevenue[0].value
  const eightWeekChange = ((revenue - w1Revenue) / w1Revenue) * 100

  // Performance trajectory
  points.push(
    `${vendor.brand} has ${eightWeekChange >= 0 ? 'grown' : 'declined'} ${formatPct(Math.abs(eightWeekChange))} in revenue over the trailing 8-week period, ${eightWeekChange >= 5 ? 'outpacing category benchmarks' : eightWeekChange >= 0 ? 'roughly in line with category' : 'underperforming relative to category expectations'}.`,
  )

  // Top wins
  const topProduct = [...products].sort((a, b) => b.orderedRevenue - a.orderedRevenue)[0]
  if (topProduct) {
    points.push(
      `Top performer: ${topProduct.title} — ${formatCurrency(topProduct.orderedRevenue)} in revenue with ${formatPct(topProduct.conversionRate)} conversion.`,
    )
  }

  // Key risks
  const criticalIssues = issues.filter(
    (i) => i.severity === 'critical' || i.severity === 'high',
  )
  if (criticalIssues.length > 0) {
    const riskAreas = [...new Set(criticalIssues.map((i) => i.category.toLowerCase()))]
    points.push(
      `Key risks to address: ${riskAreas.join(', ')}. ${criticalIssues.length} ${pluralize(criticalIssues.length, 'issue')} requiring vendor collaboration.`,
    )
  }

  // Ad investment
  const adSpend = getLatest(trends, 'adSpend')
  const adSales = getLatest(trends, 'adAttributedSales')
  const roas = adSpend > 0 ? adSales / adSpend : 0
  points.push(
    `Current ad investment: ${formatCurrency(adSpend)}/week generating ${formatCurrency(adSales)} in attributed sales (${roas.toFixed(1)}x ROAS).`,
  )

  // Forward look
  if (issues.length === 0) {
    points.push(
      `Recommend maintaining current strategy with focus on sustaining growth trajectory and optimizing top-performing ASINs.`,
    )
  } else {
    const teams = [...new Set(issues.map((i) => i.ownerTeam))]
    points.push(
      `Recommended next steps involve coordination across ${teams.join(', ')} to address the ${issues.length} identified ${pluralize(issues.length, 'issue')}.`,
    )
  }

  return points
}

// ─── Follow-up Draft ─────────────────────────────────────────

function buildFollowUpDraft(
  vendor: Vendor,
  _products: Product[],
  trends: VendorTrends,
  issues: DiagnosticIssue[],
): string {
  const revenue = getLatest(trends, 'orderedRevenue')
  const prevRevenue = getPrevious(trends, 'orderedRevenue')
  const revDelta = formatDelta(revenue, prevRevenue)

  let draft = `Hi ${vendor.brand} team,\n\n`
  draft += `Here's a summary of this week's performance and key areas for our review.\n\n`

  // Performance snapshot
  draft += `Performance Snapshot:\n`
  draft += `• Ordered revenue: ${formatCurrency(revenue)} (${revDelta} WoW)\n`
  draft += `• Ordered units: ${getLatest(trends, 'orderedUnits').toLocaleString()} (${formatDelta(getLatest(trends, 'orderedUnits'), getPrevious(trends, 'orderedUnits'))} WoW)\n`
  draft += `• Conversion rate: ${formatPct(getLatest(trends, 'conversionRate'))}\n`
  draft += `• In-stock rate: ${formatPct(getLatest(trends, 'inStockRate'))}\n\n`

  if (issues.length === 0) {
    draft += `All key metrics are tracking well. No critical issues to flag this week.\n\n`
    draft += `Let's connect during our regular review to discuss optimization opportunities for your top-performing ASINs.\n`
  } else {
    draft += `Areas Requiring Attention:\n`
    for (const issue of issues.filter(
      (i) => i.severity === 'critical' || i.severity === 'high',
    )) {
      draft += `• ${issue.title} — ${issue.evidence[0]}\n`
    }
    draft += `\n`
    draft += `I'd like to schedule time to walk through these findings and align on next steps. Are you available this week for a 30-minute review?\n`
  }

  draft += `\nBest,\n${vendor.accountManager}`

  return draft
}

// ─── Main Function ───────────────────────────────────────────

export function generateSummaries(
  vendor: Vendor,
  products: Product[],
  trends: VendorTrends,
  issues: DiagnosticIssue[],
): IntelligenceResult<Summary> {
  const vendorProducts = products.filter((p) => p.vendorId === vendor.id)

  const result: Summary = {
    executiveSummary: buildExecutiveSummary(vendor, vendorProducts, trends, issues),
    keyFindings: buildKeyFindings(vendor, vendorProducts, trends, issues),
    qbrTalkingPoints: buildQbrTalkingPoints(vendor, vendorProducts, trends, issues),
    followUpDraft: buildFollowUpDraft(vendor, vendorProducts, trends, issues),
  }

  const explanation = buildExplanation(issues)

  return { result, explanation }
}

function buildExplanation(issues: DiagnosticIssue[]): string {
  return [
    'Summaries are generated using templated text parameterized by vendor KPIs, trend data, and detected diagnostic issues.',
    '',
    'Input signals:',
    '  • Week-over-week and 8-week metric deltas (revenue, units, traffic, conversion)',
    '  • ASIN-level performance rankings (top performers, weak converters)',
    '  • Diagnostic issue severity and category clustering',
    '  • Ad spend efficiency (ROAS calculation)',
    '',
    `This summary incorporates ${issues.length} diagnostic ${pluralize(issues.length, 'issue')} into the narrative. Key findings are ordered by business impact. QBR talking points follow a structured framework: trajectory, wins, risks, investment, and forward look.`,
    '',
    'Templates adapt tone based on account health: healthy accounts emphasize growth opportunities, struggling accounts lead with risks and required actions.',
  ].join('\n')
}
