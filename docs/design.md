# Design — The Barter

> Written in two stages: structural decisions during planning (Pass 1), component patterns during building (Pass 2).

## Pass 1 — Structure and Direction

### Layout Pattern

**Sidebar + content area.**

- Fixed sidebar (240px) on the left: navigation links + vendor selector
- Content area fills remaining width, scrollable
- Sidebar is always visible on desktop; collapses on mobile (responsive)
- Page content uses a max-width container (~1280px) with horizontal padding for readability on ultrawide screens

```
┌─────────┬──────────────────────────────────────┐
│         │                                      │
│ Sidebar │         Content Area                 │
│         │                                      │
│  Nav    │  ┌──────────────────────────────┐    │
│  ------─│  │  Page Header                 │    │
│  Vendor │  ├──────────────────────────────┤    │
│  Picker │  │                              │    │
│         │  │  Page Content                │    │
│  Health │  │  (scrollable)                │    │
│  dots   │  │                              │    │
│         │  └──────────────────────────────┘    │
└─────────┴──────────────────────────────────────┘
```

### Density and Tone

**Moderately high density.** This is an operational workspace — information-rich but scannable.

- Closer to Linear, Notion, or a SaaS analytics tool than a marketing page
- Clean hierarchy through typography and spacing, not decoration
- Cards and panels create visual grouping without heavy borders
- Tables are dense but readable with adequate row height and subtle alternating backgrounds
- Metric bands (horizontal rows of KPI cards) are a primary pattern

**Tone:** Professional, modern, confident. No playful elements. No decorative flourishes. Clarity and structure do the heavy lifting.

### Design References

No specific external references provided. Direction is based on:

- Modern SaaS dashboard patterns (Linear, Notion, Stripe Dashboard)
- Presentation-ready business review surfaces
- Clear diagnostic panels with evidence-based explanations
- Structured action planning layouts

**What to adopt:**
- Clean card-based layouts with subtle elevation
- Strong typographic hierarchy (size + weight, not color)
- Metric bands with trend indicators
- Collapsible/expandable sections for detail-on-demand
- Tab navigation for sub-views

**What to avoid:**
- Heavy gradients or decorative backgrounds
- Dark mode (light mode is the SaaS workspace convention)
- Overly rounded corners or bubbly aesthetics
- Dense data grids without breathing room
- Marketing-style hero sections

### Token System

**Color palette:**

```
/* Neutrals (light mode base) */
--background:         #FFFFFF
--surface:            #F9FAFB       /* Card/panel backgrounds */
--surface-raised:     #F3F4F6       /* Hover states, table alternating rows */
--border:             #E5E7EB
--border-strong:      #D1D5DB
--text-primary:       #111827
--text-secondary:     #6B7280
--text-muted:         #9CA3AF

/* Primary accent */
--primary:            #2563EB       /* Blue-600 — CTAs, active nav, links */
--primary-hover:      #1D4ED8
--primary-light:      #EFF6FF       /* Backgrounds for selected/active states */

/* Semantic status */
--status-good:        #059669       /* Green — healthy metrics */
--status-good-bg:     #ECFDF5
--status-warn:        #D97706       /* Amber — attention needed */
--status-warn-bg:     #FFFBEB
--status-bad:         #DC2626       /* Red — critical issues */
--status-bad-bg:      #FEF2F2
--status-info:        #2563EB       /* Blue — informational */
--status-info-bg:     #EFF6FF
```

**Typography:**

```
/* Font family */
--font-sans:          'Inter', system-ui, sans-serif

/* Size scale */
--text-xs:            0.75rem       /* 12px — captions, badges */
--text-sm:            0.875rem      /* 14px — table cells, secondary text */
--text-base:          1rem          /* 16px — body text */
--text-lg:            1.125rem      /* 18px — section headers */
--text-xl:            1.25rem       /* 20px — page section titles */
--text-2xl:           1.5rem        /* 24px — page titles */
--text-3xl:           1.875rem      /* 30px — large metric values */

/* Weight */
--font-normal:        400
--font-medium:        500
--font-semibold:      600
--font-bold:          700
```

**Spacing (4px base):**

