import { useMemo } from 'react'
import { useVendor } from '@/context/VendorContext'
import { runDiagnostics } from '@/lib/intelligence/diagnostics'
import { generateRecommendations } from '@/lib/intelligence/recommendations'
import { generateSummaries } from '@/lib/intelligence/summaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { GenerationExplainer } from '@/components/shared/GenerationExplainer'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
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
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${config.className}`}
      aria-label={`Status: ${config.label}. Click to change.`}
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

// ─── Compact Action Row ─────────────────────────────────────

function ActionRow({
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
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-surface-raised/50 transition-colors">
      <ActionStatusBadge
        status={status}
        onCycle={() => onStatusChange(nextStatus(status))}
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{rec.title}</span>
      </div>
      <SeverityBadge severity={rec.priority} />
      <span className={`text-xs shrink-0 tabular-nums ${overdue ? 'text-status-bad font-medium' : dueSoon ? 'text-status-warn font-medium' : 'text-muted-foreground'}`}>
        {formatDueDate(rec.dueDate)}
        {overdue && ' ✗'}
      </span>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">{group.ownerTeam}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{group.recommendations.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border -mx-3">
          {group.recommendations.map((rec) => (
            <ActionRow
              key={rec.id}
              rec={rec}
              status={actionStatuses[rec.id] ?? 'not-started'}
              onStatusChange={(status) => onStatusChange(rec.id, status)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
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
  const progressPercent = allRecs.length > 0 ? Math.round((totalComplete / allRecs.length) * 100) : 0

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

      {/* Tabs */}
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
          <div className="space-y-4 pt-2">
            {/* Progress bar — shadcn Progress */}
            {allRecs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <CheckCircle2 className="size-3.5 text-status-good" />
                    Action Progress
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {totalComplete}/{allRecs.length} complete
                  </span>
                </div>
                <Progress value={progressPercent} />
              </div>
            )}

            {/* Grouped recommendations */}
            {recommendations.result.length > 0 ? (
              <div className="space-y-4">
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
                        All KPIs for {selectedVendor.name} are within acceptable thresholds.
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
          <div className="space-y-4 pt-2">
            {/* QBR Talking Points */}
            <QbrCard title="Quarterly Business Review — Talking Points" icon={Presentation}>
              <div className="space-y-0">
                {summaries.result.qbrTalkingPoints.map((point, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 py-2.5">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">{point}</p>
                    </div>
                    {i < summaries.result.qbrTalkingPoints.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </QbrCard>

            {/* Key Findings recap */}
            <QbrCard title="Key Findings" icon={Sparkles}>
              <div className="grid gap-2 sm:grid-cols-2">
                {summaries.result.keyFindings.map((finding, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/50 px-3 py-2.5"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm text-foreground leading-snug">{finding.text}</p>
                  </div>
                ))}
              </div>
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
