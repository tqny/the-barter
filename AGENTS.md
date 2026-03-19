# AGENTS.md — The Barter

A portfolio project by Tony Mikityuk.
Part of the portfolio at https://tqny.github.io/Tony-s-Site/

---

## Current Phase

**PLAN**

Phases progress as: BRIEF → PLAN → BUILD → POLISH

Update this field as the project advances.

---

## What To Do Right Now

Planning docs are drafted. Next step:

1. Run `/plan-eng-review` to lock in architecture with diagrams, edge cases, and build-readiness assessment.
2. Once architecture is locked, transition to **BUILD** phase and begin from `docs/tasks.md` Phase 1: Foundation.

During BUILD:
- Work from `docs/tasks.md`, one scoped task at a time
- Verify each task before moving on
- **Run `/review`** before creating PRs
- **Run `/browse`** for visual QA
- **Run `/ship`** when a feature branch is ready

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
