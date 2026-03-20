# Tasks — The Barter

> Execution breakdown. Keep this current — it's the primary continuity document.

<!-- Status markers: [ ] pending, [→] in progress, [x] done -->

## Current Phase

BUILD

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
- [x] Run /plan-eng-review — architecture locked with diagrams, edge cases, build-readiness

## Build Tasks

### Phase 1: Foundation

- [x] Project scaffolding (Vite + React 19 + TypeScript + Tailwind 4 + shadcn/ui + @fontsource/inter)
- [x] Design tokens in index.css (CSS custom properties + Tailwind 4 @theme directive)
- [x] App shell — shadcn SidebarProvider + SidebarInset layout with collapsible icon mode
- [x] Page-level ErrorBoundary component
- [x] Domain types (data/types.ts — all interfaces and type definitions, including intelligence output types with { result, explanation } pattern)
- [x] Mock data: 5 vendor profiles (data/vendors.ts)
- [x] Mock data: ASIN-level products per vendor (data/products.ts — max 20 per vendor)
- [x] Mock data: 8-week trend data (data/trends.ts)
- [x] VendorProvider context (context/VendorContext.tsx — selected vendor, derived data, action list state synced to localStorage, auto-selects first vendor)
- [x] localStorage helpers (lib/storage.ts — typed read/write wrappers)
- [x] Vendor selector with health pulse dots (components/layout/VendorPicker.tsx)
- [x] Reference blocks installed: dashboard-01, @shadcnblocks/dashboard3
- [x] shadcn/ui skill installed (.claude/skills/shadcn)

**Definition of done:** App shell renders with sidebar, vendor picker with health indicators, routing between 4 empty pages. First vendor auto-selected. Mock data is typed and importable. Design tokens work as Tailwind utility classes (bg-surface, text-primary, etc.).

### Phase 2: Intelligence Layer

- [x] Diagnostics engine + confidence scoring (lib/intelligence/diagnostics.ts) — rule-based issue detection from KPI patterns, corroborating signal count → High/Moderate confidence. Returns { result: DiagnosticIssue[], explanation }
- [x] Summary generator + text templates (lib/intelligence/summaries.ts) — templated plain-English summaries keyed to issue clusters. Returns { result: Summary, explanation }
- [x] Recommendation engine (lib/intelligence/recommendations.ts) — maps issues to grouped action plans by owner team. Returns { result: RecommendationGroup[], explanation }

**Definition of done:** All 3 intelligence functions are callable with typed inputs/outputs. Given a vendor's data, they produce realistic diagnostics, summaries, and recommendations with explanation metadata. Testable as pure functions.

### Phase 3: Executive Overview Page

Build the most representative page first — establishes the shared component vocabulary.

- [x] Core scorecard — 8 metrics in MetricCard band (built inline in Overview.tsx)
- [x] 8-week trend sparklines per metric (Recharts 3 — LineChart, Line, ResponsiveContainer, YAxis)
- [x] StatusBadge for delta indicators (built inline in Overview.tsx)
- [x] Top risks / top opportunities cards with SeverityBadge
- [x] AI-generated summary panel with GenerationExplainer (built inline in Overview.tsx)
- [x] SectionHeader component (built inline in Overview.tsx)
- [x] Wire up to VendorContext — responds to vendor selection via useMemo

**Definition of done:** Selecting a vendor shows its full executive overview with scorecard, trends, risks/opportunities, and AI summary. "How this was generated" expands to show intelligence methodology. Data is realistic and the summary reads as credible analysis.

### Phase 4: Catalog & Diagnostics Page

- [x] ASIN-level data table (sortable by column headers, max 20 rows — no pagination)
- [x] Inline StatusBadge per row for flags (Low CVR, Low Stock, High Returns, Content, Ad ROAS)
- [x] Top movers and weak converters highlighting (ProductTag component)
- [x] Inventory risk flags (color-coded in-stock % cells)
- [x] Content quality / listing issue flags (color-coded content score cells)
- [x] Ad efficiency flags (ROAS sub-label per row, color-coded)
- [x] DiagnosticPanel with ConfidenceTag (built in Diagnostics.tsx)
- [x] "No issues detected" message for healthy vendors
- [x] GenerationExplainer on diagnostic outputs
- [x] Extracted shared components: GenerationExplainer, SeverityBadge, SectionHeader → components/shared/

**Definition of done:** Selecting a vendor shows its product-level diagnostics with sortable table, flags, and diagnostic panels that explain root causes with confidence levels. Healthy vendors show "No issues detected" message.

### Phase 5: Growth Plan & QBR Studio Page

