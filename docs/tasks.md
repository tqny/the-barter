# Tasks — The Barter

> Execution breakdown. Keep this current — it's the primary continuity document.

<!-- Status markers: [ ] pending, [→] in progress, [x] done -->

## Current Phase

PLAN

<!-- Update as the project progresses: BRIEF → PLAN → BUILD → POLISH -->

## Planning Tasks

- [x] Complete project brief
- [x] Run /plan-product-review (HOLD SCOPE mode — all criteria passed)
- [x] Draft spec.md
- [x] Draft architecture.md
- [x] Draft design.md (Pass 1 — structure and direction)
- [x] Draft tasks.md (this file)
- [x] Draft README.md
- [x] Update AGENTS.md for project
- [ ] Run /plan-eng-review — lock in architecture with diagrams, edge cases, build-readiness

## Build Tasks

### Phase 1: Foundation
- [ ] Project scaffolding (Vite + React 19 + TypeScript + Tailwind 4 + shadcn/ui)
- [ ] Design tokens and base styles (index.css)
- [ ] App shell — sidebar, routing, layout (AppShell, Sidebar, page routes)
- [ ] Domain types (data/types.ts — all interfaces and type definitions)
- [ ] Mock data: 5 vendor profiles (data/vendors.ts)
- [ ] Mock data: ASIN-level products per vendor (data/products.ts)
- [ ] Mock data: 8-week trend data (data/trends.ts)
- [ ] VendorProvider context (context/VendorContext.tsx)
- [ ] localStorage helpers (lib/storage.ts)
- [ ] Vendor selector with health pulse dots (components/layout/VendorPicker.tsx)

**Definition of done:** App shell renders with sidebar, vendor picker with health indicators, routing between 4 empty pages. Mock data is typed and importable.

### Phase 2: Intelligence Layer
- [ ] Diagnostics engine — rule-based issue detection (lib/intelligence/diagnostics.ts)
- [ ] Confidence scoring system (lib/intelligence/confidence.ts)
- [ ] Summary generator — templated KPI summaries (lib/intelligence/summaries.ts)
- [ ] Recommendation engine — grouped action plans (lib/intelligence/recommendations.ts)
- [ ] Text templates for all AI outputs (lib/intelligence/templates.ts)

**Definition of done:** All intelligence functions are callable with typed inputs/outputs. Given a vendor's data, they produce realistic diagnostics, summaries, and recommendations. No UI needed yet — testable as pure functions.

### Phase 3: Shared UI Components
- [ ] MetricCard component
- [ ] TrendSparkline component (Recharts)
- [ ] StatusBadge component
- [ ] DiagnosticPanel component (with ConfidenceTag)
- [ ] RecommendationGroup component
- [ ] GenerationExplainer component ("How this was generated")
- [ ] SectionHeader component

**Definition of done:** All shared components render correctly with sample props. Consistent with design tokens.

### Phase 4: Executive Overview Page
- [ ] Core scorecard — 8 metrics in MetricCard band
- [ ] 8-week trend sparklines per metric
- [ ] Top risks / top opportunities cards
- [ ] AI-generated summary panel with GenerationExplainer
- [ ] Wire up to VendorContext — responds to vendor selection

**Definition of done:** Selecting a vendor shows its full executive overview with scorecard, trends, risks/opportunities, and AI summary. Data is realistic and the summary reads as credible analysis.

### Phase 5: Catalog & Diagnostics Page
- [ ] ASIN-level data table (sortable, with inline status badges)
- [ ] Top movers and weak converters highlighting
- [ ] Inventory risk flags
- [ ] Content quality / listing issue flags
- [ ] Ad efficiency flags
- [ ] Diagnostic logic panels with confidence indicators
- [ ] GenerationExplainer on diagnostic outputs

**Definition of done:** Selecting a vendor shows its product-level diagnostics with sortable table, flags, and diagnostic panels that explain root causes with confidence levels.

### Phase 6: Growth Plan & QBR Studio Page
- [ ] Sub-tab structure (Action Plan | QBR & Communication)
- [ ] Tab A: Grouped recommendations by 4 categories
- [ ] Tab A: AI-generated action plan
- [ ] Tab A: Static action list with status badges and due dates
- [ ] Tab A: localStorage persistence for action states
- [ ] Tab B: QBR formatted card layout
- [ ] Tab B: Drafted vendor follow-up summary
- [ ] Tab B: GenerationExplainer on AI outputs

**Definition of done:** Growth Plan page has two functional tabs. Action Plan shows grouped recommendations and a persistable action list. QBR tab shows a formatted business review and follow-up draft. All AI outputs have explainability.

### Phase 7: About This Project Page
- [ ] Dedicated page with structured content
- [ ] Sections: workflow context, product focus, AI layer explanation, mocked vs. real, architecture, portfolio context
- [ ] Clean typography and formatting

**Definition of done:** About page clearly explains the project's purpose, technical approach, and portfolio value. Reads as a thoughtful embedded case study.

## Polish Tasks

- [ ] Responsive pass (desktop-first, competent at tablet/mobile breakpoints)
- [ ] Accessibility basics (focus states, ARIA labels, color contrast, keyboard nav)
- [ ] Final data believability review (do mock numbers tell coherent stories?)
- [ ] Cross-page consistency check (tokens, spacing, component usage)
- [ ] Final README.md pass
- [ ] Deploy to Vercel
- [ ] Link from portfolio site (Tony's Site projects page)

## Decisions Log

- **Scope cuts applied:** Static action list (no drag-and-drop Kanban), QBR as card layout (no full presentation mode), 8-week trends (not 12-week)
- **Page 3 structure:** Sub-tabs — "Action Plan" and "QBR & Communication"
- **Intelligence layer:** Dedicated `/lib/intelligence/` directory with clear API boundary
- **Color mode:** Light mode SaaS workspace aesthetic
- **Delight features accepted:** Vendor health pulse dots, diagnostic confidence indicators, "How this was generated" explainers
- **Delight features skipped:** Last reviewed timestamps
