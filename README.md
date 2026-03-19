# The Barter — Vendor Growth OS

> Portfolio project by Tony Mikityuk
> Part of: [tqny.github.io/Tony-s-Site](https://tqny.github.io/Tony-s-Site/)

---

## What This Is

An AI-assisted customer success workspace that helps a CSM manage a portfolio of retail vendor accounts, diagnose performance issues, and generate retailer-ready quarterly growth plans.

This is a portfolio simulation — not a production tool. It demonstrates how a modern CSM workspace could combine retail performance analysis with an AI-assisted decision layer to make the role more efficient, consistent, and scalable.

## Why It Exists

Customer Success Managers in retail/e-commerce spend significant time reviewing vendor performance, diagnosing issues across catalog, traffic, conversion, and supply chain, then translating those findings into action plans and business reviews.

This project shows that I understand that workflow deeply — and that I can design a tool that supports judgment, prioritization, and communication, not just metric viewing.

The AI layer demonstrates practical instincts for where automation adds real value: faster performance summarization, clearer executive communication, more consistent issue clustering, and faster transition from analysis to follow-through.

## What's In v1

**3 workspace pages + About:**

1. **Executive Overview** — Vendor selector with health indicators, core scorecard (8 metrics), 8-week trend sparklines, risks/opportunities, AI-generated performance summary
2. **Catalog & Diagnostics** — ASIN-level data table, performance flags (inventory, conversion, content, ads), diagnostic panels with root cause explanations and confidence indicators
3. **Growth Plan & QBR Studio** — Two sub-tabs: *Action Plan* (grouped recommendations by Marketing, Merchandising, Supply Chain, Ops + action tracking) and *QBR & Communication* (formatted business review + vendor follow-up draft)
4. **About This Project** — Embedded case study explaining the workflow, AI approach, and portfolio context

**Key design decisions:**
- Rule-based diagnostics + templated AI output (grounded in KPI patterns, not freeform generation)
- "How this was generated" explainability on all AI outputs
- Confidence indicators on diagnoses (acknowledges uncertainty)
- Mock data with realistic business logic (not random numbers)

## Architecture

- **React 19 + TypeScript** — UI framework
- **Tailwind CSS 4 + shadcn/ui** — Styling and components
- **Recharts** — Trend visualizations
- **Vite** — Build tooling
- **Vercel** — Deployment

No backend. Mock data in TypeScript modules. Intelligence layer is pure functions with clear API boundaries (`/lib/intelligence/`).

See [docs/architecture.md](docs/architecture.md) for full technical documentation.

## How to Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## How to Evaluate

1. **Select a vendor** from the sidebar — note the health pulse indicator
2. **Scan the executive overview** — scorecard, trends, AI summary
3. **Drill into diagnostics** — click through ASIN flags and diagnostic panels, note confidence tags
4. **Open the growth plan** — see how findings become grouped recommendations and a QBR-ready view
5. **Expand "How this was generated"** on any AI output — see the KPI patterns that drove it
6. **Read About This Project** — understand the full context

## What This Demonstrates

- Deep understanding of retail CSM workflows and vendor performance analysis
- Ability to design workflow tools that support judgment and communication, not just data display
- Practical AI integration thinking — grounded, explainable, and role-appropriate
- Clean component architecture with clear module boundaries
- Portfolio-grade execution: polished, scoped, documented, and credible

---

Built with AI-assisted development workflows using Claude Code.
