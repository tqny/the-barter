# Spec — The Barter

> Primary product truth. All other docs derive from this.

## Product

**The Barter** is a Vendor Growth OS — an AI-assisted customer success workspace that helps a CSM manage a small portfolio of fictional retail vendors, diagnose performance issues, and generate retailer-ready quarterly growth plans.

The product simulates the real work of a retail-focused Customer Success Manager inside a large e-commerce marketplace. It is framed as an original portfolio simulation, not a clone. The core loop is:

**Review → Diagnose → Prioritize → Communicate → Track Execution**

The distinguishing feature is the AI-assisted intelligence layer: rule-based issue detection combined with templated summarization, recommendation generation, and communication drafting. The AI layer is grounded in structured KPI patterns, not freeform generation.

## Target User

A single Customer Success Manager responsible for a book of five fictional vendor accounts inside a large retail marketplace environment.

Their context:
- They manage vendor relationships end-to-end
- They review weekly and quarterly performance
- They diagnose issues across catalog, traffic, conversion, ads, and supply chain
- They prepare business reviews and action plans
- They coordinate follow-through across internal teams

## Success Criteria

A recruiter or hiring manager immediately understands three things:

1. **Domain expertise** — Tony understands how a retail/e-commerce CSM actually diagnoses vendor performance and translates metrics into action.
2. **Workflow design** — Tony can design a tool that supports judgment, prioritization, and communication, not just dashboard viewing.
3. **AI judgment** — Tony has practical instincts for where AI can improve speed and clarity in a customer-facing operational role.

A reviewer should come away thinking: "This person understands the work, and they also have credible ideas for how to modernize it with AI."

## MVP Scope

A ruthless 3-page MVP with sub-tabs on page 3.

### Page 1: Executive Overview

A portfolio view of 5 fictional vendors with one selected vendor in focus.

- Vendor selector (with health pulse indicator — green/amber/red per vendor)
- Core scorecard: ordered revenue, ordered units, traffic, conversion, in-stock %, ad spend, ad-attributed sales, return rate
- 8-week trend sparklines
- Top risks and top opportunities
- AI-generated plain-English summary of what changed and why it matters
- "How this was generated" expandable on AI summary

### Page 2: Catalog & Diagnostics

A product-level diagnostics workspace for the selected vendor.

- ASIN-level data table
- Top movers, weak converters
- Inventory risk flags
- Content quality / listing issue flags
- Ad efficiency flags
- Diagnostic logic panels that explain likely root causes using KPI patterns
- Confidence indicators per diagnosis (High / Moderate — verify with vendor)
- "How this was generated" expandable on diagnostic outputs

### Page 3: Growth Plan & QBR Studio

A decision-and-follow-through page, split into two sub-tabs:

**Tab A — Action Plan**
- Grouped recommendations by: Marketing, Merchandising, Supply Chain, Operational Excellence
- AI-assisted action plan generation
- Static action list with status badges and due dates (no drag-and-drop)

**Tab B — QBR & Communication**
- Presentation-style QBR view (formatted card layout)
- Drafted vendor follow-up summary
- "How this was generated" expandable on AI outputs

### Page 4: About This Project

Dedicated sidebar page explaining:
- What real-world CSM workflow this simulates
- Why the product focuses on diagnosis and decision support
- How the AI layer works and why it's grounded in KPI patterns
- What is mocked vs. what would exist in production
- Architecture overview
- Portfolio context

## Non-Goals

Not for MVP:
- Real marketplace API integrations
- Real vendor logins or multi-user collaboration
- Backend database
- Full CRM functionality
- Advanced forecasting models
- Complex permissions or role-based access
- Real email sending
- Enterprise-grade workflow automation
- Chat-first AI assistant
- Production analytics or event tracking
- Mobile-first optimization (desktop-first with competent responsiveness)
- Dark mode
- Drag-and-drop Kanban
- Export/PDF generation
- Animated page transitions

## Assumptions and Constraints

**Assumptions:**
- Mock data for 5 vendors with ~10-20 ASINs each provides sufficient depth
- Rule-based detection + templated AI output is credible without live LLM API calls
- 8 weeks of trend data demonstrates patterns without excessive mock data effort
- The product lives as a standalone app linked from the portfolio site

**Constraints:**
- Must stay MVP-sized and realistically finishable
- Must feel recruiter-facing and portfolio-grade
- Must demonstrate CSM domain relevance first, AI thinking second
- No backend for MVP
- Low/no cost infrastructure
- Desktop-first, but responsive
- Data and outputs must feel believable (realistic business logic, not random numbers)
- Must avoid becoming a generic dashboard or chatbot

## Data / State Model

**Mock data (TypeScript modules):**
- Vendor profiles (5 vendors: name, brand, category, account health)
- ASIN-level product data (~10-20 per vendor: ASIN, title, category, ordered revenue, ordered units, traffic/DPV, conversion rate, in-stock %, ad spend, ad-attributed sales, return rate, lead time, content quality score, issue type)
- 8-week trend data per metric per ASIN and per vendor (aggregated)
- Issue definitions (type, owner team, priority, due date)

**Client-side state:**
- Selected vendor (React context + localStorage)
- Action list states (localStorage)
- Generated plan state (localStorage)

**Intelligence layer inputs:**
- Rule-based issue detection from KPI patterns (thresholds, correlations, week-over-week deltas)
- Templated summarization keyed to detected issue clusters
- Recommendation generation mapped to issue types and owner teams
- Confidence scoring based on corroborating signal count

## Auth / Access

None for MVP.
