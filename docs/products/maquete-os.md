# Maquete OS — Product Spec

## Role in platform

First-wave reference product validating project-based work:
- quoting;
- project scope;
- planned vs actual materials/labor;
- purchases;
- changes/extras;
- staged payments;
- profitability.

Initial workflow validation may use a real architectural-model/maquete business. The engine should remain reusable for later project niches such as custom woodworking.

## Core workflow

```text
Client
  ↓
Quote
  ↓
Accepted Project
  ↓
Scope / Tasks / Milestones
  ↓
Materials + Labor + Purchases
  ↓
Changes / Extras
  ↓
Payments
  ↓
Planned vs Actual Profitability
```

## V1 capabilities

### Quote
- scope summary;
- planned revenue;
- planned materials;
- planned labor;
- other expected costs;
- expected margin.

### Project
- status;
- dates;
- tasks/milestones;
- scope reference.

### Materials / purchases
- BOM/material estimate;
- actual purchases;
- variance.

### Labor
- planned hours/cost;
- actual hours/cost.

### Change orders
- approved extra work;
- revenue delta;
- cost delta.

### Finance
- deposit/milestone/final receivables;
- payments;
- expenses.

### Dashboard
Key KPI:
- quoted/planned vs actual material, labor, total cost, and margin.

## V1 non-goals

- architectural CAD/BIM;
- detailed Gantt project management;
- payroll;
- construction-industry compliance;
- large contractor ERP.
