# UGC OS — Product Spec

Scope companion: [UGC V1 Scope and Screen Flow](ugc-v1-review.md). Its four section-9 decisions were accepted by the product owner on 2026-09-17 and are reflected below; detailed implementation questions remain open.

## Role in platform

First-wave reference product validating creator/service workflows:
- CRM;
- JOB;
- campaign/deliverable specialization;
- rights;
- finance;
- profitability;
- attention queues.

## Target user

Independent UGC creator managing multiple brands/campaigns and wanting clear control over:
- deliverables;
- revisions;
- usage rights;
- invoices/payments;
- revenue/expenses;
- effective hourly economics.

## Core workflow

```text
Brand
  ↓
Campaign
  ↓
Deliverables
  ↓
Usage Rights
  ↓
Invoice / Receivable
  ↓
Payment
  ↓
Profitability / Renewal attention
```

## V1 capabilities

### Brands / clients
- contact details;
- notes;
- campaign history.

### Campaigns
- origin of the opportunity (how the creator learned the job was available);
- agreed fee;
- due dates;
- status;
- associated deliverables.

### Deliverables
- type;
- due date;
- revision rounds included/used;
- estimated and actual hours;
- status.

### Usage rights
- right type;
- duration/start/end;
- territory/channel notes;
- expiry;
- renewal value/opportunity.

### Finance
- invoiced/receivable amount;
- paid/unpaid;
- expenses;
- campaign/client profitability;
- effective revenue per hour.

### Dashboard / attention
- deliverables due soon;
- overdue deliverables;
- unpaid invoices;
- rights expiring soon;
- renewal opportunities.

## V1 non-goals

- social-platform analytics;
- automated social posting;
- contract generation/legal advice;
- accounting/tax filing;
- email automation by default;
- remote CRM backend.

## UX priority

Primary actions:
- New Brand
- New Campaign
- Add Deliverable
- Record Payment
- Add Expense

A creator should not need to operate raw sheets.

Approved navigation: Início, Campanhas, Marcas, Financeiro, with Ajuda e dados as a utility area. Organize deliverables, rights, money and hours around campaign detail. Validate the proposed sidebar/dialog arrangement before committing to the desktop surface.

## Mobile launch requirement

UGC V1 must support on mobile:
- viewing upcoming/overdue deliverables and campaign details;
- updating deliverable status and actual hours;
- recording payments and expenses.

Delivery/auth architecture remains undecided. Validate these actions on the intended real mobile surface; desktop responsiveness alone is insufficient. Full campaign setup, detailed rights configuration, reports and restoration remain desktop baseline tasks. Offline operation is not in scope.

## Accepted financial meanings

These are UGC product definitions, not universal accounting definitions for shared FINANCE:
- keep agreed fee, receivables and payments distinct; payments do not add revenue a second time;
- allow partial payments; reject amounts above the selected receivable's outstanding balance;
- campaign contribution = agreed fee minus recorded campaign expenses, excluding unallocated expenses and the creator's own labor cost;
- gross effective revenue per hour = agreed fee divided by total actual deliverable hours; mark incomplete hours and show unavailable for zero hours;
- monetary inputs use cent precision; calculated monetary displays use half-up rounding at the final step.

These measures do not represent cash available or final net profit. General expenses must remain distinguishable from campaign expenses. Numerical representation, correction/refund behavior, cancellation and receivable-total policies still need explicit implementation definitions.

Reference example: R$ 1.200,00 agreed and receivable, R$ 400,00 paid, R$ 150,00 campaign expenses and 6 actual hours produce R$ 800,00 outstanding, R$ 1.050,00 contribution and R$ 200,00/h gross effective revenue. An additional R$ 801,00 payment is rejected without changes.

## Guia Rápido developed alongside the system

Write core `pt-BR` guide sections as the corresponding workflow is designed and implemented. The product owner reads each section while validating its system scenario, checking meaning, labels and expected results together. Keep the [guide draft](../guides/ugc-guia-rapido.md) and [coverage/review map](../guides/README.md) current. Draft text is not evidence of implemented or validated functionality.

The guide must be useful and sellable without UGC OS. Teach concepts and methods independently of software; screen instructions and product-specific rules belong in separate help/validation material. Joint development supports consistency without making the guide a product manual.
