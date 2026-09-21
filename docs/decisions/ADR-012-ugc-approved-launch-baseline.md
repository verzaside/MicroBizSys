# ADR-012 — UGC Approved Launch Baseline

**Status:** Accepted, 2026-09-17

## Context

The product owner accepted all four decisions in section 9 of the [UGC review](../products/ugc-v1-review.md): first product/scope, screen flow, mobile launch tasks and financial meanings.

## Decision

- Build UGC first with the complete V1 scope in its product specification.
- Use campaign-centered work with Início, Campanhas, Marcas and Financeiro, plus a help/data utility area. Test the desktop surface arrangement before finalizing it.
- Require mobile viewing of deliverables/campaign details, status/hour updates, and payment/expense recording at launch. Delivery/auth architecture and Google scopes remain undecided.
- Preserve distinct agreed, receivable and received amounts. Accept partial payments and reject amounts beyond the selected balance.
- UGC contribution uses agreed fee minus campaign-linked expenses; gross effective hourly revenue uses agreed fee divided by actual deliverable hours. State exclusions and incomplete/zero-hour behavior explicitly.
- Use cent-precision money inputs and final half-up rounding for calculated monetary displays; implementation must define the numerical representation and tests.

## Consequences

These economics definitions belong to UGC and must not silently become universal formulas for other products. Shared FINANCE still supplies canonical receivables, payments and expenses. No new persistent entities or changed shared service signatures are approved here.

Mobile delivery must be selected and verified before launch. The approval does not establish feasibility, implementation, or validation evidence. Status/cancellation, financial correction, receivable-total and date policies still need bounded implementation decisions.

The UGC specification and manifest reflect these decisions. Core Guia Rápido writing and joint validation follow [ADR-010](ADR-010-guides-as-acquisition-layer.md).
