# The Barter

**Vendor Growth OS**

> Portfolio project by Tony Mikityuk
> Part of: [tqny.github.io/Tony-s-Site](https://tqny.github.io/Tony-s-Site/)

## What This Is

An AI-assisted customer success workspace that helps a CSM manage a portfolio of retail vendor accounts, diagnose performance issues, and generate retailer-ready quarterly growth plans.

This is a portfolio simulation, not a production tool. It demonstrates how a modern CSM workspace could combine retail performance analysis with an AI-assisted decision layer to make the role more efficient, consistent, and scalable.

## Why It Exists

Customer Success Managers in retail and e-commerce spend significant time reviewing vendor performance, diagnosing issues across catalog, traffic, conversion, and supply chain, then translating those findings into action plans and business reviews.

This project shows that I understand that workflow deeply and that I can design a tool that supports judgment, prioritization, and communication, not just metric viewing.

The AI layer demonstrates practical instincts for where automation adds real value: faster performance summarization, clearer executive communication, more consistent issue clustering, and faster transition from analysis to follow-through.

## What's In It

**3 workspace pages + About:**

1. **Executive Overview** - Interactive scorecard with 8 animated metric cards, dual-axis revenue + ROAS chart, hover-linked donut and issue distribution charts, AI-generated performance summary with key findings, clickable risk/opportunity rows with evidence popovers
2. **Catalog & Diagnostics** - Sortable ASIN-level data table, performance flags (inventory, conversion, content, ads), collapsible diagnostic rows with root cause explanations and confidence indicators
3. **Growth Plan & QBR Studio** - Two sub-tabs: Action Plan (grouped recommendations by Marketing, Merchandising, Supply Chain, Ops + action tracking) and QBR & Communication (formatted business review + vendor follow-up draft)
4. **About This Project** - Embedded case study explaining the workflow, AI approach, and portfolio context

**Key features:**
- Rule-based diagnostics + templated AI output grounded in KPI patterns
- "How this was generated" explainability popovers on all AI outputs
- Confidence indicators on diagnoses (acknowledges uncertainty)
- Simulate Week 9: adjust 8 vendor metrics via sliders, watch the AI re-analyze and produce new diagnostics, risks, and recommendations in real time
- Interactive data visualization with framer-motion animations, hover-linked charts, and clickable detail dialogs
- Mock data with realistic business logic (not random numbers)

## Architecture

- **React 19 + TypeScript** - UI framework
- **Tailwind CSS 4 + shadcn/ui** - Styling and component primitives
- **Recharts** - Charts and data visualization
- **Framer Motion** - Animations and micro-interactions
- **Vite** - Build tooling

No backend. Mock data in TypeScript modules. Intelligence layer is pure functions with clear API boundaries (`/lib/intelligence/`).

See [docs/architecture.md](docs/architecture.md) for full technical documentation.

## How to Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## How to Evaluate

1. **Select a vendor** from the sidebar. Note the health pulse indicator.
2. **Click any stat card** to see its trend line chart. Hover over charts to see interactive highlights.
3. **Try "Simulate Week 9"** to adjust metrics and watch the AI re-analyze.
4. **Click issue rows** in Top Risks / Opportunities to see evidence popovers.
5. **Drill into diagnostics** on the second page. Click through ASIN flags and diagnostic rows.
6. **Open the growth plan** to see how findings become grouped recommendations and a QBR-ready view.
7. **Click "How this was generated"** on any AI output to see the methodology.
8. **Read About This Project** for the full context.

## What This Demonstrates

- Deep understanding of retail CSM workflows and vendor performance analysis
- Ability to design workflow tools that support judgment and communication, not just data display
- Practical AI integration thinking: grounded, explainable, and role-appropriate
- Interactive data visualization with linked hover states and animations
- Clean component architecture with clear module boundaries
- Portfolio-grade execution: polished, scoped, documented, and credible

Built with AI-assisted development workflows using Claude Code.
