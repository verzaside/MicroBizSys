# Development Plan

## Guiding principle

Build the reusable Core **alongside real niche vertical slices**. Do not attempt to finish a giant abstract platform before a product uses it.

The first three reference products exist to force the shared architecture to prove itself across distinct workflow types.

Keep code lightweight throughout: these are polished spreadsheet products. Use the smallest shared structure that supports real workflows and retain useful native Sheets capabilities. The [Product Portfolio Roadmap](product-portfolio.md) preserves all mapped launch candidates beyond the first product.

Before committing to each product's launch scope, assess whether mobile usage is mandatory and identify the essential actions. Add delivery and device validation to that product's release scope when required; desktop-first development does not imply desktop-only commercial readiness.

## Phase 0 — Foundation

Current phase.

Deliverables:
- architecture documents;
- module catalog;
- data dictionary;
- interface contracts;
- UX/localization standards;
- accepted ADRs;
- product specs/manifests;
- testing/acceptance standard;
- risk/support standards;
- AGENTS.md;
- GitHub task discipline.

Exit criteria:
- enough decisions are explicit that an implementation issue can be completed without inventing architecture.

## Phase 1 — Shared backbone + first vertical slice

Build only enough shared platform to support a functioning vertical slice:

1. CORE
2. CRM
3. JOB
4. FINANCE
5. minimal DASHBOARD/query support
6. repository abstraction + Google Sheets adapter
7. HTML UI shell/components
8. installation/version/schema metadata
9. integrity check foundation
10. localization foundation (`pt-BR` first)

Use a real product workflow immediately rather than building modules in isolation.

Approved first reference: UGC, exercising CRM → work → deliverables → receivables/payments without inventory complexity. Its [accepted scope review](../products/ugc-v1-review.md) also requires mobile viewing, status/hour updates and payment/expense recording at commercial launch. Delivery/auth architecture remains to be selected and validated.

### Suggested first complete journey

```text
Open system
→ complete initial setup
→ create brand/client
→ create campaign/job
→ add deliverable
→ create receivable
→ record payment
→ see dashboard/attention state
```

Exit criteria:
- journey works through intended HTML UI;
- routine operation does not require editing raw data;
- domain/service/repository boundaries are proven;
- tests and diagnostics exist.
- the corresponding core guide text and shared review scenario accompany the slice, with owner review status recorded.

Before the first commercial release, also prove CSV data-table export and restoration/transfer into a compatible or corrected workbook. Include product/schema metadata, preserve IDs and historical data, and test failure/retry behavior. These are data-ownership requirements, independent of paid upgrades; no paid upgrades are planned.

## Phase 2 — Orders engine / Personalizados

Add:
- CATALOG
- ORDER
- JOB_LINES
- BOM
- INVENTORY
- PURCHASE
- simple FULFILLMENT

Reference journey:

```text
Customer
→ order
→ products/quantities
→ material requirement
→ cost/profit expectation
→ production/fulfillment status
→ payment
```

Goal:
Prove the same Core works for physical made-to-order products.

## Phase 3 — Projects engine / Maquete

Add:
- QUOTE
- PROJECT
- SCOPE
- TASKS/MILESTONES as needed
- LABOR
- CHANGE
- planned vs actual economics

Reference journey:

```text
Client
→ quote
→ accepted project
→ planned materials/labor
→ actual purchases/labor
→ change order
→ staged payments
→ planned-vs-actual margin
```

Goal:
Validate project-based work with real-world workflow feedback.

## Phase 4 — Food / Recipe Costing

Reuse Orders/BOM/Inventory/Finance and add:
- RECIPE
- YIELD
- FOOD_COSTING
- UNITS/conversion infrastructure
- ingredient-specific conversion rules

Goal:
Prove platform portability into a financially acute, high-potential niche.

## Later portability tests

High-value reuse tests:
- Personalizados → Artesanato
- Maquete/Projects → Marcenaria/custom woodworking
- UGC → TikTok Shop / Creator Complete
- Orders/BOM → Food variants
- Rental engine → party/event rental
- Service engine → solo technicians
- Production/equipment → 3D printing

## Guia Rápido alignment

For each commercial niche:
- guide research should help validate terminology and workflow;
- how-to chapters should map to actual system workflows;
- write core sections with each workflow slice and deliver text plus the system scenario for joint owner review;
- use shared examples and expected outcomes; correct the guide, UI or business rules together when they disagree;
- do not wait for the complete publication before implementing or defer all writing until afterward;
- guide teaches method; OS implements it.
- the guide is independently sellable literature and an acquisition funnel; product operation instructions remain in separate help/review material.

UGC starts with [core guide text](../guides/ugc-guia-rapido.md) explaining brands/campaigns/deliverables and the accepted financial meanings. Maintain the [coverage/review map](../guides/README.md). The owner's reading validates clarity and usability; source verification and niche-user feedback still inform domain correctness.

## Product-owner checkpoints

Do not require the user to make decisions on every technical detail.

Escalate/checkpoint when:
- workflow assumptions affect customer behavior;
- scope changes materially;
- a shared module boundary changes;
- a new Google permission is needed;
- a commercialization/support promise changes;
- a new persistent data concept is introduced.

## Avoid

- implementing all planned modules before any end-to-end workflow works;
- perfecting generalized abstractions with only one use case;
- designing U.S.-specific product logic now;
- building mobile deployment without a defined niche requirement, or deferring it when essential to that niche's launch;
- building remote licensing/telemetry infrastructure now;
- building fiscal/accounting functionality now.
