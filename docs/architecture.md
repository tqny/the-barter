# Architecture — The Barter

> Technical realization of the spec. Updated after engineering review.

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19 + TypeScript | Proven in portfolio. Industry standard. |
| Styling | Tailwind CSS 4 | Fast, consistent, token-friendly. |
| Components | shadcn/ui | Professional component base. Already used in portfolio. |
| Charts | Recharts (scoped imports) | React-native, sufficient for sparklines and trend charts. Import only needed modules. |
| Build | Vite | Fast, modern, zero-config for React+TS. |
| Routing | React Router v7 | Lightweight client-side routing for 4 pages. |
| Font | @fontsource/inter (npm) | Self-hosted via npm. No CDN dependency. |
| Mock data | TypeScript modules | Type-safe, co-located, easy to shape. |
| State | React context + localStorage | No state library needed for MVP scope. |
| Deployment | Vercel | Free tier, instant deploys, preview URLs. |

No backend. No database. No auth. No state management library.

## Component Tree

```
App
├── ErrorBoundary (page-level, dev safety)
├── AppShell
│   ├── Sidebar
│   │   ├── Nav (4 links, active state via React Router)
│   │   └── VendorPicker (5 vendors + health pulse dots)
│   └── <VendorProvider>
│       └── PageRouter (React Router v7)
│           ├── /overview     → Overview
│           ├── /diagnostics  → Diagnostics
│           ├── /growth-plan  → GrowthPlan (local tab state)
│           └── /about        → About
```

## Module Structure

```
┌──────────────────────────────────────────────────────┐
│                     App Shell                         │
│  ┌─────────┐  ┌───────────────────────────────────┐  │
│  │ Sidebar  │  │          <VendorProvider>          │  │
│  │  - Nav   │  │   ┌───────────────────────────┐   │  │
│  │  - Vendor│  │   │      Page Router          │   │  │
│  │  Picker  │  │   │                           │   │  │
│  │  (health │  │   │  /overview                │   │  │
│  │  pulses) │  │   │  /diagnostics             │   │  │
│  │          │  │   │  /growth-plan             │   │  │
│  │          │  │   │  /about                   │   │  │
│  └─────────┘  │   └───────────────────────────┘   │  │
│               └───────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
        │                      │
        ▼                      ▼
┌────────────────┐    ┌─────────────────────────┐
│   Data Layer   │    │  Intelligence Layer      │
│   /data/       │    │  /lib/intelligence/      │
│                │    │  (pure functions)         │
│  vendors.ts    │──►│                           │
│  products.ts   │    │  diagnostics.ts           │
│  trends.ts     │    │  summaries.ts             │
│  types.ts      │    │  recommendations.ts       │
│                │    │                           │
│  /lib/         │    │  Returns { result,        │
│  storage.ts    │    │    explanation } pairs     │
└────────────────┘    └─────────────────────────┘
```

### Module Responsibilities

**App Shell**
- Sidebar navigation with active state
- Vendor selector with health pulse dots (green/amber/red)
- VendorProvider context (selected vendor + derived data + action list state)
- Page routing
- Page-level ErrorBoundary for dev safety

**Data Layer (`/data/`)**
- Type definitions for all domain models
- Mock vendor profiles (5 vendors)
- Mock ASIN-level product data (max 20 per vendor — no pagination/virtualization needed)
- Mock 8-week trend data (per metric, per vendor and per ASIN)
- All data is static TypeScript — no runtime fetching

**Intelligence Layer (`/lib/intelligence/`)**
- `diagnostics.ts` — Rule-based issue detection from KPI patterns. Includes confidence scoring (corroborating signal count → High / Moderate tag). Inputs: vendor data + product data + trends. Outputs: `{ result: DiagnosticIssue[], explanation: string }`.
- `summaries.ts` — Templated plain-English summaries keyed to detected issue clusters. Includes text templates parameterized by vendor data and detected issues. Outputs: `{ result: Summary, explanation: string }` for executive summary, diagnostic explanations, QBR talking points, follow-up drafts.
- `recommendations.ts` — Maps detected issues to grouped action plans by owner team (Marketing, Merchandising, Supply Chain, Operational Excellence). Outputs: `{ result: RecommendationGroup[], explanation: string }`.

All intelligence functions return `{ result, explanation }` pairs. The `explanation` field describes the KPI patterns and thresholds used, consumed by GenerationExplainer components.

**VendorContext (`/context/VendorContext.tsx`)**
- Selected vendor state (auto-selects first vendor on load)
- Derived vendor data (products, trends)
- Action list state (initialized from localStorage, synced on change)
- Setter functions

**Storage (`/lib/storage.ts`)**
- localStorage helpers for: selected vendor, action list states
- Typed read/write wrappers

**Pages**
- Each page is a self-contained route component
- Pages consume vendor data through the VendorProvider context
- Pages call intelligence layer functions via `useMemo` keyed on `selectedVendorId`
- No page imports another page's components
- Growth Plan uses local `useState` for sub-tab selection (persists across vendor changes)

**Shared UI (`/components/ui/` + `/components/shared/`)**
- shadcn/ui base components in `/components/ui/`
- Domain-specific shared components in `/components/shared/` — extracted from pages as patterns emerge (not built in isolation upfront)

## File / Folder Layout

