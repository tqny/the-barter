import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Target,
  Sparkles,
  Layers,
  GitBranch,
  Briefcase,
} from 'lucide-react'

// ─── Section Component ──────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
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
      <CardContent className="space-y-3 text-sm text-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  )
}

// ─── About Page ─────────────────────────────────────────────

export function About() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">About This Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What this project simulates, how the AI layer works, and why it was built
        </p>
      </div>

      {/* Workflow Context */}
      <Section icon={Users} title="The Real-World Workflow">
        <p>
          Customer Success Managers in retail and e-commerce marketplaces manage portfolios of vendor accounts.
          Their daily work involves reviewing performance across catalog health, traffic, conversion, advertising
          efficiency, and supply chain — then translating those findings into action plans and business reviews
          that drive vendor growth.
        </p>
        <p>
          This cycle — <strong>Review → Diagnose → Prioritize → Communicate → Track Execution</strong> — is
          the core loop that The Barter simulates. Each page in the app maps to a stage of that workflow,
          from the executive overview through diagnostics to growth planning and QBR preparation.
        </p>
      </Section>

      {/* Product Focus */}
      <Section icon={Target} title="Why Diagnosis and Decision Support">
        <p>
          Most vendor management dashboards stop at data display — charts and tables that leave the CSM
          to do all the interpretation. The Barter goes further by adding a decision-support layer:
          automated issue detection, root cause explanation, confidence scoring, and structured recommendations.
        </p>
        <p>
          The goal is not to replace the CSM's judgment, but to accelerate it. The tool surfaces what matters,
          explains why it matters, and suggests what to do about it — so the CSM can spend more time on
          vendor relationships and strategic decisions, and less time on manual metric review.
        </p>
      </Section>

      {/* AI Layer */}
      <Section icon={Sparkles} title="How the AI Layer Works">
        <p>
          The intelligence layer uses <strong>rule-based pattern matching</strong> against KPI thresholds
          and cross-metric correlations, combined with <strong>templated text generation</strong> parameterized
          by detected issues and vendor data. This is not freeform LLM generation — every output is grounded
          in structured business logic.
        </p>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Three intelligence functions</p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span><strong>Diagnostics</strong> — Detects issues across conversion, inventory, returns, content quality, ad efficiency, and traffic/revenue trends. Scores confidence based on corroborating evidence count.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span><strong>Summaries</strong> — Generates executive summaries, key findings, QBR talking points, and vendor follow-up drafts using templates keyed to detected issue clusters.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span><strong>Recommendations</strong> — Maps diagnostic issues to grouped action plans by owner team, with priority levels and due dates scaled to severity.</span>
            </li>
          </ul>
        </div>
        <p>
          Every AI output includes a <strong>"How this was generated"</strong> explainer that describes
          the thresholds, patterns, and methodology used — making the system transparent and auditable.
        </p>
      </Section>

      {/* Mocked vs Real */}
      <Section icon={Layers} title="What's Mocked vs. What Would Be Real">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mocked in this version</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 5 vendor profiles with fictional brands</li>
              <li>• ASIN-level product data (10–15 per vendor)</li>
              <li>• 8-week trend data per metric</li>
              <li>• Static TypeScript modules (no API calls)</li>
              <li>• localStorage for action state persistence</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">In a production version</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Live marketplace API integrations</li>
              <li>• Database-backed vendor and product data</li>
              <li>• Real-time KPI ingestion and alerting</li>
              <li>• LLM-powered summary generation</li>
              <li>• Multi-user auth with role-based access</li>
              <li>• Email integration for vendor follow-ups</li>
            </ul>
          </div>
        </div>
        <p className="text-muted-foreground">
          The architecture is designed with clear swap points: the data layer, intelligence layer, and
          storage layer can each be replaced independently without changing the page components.
        </p>
      </Section>

      {/* Architecture */}
      <Section icon={GitBranch} title="Architecture">
        <div className="rounded-lg border border-border bg-surface p-3 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre className="whitespace-pre text-muted-foreground">{`Pages ──► VendorContext ──► Data Layer (types, vendors, products, trends)
  │                              ▲
  ├──► Intelligence Layer ───────┘
  │     (pure functions, no UI deps)
  ├──► Shared Components ──► shadcn/ui primitives
  │
  └──► storage.ts (localStorage via VendorContext)`}</pre>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Stack</p>
            <p className="text-sm text-muted-foreground">
              React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Recharts · Vite · Vercel
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Key boundaries</p>
            <p className="text-sm text-muted-foreground">
              Intelligence layer is pure functions with no UI dependencies. Pages never import from other pages.
              Data layer is a leaf node with no upstream dependencies.
            </p>
          </div>
        </div>
      </Section>

      {/* Portfolio Context */}
      <Section icon={Briefcase} title="Portfolio Context">
        <p>
          The Barter is part of{' '}
          <a
            href="https://tqny.github.io/Tony-s-Site/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Tony Mikityuk's portfolio
          </a>
          . It demonstrates three things a hiring manager should take away:
        </p>
        <ol className="space-y-2 pl-1">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
            <span><strong>Domain expertise</strong> — Understanding how a retail/e-commerce CSM actually diagnoses vendor performance and translates metrics into action.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
            <span><strong>Workflow design</strong> — Ability to design tools that support judgment, prioritization, and communication — not just dashboard viewing.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
            <span><strong>AI judgment</strong> — Practical instincts for where AI can improve speed and clarity in a customer-facing operational role, with appropriate grounding and explainability.</span>
          </li>
        </ol>
        <p className="text-muted-foreground text-xs mt-2">
          Built with AI-assisted development workflows using Claude Code.
        </p>
      </Section>
    </div>
  )
}