```
--space-1:            0.25rem       /* 4px */
--space-2:            0.5rem        /* 8px */
--space-3:            0.75rem       /* 12px */
--space-4:            1rem          /* 16px */
--space-5:            1.25rem       /* 20px */
--space-6:            1.5rem        /* 24px */
--space-8:            2rem          /* 32px */
--space-12:           3rem          /* 48px */
--space-16:           4rem          /* 64px */
```

**Borders and elevation:**

```
--radius-sm:          4px           /* Badges, small elements */
--radius-md:          6px           /* Cards, panels */
--radius-lg:          8px           /* Modals, larger containers */

--shadow-sm:          0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md:          0 4px 6px -1px rgba(0, 0, 0, 0.07)
```

**Motion:**

```
--transition-fast:    150ms ease
--transition-base:    200ms ease
--transition-slow:    300ms ease
```

---

## Pass 2 — Component Patterns

> **Status:** Populated after UI sophistication pass.

### Theme

Switched from light mode (blue primary, Inter font) to dark mode during sophistication pass.

- **Mode:** Dark — `#1a1d23` background, `#2f3436` cards
- **Primary:** Green `#33cc33` (light accent: `#66d9ef` cyan)
- **Fonts:** Montserrat (sans, body), Playfair Display (serif, available), Source Code Pro (mono)
- **Status colors:** Green (#33cc33), amber (#f59e0b), red (#ef4444), blue (#87ceeb) with dark-appropriate backgrounds
- **Reference:** @shadcnblocks/dashboard3 aesthetic — unified stat containers, chart + side widget layout, segmented bars, donut charts

### Component Vocabulary

- **StatsBand** — single bordered container with 2×4 grid, dividers, icon + label + large value + rich delta (`+2.3% ($11.2K) · vs Last Week`)
- **RevenueTrendChart** — ChartContainer + AreaChart with gradient fill, total header, legend dot
- **IssueDistributionWidget** — segmented horizontal bar by severity with colored legend
- **RevenueByCategoryWidget** — donut chart (PieChart) with center total label + category legend with amounts/percentages
- **IssueRow** — compact scannable row: severity badge + title + owner team + ASIN count
- **KeyFindingsGrid** — 2-column grid of numbered insight chips
- **DiagnosticSummaryStrip** — colored dot counts: "3 Critical · 1 High · 1 Moderate"
- **DiagnosticRow** — collapsible row: chevron + icon + severity + title, expands to show evidence with left-border indent
- **ActionRow** — compact task row: status badge + title + priority + due date on one line
- **GenerationExplainer** — collapsible "How this was generated" explainer (shared)
- **SeverityBadge** — severity-colored badge (shared)
- **SectionHeader** — icon + title (shared)
- **Progress** — shadcn progress bar (used in Growth Plan)

### Spacing and Rhythm

- Page sections: `space-y-6`
- Card internal: `p-4 sm:p-5` or `p-4 sm:p-6` (matches dashboard3)
- Stats grid: `p-4 sm:p-5` per cell
- Compact list rows: `py-2.5 px-3` with `divide-y divide-border`
- Chart heights: `h-[200px] sm:h-[240px]`
- Side widgets: `xl:w-[380px]` fixed width

### Responsive Behavior

**Breakpoints:**
- Desktop: >= 1280px (full sidebar + chart + side widgets side-by-side)
- Tablet: 768px–1279px (stats 2-col, chart stacks above widgets)
- Mobile: < 768px (sidebar hidden, single column)

Desktop-first. Mobile needs to be competent, not optimized.

### State Patterns

- No loading states (static mock data)
- Empty states: "No issues detected" / "No action items needed" / "All KPIs within thresholds"
- Error: Page-level ErrorBoundary

### Deviations from Pass 1

- **Dark mode:** Replaced light mode SaaS workspace. Decision driven by aesthetic preference during sophistication pass.
- **Font:** Montserrat replaced Inter. More character, still clean.
- **Card pattern:** Moved from individual metric cards to unified stats container with dividers (dashboard3 pattern). More cohesive.
- **Diagnostic panels:** Replaced stacked cards with collapsible rows. Much more scannable.
- **Action items:** Replaced full bordered cards with description paragraphs with compact single-line task rows.