```
the-barter/
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css                    # Tailwind base + @theme + design tokens
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── shared/                  # Domain-specific reusable components
│   │   │   └── (extracted during page build — not pre-built)
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── VendorPicker.tsx
│   │       └── AppShell.tsx
│   │
│   ├── pages/
│   │   ├── Overview.tsx
│   │   ├── Diagnostics.tsx
│   │   ├── GrowthPlan.tsx           # Local tab state (Action Plan | QBR)
│   │   └── About.tsx
│   │
│   ├── data/
│   │   ├── types.ts                 # All domain type definitions
│   │   ├── vendors.ts               # 5 vendor profiles
│   │   ├── products.ts              # ASIN-level data per vendor (max 20 per vendor)
│   │   └── trends.ts                # 8-week trend data
│   │
│   ├── lib/
│   │   ├── intelligence/
│   │   │   ├── diagnostics.ts       # Issue detection + confidence scoring
│   │   │   ├── summaries.ts         # Templated summaries + text templates
│   │   │   └── recommendations.ts   # Grouped action plans
│   │   └── storage.ts
│   │
│   └── context/
│       └── VendorContext.tsx
│
├── docs/
│   ├── spec.md
│   ├── architecture.md
│   ├── tasks.md
│   └── design.md
│
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── vercel.json (if needed)
```

## Data Flow

```
Static Mock Data (TS modules)
       │
       ▼
VendorProvider (React context)
  └── selectedVendorId    (state, auto-selects first vendor)
  └── selectedVendor      (derived)
  └── vendorProducts      (derived)
  └── vendorTrends        (derived)
  └── actionListState     (state, synced to localStorage)
       │
       ├──► Scorecard + Sparklines ──► Executive Overview
       │
       ├──► diagnostics() ─────────► Catalog & Diagnostics
       │    (includes confidence)       └── DiagnosticPanel + ConfidenceTag
       │                                └── "No issues detected" for healthy vendors
       │
       ├──► summaries() ──────────► AI Summary (Overview)
       │                           ► QBR Talking Points (Growth Plan Tab B)
       │                           ► Follow-up Draft (Growth Plan Tab B)
       │
       └──► recommendations() ────► Grouped Actions (Growth Plan Tab A)
            └── Action List state ──► VendorContext ↔ localStorage

All intelligence calls: useMemo keyed on [selectedVendorId]
All intelligence returns: { result, explanation } pairs → GenerationExplainer
```

## Dependency Graph

```
Pages ──────► VendorContext ──────► Data Layer (types, vendors, products, trends)
  │                                      ▲
  ├──────► Intelligence Layer ───────────┘
  │           (pure functions, no UI deps)
  ├──────► Shared Components ──────► shadcn/ui primitives
  │
  └──────► storage.ts (localStorage, accessed via VendorContext)

Isolation rules:
  ✓ Intelligence Layer → Data Layer (types only, no UI)
  ✓ Pages → everything, but not other pages
  ✓ Shared Components → shadcn/ui only
  ✓ Data Layer → nothing (leaf node)
  ✓ localStorage access only through VendorContext (backed by storage.ts)
```

## Design Token Strategy

CSS custom properties defined in `index.css`, registered in Tailwind 4's `@theme` directive. This enables native utility classes (`bg-surface`, `text-primary`, etc.) without arbitrary value syntax.

```
index.css:
  :root { --surface: #F9FAFB; --primary: #2563EB; ... }

@theme:
  --color-surface: var(--surface);
  --color-primary: var(--primary);
  ...

Usage in components:
  className="bg-surface text-primary"  ← native Tailwind utilities
```

## External Dependencies

| Dependency | Purpose | Risk |
|-----------|---------|------|
| React 19 | UI framework | None — stable, standard |
| TypeScript | Type safety | None |
| Tailwind CSS 4 | Utility-first styling | None |
| shadcn/ui | Component primitives | Low — copy-paste model, no version lock |
| Recharts | Sparklines and trend charts (scoped imports) | Low — tree-shaken to ~80-120KB |
| React Router v7 | Client-side routing | Low — 4 routes |
| @fontsource/inter | Self-hosted Inter font | None — npm package, no CDN |
| Vite | Build tool | None — standard |

No external APIs. No runtime dependencies beyond the UI stack.

## Boundaries and Swap Points

**Swap points (designed for future extensibility without refactoring):**

1. **Data Layer → API**: Mock TypeScript modules can be replaced with API fetch calls. The VendorProvider interface stays the same — pages don't care where data comes from.

2. **Intelligence Layer → LLM API**: Template-based summaries can be replaced with real LLM calls. The function signatures stay the same — callers get back typed `{ result, explanation }` objects regardless of whether they were templated or AI-generated.

3. **localStorage → Database**: Storage helpers can be swapped to API-backed persistence. The VendorContext interface is already abstracted.

4. **Static action list → Interactive Kanban**: The action list component can be replaced with a drag-and-drop board without touching the recommendation engine.

**Isolation rules:**
- Pages never import from other pages
- Intelligence layer has no UI dependencies (pure functions only)
- Data layer has no intelligence layer dependencies
- Shared components have no page-level dependencies
- localStorage access only through VendorContext (backed by `/lib/storage.ts`)

## Constraints

- Max 20 ASINs per vendor — no pagination or virtualization needed for ASIN table
- Max 5 vendors — no search or filtering needed for vendor picker
- 8 weeks of trend data — fixed window, no date range selection
- Growth Plan sub-tabs use local state (not URL routes)
- First vendor auto-selected on load — no empty/unselected state
- "No issues detected" message for vendors with no diagnostic flags