- [x] Local tab state (defaultValue) — Action Plan | QBR & Communication (tab persists across vendor changes)
- [x] Tab A: Grouped recommendations by 4 categories (Marketing, Merchandising, Supply Chain, Operational Excellence)
- [x] Tab A: AI-generated action plan with GenerationExplainer
- [x] Tab A: Static action list with clickable status badges (cycles: Not Started → In Progress → Completed → Overdue), due dates, and progress bar (read/write action state from VendorContext → localStorage)
- [x] Tab B: QBR formatted card layout with numbered talking points
- [x] Tab B: Key findings recap + drafted vendor follow-up email
- [x] Tab B: GenerationExplainer on AI outputs

**Definition of done:** Growth Plan page has two functional tabs. Action Plan shows grouped recommendations and a persistable action list. QBR tab shows a formatted business review and follow-up draft. All AI outputs have explainability. Switching vendors refreshes content but keeps current tab.

### Phase 6: About This Project Page

- [x] Dedicated page with structured content (6 card sections, max-w-3xl)
- [x] Sections: workflow context, product focus, AI layer explanation, mocked vs. real, architecture, portfolio context
- [x] Clean typography and formatting (numbered lists, side-by-side mocked/real comparison, ASCII dependency diagram, portfolio link)

**Definition of done:** About page clearly explains the project's purpose, technical approach, and portfolio value. Reads as a thoughtful embedded case study.

## Polish Tasks

- [ ] Responsive pass (desktop-first, competent at tablet/mobile breakpoints — 375px, 768px, 1280px)
- [ ] Accessibility basics (focus states, ARIA labels, color contrast, keyboard nav for primary flows)
- [ ] Final data believability review (do mock numbers tell coherent stories?)
- [ ] Cross-page consistency check (tokens, spacing, component usage)
- [ ] Console clean check (no errors, no stray logs)
- [ ] Final README.md pass
- [ ] Deploy to Vercel
- [ ] Link from portfolio site (Tony's Site projects page)

## Decisions Log

- **Scope cuts applied:** Static action list (no drag-and-drop Kanban), QBR as card layout (no full presentation mode), 8-week trends (not 12-week)
- **Page 3 structure:** Sub-tabs — "Action Plan" and "QBR & Communication" (local useState, not URL routes)
- **Intelligence layer:** 3 files in `/lib/intelligence/` (diagnostics, summaries, recommendations). Confidence scoring merged into diagnostics. Templates merged into summaries.
- **Intelligence outputs:** All functions return `{ result, explanation }` pairs for GenerationExplainer consumption
- **Color mode:** Light mode SaaS workspace aesthetic
- **Design tokens:** CSS custom properties in index.css + Tailwind 4 @theme directive for native utility classes
- **Font:** @fontsource/inter via npm (self-hosted, no CDN)
- **State management:** Action list state lifted into VendorContext (synced to localStorage). First vendor auto-selected on load.
- **Build order:** Page-first extraction — shared components extracted from pages as patterns emerge, not pre-built in isolation
- **Table constraints:** Max 20 ASINs per vendor, no pagination or virtualization
- **Empty states:** "No issues detected" message for healthy vendors. No loading/empty states needed (static data).
- **Error handling:** Page-level ErrorBoundary for dev safety
- **Memoization:** Intelligence calls wrapped in useMemo keyed on selectedVendorId
- **Charts:** Recharts with scoped imports only (tree-shaken to ~80-120KB)
- **Sidebar:** Rebuilt with shadcn SidebarProvider system (collapsible icon mode, mobile Sheet drawer, Cmd+B toggle, cookie-persisted state)
- **Reference blocks:** dashboard-01 and @shadcnblocks/dashboard3 installed as component/pattern references (excluded from tsc build)
- **Delight features accepted:** Vendor health pulse dots, diagnostic confidence indicators, "How this was generated" explainers
- **Delight features skipped:** Last reviewed timestamps
- **Recharts upgrade:** Upgraded from v2 to v3 for React 19 compatibility (v2 had `useRef` hook errors)
- **Overview component strategy:** All components (MetricCard, TrendSparkline, StatusBadge, SeverityBadge, IssueCard, GenerationExplainer, SectionHeader) built inline in Overview.tsx — will extract to shared/ when reused by other pages
- **Diagnostics thresholds:** Conversion <6%, In-stock <88%, Return rate >4%, Content quality <75/100, Ad ROAS <3x, Traffic/revenue decline >5%
- **Risks vs Opportunities split:** Critical+High severity → Top Risks section; Moderate+Low → Opportunities section
