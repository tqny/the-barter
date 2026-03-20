import type {
  DiagnosticIssue,
  Recommendation,
  RecommendationGroup,
  IntelligenceResult,
  OwnerTeam,
  Severity,
} from '../../data/types'

// ─── Action Templates ────────────────────────────────────────

interface ActionTemplate {
  issueCategory: string
  ownerTeam: OwnerTeam
  actions: {
    title: string
    description: string
    priority: Severity
    daysOut: number // due date offset from "today"
  }[]
}

const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    issueCategory: 'Conversion',
    ownerTeam: 'Merchandising',
    actions: [
      {
        title: 'Audit listing content on low-converting ASINs',
        description:
          'Review titles, bullet points, images, and A+ content for clarity and completeness. Identify gaps versus top competitors in the category.',
        priority: 'high',
        daysOut: 7,
      },
      {
        title: 'Review pricing competitiveness',
        description:
          'Compare current pricing against category benchmarks and direct competitors. Flag ASINs where price may be suppressing conversion.',
        priority: 'high',
        daysOut: 10,
      },
      {
        title: 'Evaluate review sentiment on affected ASINs',
        description:
          'Analyze recent customer reviews for recurring complaints that may be deterring purchase. Identify quick wins (e.g., answering common questions in bullets).',
        priority: 'moderate',
        daysOut: 14,
      },
    ],
  },
  {
    issueCategory: 'Supply Chain',
    ownerTeam: 'Supply Chain',
    actions: [
      {
        title: 'Submit replenishment POs for at-risk ASINs',
        description:
          'Prioritize PO submission for ASINs below 80% in-stock rate. Coordinate with vendor on expedited shipment if lead times allow.',
        priority: 'critical',
        daysOut: 3,
      },
      {
        title: 'Review demand forecast accuracy',
        description:
          'Compare forecast vs. actual sell-through for the last 4 weeks. Adjust future forecasts for ASINs with consistent under-ordering.',
        priority: 'high',
        daysOut: 7,
      },
      {
        title: 'Establish safety stock levels for top sellers',
        description:
          'Set minimum inventory thresholds for the top 5 revenue-generating ASINs to prevent stockouts during demand spikes.',
        priority: 'high',
        daysOut: 14,
      },
    ],
  },
  {
    issueCategory: 'Returns',
    ownerTeam: 'Operational Excellence',
    actions: [
      {
        title: 'Analyze return reason codes',
        description:
          'Pull return reason data for ASINs with elevated return rates. Categorize by root cause: product defect, listing mismatch, shipping damage, or buyer remorse.',
        priority: 'high',
        daysOut: 5,
      },
      {
        title: 'Update listing accuracy on high-return ASINs',
        description:
          'Cross-reference return reasons with listing content. If "not as described" is a top reason, update images, dimensions, and product descriptions.',
        priority: 'high',
        daysOut: 10,
      },
      {
        title: 'Implement packaging improvements for damage-prone items',
        description:
          'If shipping damage is a top return driver, work with vendor on protective packaging or prep service enrollment.',
        priority: 'moderate',
        daysOut: 21,
      },
    ],
  },
  {
    issueCategory: 'Content',
    ownerTeam: 'Merchandising',
    actions: [
      {
        title: 'Create A+ content for flagged ASINs',
        description:
          'Develop enhanced brand content (A+ pages) for ASINs with content quality scores below 75. Prioritize top-revenue ASINs first.',
        priority: 'high',
        daysOut: 14,
      },
      {
        title: 'Optimize main images and gallery',
        description:
          'Ensure all flagged ASINs have 6+ images including lifestyle shots, infographics, and size/scale references. Update main image to meet category best practices.',
        priority: 'moderate',
        daysOut: 10,
      },
      {
        title: 'Rewrite bullet points with keyword optimization',
        description:
          'Update feature bullets to include high-volume search terms while maintaining readability. Focus on benefits over features.',
        priority: 'moderate',
        daysOut: 14,
      },
    ],
  },
  {
    issueCategory: 'Advertising',
    ownerTeam: 'Marketing',
    actions: [
      {
        title: 'Pause or reduce spend on low-ROAS campaigns',
        description:
          'Identify campaigns with ROAS below 2.0x and pause or reduce daily budgets. Reallocate budget to better-performing campaigns.',
        priority: 'high',
        daysOut: 3,
      },
      {
        title: 'Optimize keyword targeting',
        description:
          'Review search term reports for inefficient campaigns. Add negative keywords for irrelevant traffic and shift budget to proven converters.',
        priority: 'high',
        daysOut: 7,
      },
      {
        title: 'Align ad strategy with in-stock status',
        description:
          'Pause advertising on ASINs with in-stock rate below 80% to avoid wasting spend on unavailable products. Resume when replenished.',
        priority: 'critical',
        daysOut: 1,
      },
    ],
  },
  {
    issueCategory: 'Traffic',
    ownerTeam: 'Marketing',
    actions: [
      {
        title: 'Increase Sponsored Products budget on top ASINs',
        description:
          'Boost visibility for top-performing ASINs by increasing SP campaign budgets 15-20%. Monitor ROAS daily for the first week.',
        priority: 'high',
        daysOut: 3,
      },
      {
        title: 'Launch Sponsored Brands campaign',
        description:
          'Create a Sponsored Brands headline campaign featuring the top 3 ASINs to drive branded search traffic and category awareness.',
        priority: 'moderate',
        daysOut: 7,
      },
      {
        title: 'Investigate organic ranking changes',
        description:
          'Check for search rank drops on high-traffic keywords. If rankings have declined, review recent listing changes, competitor activity, and review velocity.',
        priority: 'moderate',
        daysOut: 7,
      },
    ],
  },
  {
    issueCategory: 'Revenue',
    ownerTeam: 'Merchandising',
    actions: [
      {
        title: 'Identify root cause of revenue decline',
        description:
          'Decompose revenue change by ASIN to isolate whether decline is driven by traffic, conversion, price, or availability. Prioritize the largest contributors.',
        priority: 'critical',
        daysOut: 3,
      },
      {
        title: 'Develop promotional strategy for underperforming ASINs',
        description:
          'Consider Lightning Deals, coupons, or Subscribe & Save enrollment for ASINs showing the steepest revenue decline.',
        priority: 'high',
        daysOut: 7,
      },
      {
        title: 'Review competitive landscape',
        description:
          'Check for new competitor entries, price drops, or promotional activity that may be capturing share from affected ASINs.',
        priority: 'high',
        daysOut: 10,
      },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────

let idCounter = 0

function nextId(vendorId: string): string {
  return `${vendorId}-rec-${++idCounter}`
}

function formatDueDate(daysOut: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOut)
  return date.toISOString().split('T')[0]
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : singular + 's'
}

// ─── Main Function ───────────────────────────────────────────

export function generateRecommendations(
  vendorId: string,
  issues: DiagnosticIssue[],
): IntelligenceResult<RecommendationGroup[]> {
  // Reset counter for each call
  idCounter = 0

  if (issues.length === 0) {
    return {
      result: [],
      explanation:
        'No diagnostic issues detected, so no corrective recommendations are generated. The account is performing within acceptable thresholds across all monitored KPIs.',
    }
  }

  // Match issues to action templates
  const recommendations: Recommendation[] = []

  for (const issue of issues) {
    const template = ACTION_TEMPLATES.find((t) => t.issueCategory === issue.category)
    if (!template) continue

    // Select actions based on severity — more severe issues get more actions
    const actionCount = issue.severity === 'critical' ? 3 : issue.severity === 'high' ? 2 : 1

    for (const action of template.actions.slice(0, actionCount)) {
      // Avoid duplicate recommendations (same title)
      if (recommendations.some((r) => r.title === action.title)) continue

      recommendations.push({
        id: nextId(vendorId),
        title: action.title,
        description: action.description,
        ownerTeam: template.ownerTeam,
        priority: action.priority,
        dueDate: formatDueDate(action.daysOut),
        relatedIssueIds: [issue.id],
      })
    }
  }

  // Merge related issue IDs for duplicate-owner recommendations
  // (if the same recommendation was triggered by multiple issues, merge them)

  // Group by owner team
  const teamOrder: OwnerTeam[] = [
    'Marketing',
    'Merchandising',
    'Supply Chain',
    'Operational Excellence',
  ]

  const groups: RecommendationGroup[] = teamOrder
    .map((team) => ({
      ownerTeam: team,
      recommendations: recommendations
        .filter((r) => r.ownerTeam === team)
        .sort((a, b) => severityRank(a.priority) - severityRank(b.priority)),
    }))
    .filter((g) => g.recommendations.length > 0)

  const explanation = buildExplanation(issues, recommendations, groups)

  return { result: groups, explanation }
}

function severityRank(severity: Severity): number {
  const order: Record<Severity, number> = {
    critical: 0,
    high: 1,
    moderate: 2,
    low: 3,
  }
  return order[severity]
}

function buildExplanation(
  issues: DiagnosticIssue[],
  recommendations: Recommendation[],
  groups: RecommendationGroup[],
): string {
  const teamNames = groups.map((g) => g.ownerTeam)

  return [
    `Generated ${recommendations.length} ${pluralize(recommendations.length, 'recommendation')} across ${groups.length} ${pluralize(groups.length, 'team')} (${teamNames.join(', ')}).`,
    '',
    'Methodology:',
    '  • Each diagnostic issue is mapped to a predefined action template based on issue category',
    '  • Action count scales with severity: critical issues generate 3 actions, high generates 2, moderate generates 1',
    '  • Recommendations are deduplicated to avoid redundant work items',
    '  • Due dates are set based on action urgency: immediate fixes (1-3 days), near-term (7-10 days), strategic (14-21 days)',
    '',
    `Input: ${issues.length} diagnostic ${pluralize(issues.length, 'issue')} across ${[...new Set(issues.map((i) => i.category))].join(', ')}.`,
    '',
    'Recommendations are grouped by owner team to support cross-functional assignment and accountability.',
  ].join('\n')
}
