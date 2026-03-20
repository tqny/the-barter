import { useMemo } from 'react'
import { useVendor } from '@/context/VendorContext'
import { runDiagnostics } from '@/lib/intelligence/diagnostics'
import { generateRecommendations } from '@/lib/intelligence/recommendations'
import { generateSummaries } from '@/lib/intelligence/summaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GenerationExplainer } from '@/components/shared/GenerationExplainer'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { SectionHeader } from '@/components/shared/SectionHeader'
import {
  ClipboardList,
  Presentation,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Users,
  MessageSquareText,
  BarChart3,
  Sparkles,
  Mail,
} from 'lucide-react'
import type { ActionStatus, Recommendation, RecommendationGroup, OwnerTeam } from '@/data/types'

// ─── Status Badge ───────────────────────────────────────────

const STATUS_CONFIG: Record<ActionStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  'not-started': { label: 'Not Started', icon: Circle, className: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, className: 'text-status-info' },
  'completed': { label: 'Completed', icon: CheckCircle2, className: 'text-status-good' },
  'overdue': { label: 'Overdue', icon: AlertCircle, className: 'text-status-bad' },
}

function ActionStatusBadge({
  status,
  onCycle,
}: {
  status: ActionStatus
  onCycle: () => void
}) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={onCycle}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-surface-raised ${config.className}`}
      title="Click to change status"
    >
      <Icon className="size-3.5" />
      {config.label}
    </button>
  )
}

const STATUS_CYCLE: ActionStatus[] = ['not-started', 'in-progress', 'completed', 'overdue']

function nextStatus(current: ActionStatus): ActionStatus {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

// ─── Team Icon ──────────────────────────────────────────────

const TEAM_ICONS: Record<OwnerTeam, React.ComponentType<{ className?: string }>> = {
  Marketing: BarChart3,
  Merchandising: ClipboardList,
  'Supply Chain': Clock,
  'Operational Excellence': Users,
}

// ─── Due Date Formatting ────────────────────────────────────

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isDueSoon(dateStr: string): boolean {
  const due = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 3 && diff >= 0
}

function isOverdue(dateStr: string): boolean {
  const due = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return due < now
}

// ─── Action Item Row ────────────────────────────────────────

function ActionItemRow({
  rec,
  status,
  onStatusChange,
}: {
  rec: Recommendation
  status: ActionStatus
  onStatusChange: (status: ActionStatus) => void
}) {
  const dueSoon = isDueSoon(rec.dueDate)
  const overdue = isOverdue(rec.dueDate)

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{rec.title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
          </div>
          <SeverityBadge severity={rec.priority} />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <ActionStatusBadge
            status={status}
            onCycle={() => onStatusChange(nextStatus(status))}
          />
          <span className={`text-xs ${overdue ? 'text-status-bad font-medium' : dueSoon ? 'text-status-warn font-medium' : 'text-muted-foreground'}`}>
            Due {formatDueDate(rec.dueDate)}
            {overdue && ' (overdue)'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Recommendation Group Section ───────────────────────────

function RecommendationGroupSection({
  group,
  actionStatuses,
  onStatusChange,
}: {
  group: RecommendationGroup
  actionStatuses: Record<string, ActionStatus>
  onStatusChange: (recId: string, status: ActionStatus) => void
}) {
  const Icon = TEAM_ICONS[group.ownerTeam]
  const completedCount = group.recommendations.filter(
    (r) => actionStatuses[r.id] === 'completed',
  ).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">{group.ownerTeam}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{group.recommendations.length} complete
        </span>
      </div>
      <div className="space-y-2">
        {group.recommendations.map((rec) => (
          <ActionItemRow
            key={rec.id}
            rec={rec}
            status={actionStatuses[rec.id] ?? 'not-started'}
            onStatusChange={(status) => onStatusChange(rec.id, status)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── QBR Card ───────────────────────────────────────────────

function QbrCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Growth Plan Page ───────────────────────────────────────

export function GrowthPlan() {
  const { selectedVendor, vendorProducts, vendorTrends, actionItems, setVendorActions } = useVendor()

  const diagnostics = useMemo(() => {
    if (!vendorTrends) return null
    return runDiagnostics(selectedVendor.id, vendorProducts, vendorTrends)
  }, [selectedVendor.id, vendorProducts, vendorTrends])

  const recommendations = useMemo(() => {
    if (!diagnostics) return null
    return generateRecommendations(selectedVendor.id, diagnostics.result)
  }, [selectedVendor.id, diagnostics])

  const summaries = useMemo(() => {
    if (!vendorTrends || !diagnostics) return null
    return generateSummaries(selectedVendor, vendorProducts, vendorTrends, diagnostics.result)
  }, [selectedVendor, vendorProducts, vendorTrends, diagnostics])

  if (!vendorTrends || !diagnostics || !recommendations || !summaries) return null

  // Build action status map from VendorContext
  const vendorActions = actionItems[selectedVendor.id] ?? []
  const actionStatuses: Record<string, ActionStatus> = {}
  for (const item of vendorActions) {
    actionStatuses[item.recommendationId] = item.status
  }

  function handleStatusChange(recId: string, newStatus: ActionStatus) {
    const existing = actionItems[selectedVendor.id] ?? []
    const updated = existing.filter((a) => a.recommendationId !== recId)
    updated.push({ recommendationId: recId, status: newStatus })
    setVendorActions(selectedVendor.id, updated)
  }

  const allRecs = recommendations.result.flatMap((g) => g.recommendations)
  const totalComplete = allRecs.filter((r) => actionStatuses[r.id] === 'completed').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Growth Plan & QBR Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Action planning and business reviews for{' '}
          <span className="font-medium text-foreground">{selectedVendor.name}</span>
        </p>
      </div>

      {/* Tabs — defaultValue keeps tab across vendor switches */}
      <Tabs defaultValue="action-plan">
        <TabsList>
          <TabsTrigger value="action-plan">
            <ClipboardList className="size-3.5" />
            Action Plan
          </TabsTrigger>
          <TabsTrigger value="qbr">
            <Presentation className="size-3.5" />
            QBR & Communication
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab A: Action Plan ─── */}
        <TabsContent value="action-plan">
          <div className="space-y-6 pt-2">
            {/* Progress summary */}
            {allRecs.length > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-status-good" />
                  <span className="text-sm font-medium text-foreground">
                    {totalComplete} of {allRecs.length} actions complete
                  </span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-surface-raised overflow-hidden">
                  <div
                    className="h-full rounded-full bg-status-good transition-all"
                    style={{ width: `${allRecs.length > 0 ? (totalComplete / allRecs.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Grouped recommendations */}
            {recommendations.result.length > 0 ? (
              <div className="space-y-6">
                {recommendations.result.map((group) => (
                  <RecommendationGroupSection
                    key={group.ownerTeam}
                    group={group}
                    actionStatuses={actionStatuses}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <Card size="sm">
                <CardContent>
                  <div className="flex items-center gap-3 py-2">
                    <CheckCircle2 className="size-5 text-status-good shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">No action items needed</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        All KPIs for {selectedVendor.name} are within acceptable thresholds. No corrective actions recommended.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <GenerationExplainer explanation={recommendations.explanation} />
          </div>
        </TabsContent>

        {/* ─── Tab B: QBR & Communication ─── */}
        <TabsContent value="qbr">
          <div className="space-y-6 pt-2">
            {/* QBR Talking Points */}
            <QbrCard title="Quarterly Business Review — Talking Points" icon={Presentation}>
              <ol className="space-y-3">
                {summaries.result.qbrTalkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{point}</p>
                  </li>
                ))}
              </ol>
            </QbrCard>

            {/* Key Findings recap */}
            <QbrCard title="Key Findings" icon={Sparkles}>
              <ul className="space-y-2">
                {summaries.result.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {finding}
                  </li>
                ))}
              </ul>
            </QbrCard>

            {/* Follow-up Draft */}
            <QbrCard title="Vendor Follow-Up Draft" icon={Mail}>
              <div className="rounded-lg border border-border bg-surface p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {summaries.result.followUpDraft}
                </pre>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <MessageSquareText className="inline size-3 mr-1" />
                Draft generated from vendor KPIs and diagnostic findings. Review and personalize before sending.
              </p>
            </QbrCard>

            <GenerationExplainer explanation={summaries.explanation} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
