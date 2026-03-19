# Architecture — The Barter

> Technical realization of the spec.

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19 + TypeScript | Proven in portfolio (Brand Protection project). Industry standard. |
| Styling | Tailwind CSS 4 | Fast, consistent, token-friendly. |
| Components | shadcn/ui | Professional component base. Already used in portfolio. |
| Charts | Recharts | React-native, sufficient for sparklines and trend charts. |
| Build | Vite | Fast, modern, zero-config for React+TS. |
| Routing | React Router v7 | Lightweight client-side routing for 4 pages. |
| Mock data | TypeScript modules | Type-safe, co-located, easy to shape. |
| State | React context + localStorage | No state library needed for MVP scope. |
| Deployment | Vercel | Free tier, instant deploys, preview URLs. |

No backend. No database. No auth. No state management library.

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
│                │    │  confidence.ts             │
│  /lib/         │    │  templates.ts             │
│  storage.ts    │    │                           │
└────────────────┘    └─────────────────────────┘
```

### Module Responsibilities

**App Shell**
- Sidebar navigation with active state
- Vendor selector with health pulse dots (green/amber/red)
- VendorProvider context (selected vendor + derived data)
- Page routing

**Data Layer (`/data/`)**
- Type definitions for all domain models
- Mock vendor profiles (5 vendors)
- Mock ASIN-level product data (~10-20 per vendor)
- Mock 8-week trend data (per metric, per vendor and per ASIN)
- All data is static TypeScript — no runtime fetching

**Intelligence Layer (`/lib/intelligence/`)**
- `diagnostics.ts` — Rule-based issue detection from KPI patterns. Inputs: vendor data + product data + trends. Outputs: typed issue objects with category, severity, evidence, and confidence score.
- `summaries.ts` — Templated plain-English summaries keyed to detected issue clusters. Outputs: executive summary, diagnostic explanations, QBR talking points.
- `recommendations.ts` — Maps detected issues to grouped action plans by owner team (Marketing, Merchandising, Supply Chain, Operational Excellence). Outputs: prioritized recommendation objects.
- `confidence.ts` — Scores diagnosis confidence based on corroborating signal count. Outputs: High / Moderate tag + supporting evidence list.
- `templates.ts` — Text templates for AI-generated outputs (summaries, follow-ups, QBR sections). Parameterized by vendor data and detected issues.

**Storage (`/lib/storage.ts`)**
- localStorage helpers for: selected vendor, action list states, generated plan persistence
- Typed read/write wrappers

**Pages**
- Each page is a self-contained route component
- Pages consume vendor data through the VendorProvider context
- Pages call intelligence layer functions to derive insights
- No page imports another page's components

**Shared UI (`/components/ui/` + `/components/shared/`)**
- shadcn/ui base components in `/components/ui/`
- Domain-specific shared components in `/components/shared/`: MetricCard, TrendSparkline, StatusBadge, DiagnosticPanel, RecommendationGroup, ConfidenceTag, GenerationExplainer, SectionHeader

## File / Folder Layout

```
the-barter/
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css                    # Tailwind base + custom tokens
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── shared/                  # Domain-specific reusable components
│   │   │   ├── MetricCard.tsx
│   │   │   ├── TrendSparkline.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── DiagnosticPanel.tsx
│   │   │   ├── RecommendationGroup.tsx
│   │   │   ├── ConfidenceTag.tsx
│   │   │   ├── GenerationExplainer.tsx
│   │   │   └── SectionHeader.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── VendorPicker.tsx
│   │       └── AppShell.tsx
│   │
│   ├── pages/
│   │   ├── Overview.tsx
│   │   ├── Diagnostics.tsx
│   │   ├── GrowthPlan.tsx           # Contains sub-tab routing
│   │   └── About.tsx
│   │
│   ├── data/
│   │   ├── types.ts                 # All domain type definitions
│   │   ├── vendors.ts               # 5 vendor profiles
│   │   ├── products.ts              # ASIN-level data per vendor
│   │   └── trends.ts                # 8-week trend data
│   │
│   ├── lib/
│   │   ├── intelligence/
│   │   │   ├── diagnostics.ts
│   │   │   ├── summaries.ts
│   │   │   ├── recommendations.ts
│   │   │   ├── confidence.ts
│   │   │   └── templates.ts
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
├── tailwind.config.ts
├── .gitignore
└── vercel.json (if needed)
```

## Data Flow

```
Static Mock Data (TS modules)
       │
       ▼
VendorProvider (React context)
  └── selectedVendor
  └── vendorProducts
  └── vendorTrends
       │
       ├──► Scorecard + Sparklines ──► Executive Overview
       │
       ├──► diagnostics.ts ──────────► Catalog & Diagnostics
       │    └── confidence.ts            └── DiagnosticPanel + ConfidenceTag
       │
       ├──► summaries.ts ───────────► AI Summary (Overview)
       │                             ► QBR Talking Points (Growth Plan)
       │                             ► Follow-up Draft (Growth Plan)
       │
       └──► recommendations.ts ─────► Grouped Actions (Growth Plan)
            └── Action List state ──► localStorage
```

## External Dependencies

| Dependency | Purpose | Risk |
|-----------|---------|------|
| React 19 | UI framework | None — stable, standard |
| TypeScript | Type safety | None |
| Tailwind CSS 4 | Utility-first styling | None |
| shadcn/ui | Component primitives | Low — copy-paste model, no version lock |
| Recharts | Sparklines and trend charts | Low — simple usage |
| React Router v7 | Client-side routing | Low — 4 routes |
| Vite | Build tool | None — standard |

No external APIs. No runtime dependencies beyond the UI stack.

## Boundaries and Swap Points

**Swap points (designed for future extensibility without refactoring):**

1. **Data Layer → API**: Mock TypeScript modules can be replaced with API fetch calls. The VendorProvider interface stays the same — pages don't care where data comes from.

2. **Intelligence Layer → LLM API**: Template-based summaries can be replaced with real LLM calls. The function signatures stay the same — callers get back typed summary objects regardless of whether they were templated or AI-generated.

3. **localStorage → Database**: Storage helpers can be swapped to API-backed persistence. The interface is already abstracted.

4. **Static action list → Interactive Kanban**: The action list component can be replaced with a drag-and-drop board without touching the recommendation engine.

**Isolation rules:**
- Pages never import from other pages
- Intelligence layer has no UI dependencies (pure functions only)
- Data layer has no intelligence layer dependencies
- Shared components have no page-level dependencies
- localStorage access only through `/lib/storage.ts`
