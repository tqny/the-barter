# AGENTS.md — The Barter

A portfolio project by Tony Mikityuk.
Part of the portfolio at https://tqny.github.io/Tony-s-Site/

---

## Current Phase

**POLISH**

Phases progress as: BRIEF → PLAN → BUILD → POLISH

Update this field as the project advances.

---

## What To Do Right Now

BUILD is complete. A major UI sophistication pass was applied (dashboard3-inspired layout, dark theme, new typography). Now in POLISH.

1. Continue **Polish Tasks** — responsive pass (pages were redesigned, need fresh breakpoint QA), accessibility basics, data believability review, cross-page consistency, console clean check, final README pass.
2. Then **Deploy** — Vercel deployment and portfolio site link.

During POLISH:
- Work from `docs/tasks.md` Polish Tasks section
- **Run `/browse`** for visual QA at each breakpoint (375px, 768px, 1280px)
- **Run `/review`** before creating PRs
- **Run `/ship`** when a feature branch is ready

### What changed in the UI sophistication pass (this session):
- **Theme:** Switched to dark mode with green primary (#33cc33), Montserrat font, warm neutrals
- **Executive Overview:** Unified stats band with dividers + `+2.3% ($11.2K) · vs Last Week` deltas, revenue area chart + side widgets (issue distribution segmented bar, revenue-by-category donut chart), compact issue rows for risks/opportunities, numbered key findings grid
- **Diagnostics:** Diagnostic summary strip with severity counts, collapsible diagnostic rows (expand for evidence)
- **Growth Plan:** Compact single-line action rows, shadcn Progress component, separator-divided QBR talking points, 2-column key findings grid
- **New components:** `progress.tsx` (shadcn), `chart.tsx` (shadcn ChartContainer)

---

## Read Order

For any thread picking up this project:

1. `AGENTS.md` (this file) — current phase and what to do
2. `docs/spec.md` — what the product is (primary product truth)
3. `docs/architecture.md` — how it's structured
4. `docs/tasks.md` — what's done, what's next
5. `docs/design.md` — design system and direction
6. `README.md` — reviewer-facing context

---

## Source of Truth

- `docs/spec.md` — primary product truth
- `docs/tasks.md` — execution state and continuity
- `docs/architecture.md` — technical structure
- `docs/design.md` — design system and decisions
- `README.md` — reviewer-facing orientation

---

## Key Decisions (from product review)

- **Scope cuts:** Static action list (no drag-and-drop), QBR as card layout (no presentation mode), 8-week trends (not 12-week)
- **Page 3 structure:** Sub-tabs — "Action Plan" and "QBR & Communication"
- **Intelligence layer:** Dedicated `/lib/intelligence/` directory with clear API boundary (pure functions, no UI coupling)
- **Color mode:** Light mode SaaS workspace aesthetic
- **Delight features:** Vendor health pulse dots, diagnostic confidence indicators, "How this was generated" explainability
- **Stack:** React 19 + TypeScript + Tailwind 4 + shadcn/ui + Recharts + Vite + Vercel

---

## What Not To Change Casually

- The intelligence layer API boundary — pages consume it, they don't own diagnostic logic
- Mock data structure — types are shared across data layer and intelligence layer
- The 3-page + About structure — this is the reviewed and approved scope
- Design tokens — changes cascade everywhere

---

## End-of-Session Discipline

Before ending any session:

1. Update `docs/tasks.md` — mark completed tasks, note what's in progress, confirm next task.
2. Update this file's "Current Phase" if it changed.
3. If architecture or design decisions were made, update the relevant doc.
4. Note anything a new thread needs to know that isn't captured in docs.

---

## Thread Switching

When context gets heavy (30+ substantial exchanges), recommend a fresh thread. The new thread reads this file first, then follows the read order above. Docs-as-memory keeps continuity intact.

---

## Portfolio Context

This project is part of Tony Mikityuk's portfolio. It should be:

- Portfolio-grade: polished, presentable, credible
- Scoped honestly: clear MVP, clear non-goals
- Modular: clean boundaries, reusable primitives
- Documented: repo docs are durable, chat is temporary
- Reviewer-ready: includes an in-product "About This Project" surface

Target audience for the portfolio: hiring managers evaluating a program manager / customer success professional with growing AI/agentic engineering skills.

---

## Repo Workflow

- Git repo from day 1
- GitHub remote from day 1 (https://github.com/tqny/the-barter)
- Feature branches for meaningful work
- PRs before merge to main
- No direct-to-main unless trivial
