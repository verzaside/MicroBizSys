# Module Catalog

## Shared modules

| Module | Responsibility | Shared? |
|---|---|---|
| CORE | settings, configuration, versions, locale, reference lists | Yes |
| CRM | parties/contacts: customer, client, brand, supplier | Yes |
| JOB | canonical commercial-work parent/reference | Yes |
| FINANCE | receivables, payments, revenue, expenses, profitability | Yes |
| DASHBOARD | KPI aggregation, attention queues, reporting | Yes |
| UNITS | unit definitions and safe conversions | Yes where needed |

## Orders / maker modules

| Module | Responsibility |
|---|---|
| CATALOG | sellable products/services |
| ORDER | order header/state |
| JOB_LINES | items/services associated with work |
| BOM | components/material requirements |
| INVENTORY | on-hand / movement / reorder data |
| PURCHASE | supplier purchasing |
| FULFILLMENT | optional preparation/production/delivery state |

## Project modules

| Module | Responsibility |
|---|---|
| QUOTE | project estimate/proposal |
| PROJECT | project specialization of JOB |
| SCOPE | defined project scope |
| TASKS | work items |
| MILESTONES | planned checkpoints |
| LABOR | planned/actual labor |
| CHANGE | extras/scope changes/change orders |
| PROJECT_COST | planned vs actual cost/margin aggregation |

## Creator / UGC modules

| Module | Responsibility |
|---|---|
| CAMPAIGN | brand/client engagement |
| DELIVERABLE | content/work commitments |
| RIGHTS | usage rights, terms, expiry/renewal |
| CREATOR_ECONOMICS | effective hourly rate, client/campaign profitability |

## Affiliate / TikTok modules

| Module | Responsibility |
|---|---|
| CONTENT | affiliate content item |
| PRODUCT | promoted product |
| SAMPLES | requested/received sample workflow |
| AFFILIATE | program/source relationship |
| COMMISSIONS | expected/earned commissions |
| PAYOUTS | payouts/reconciliation |

## Rental modules

| Module | Responsibility |
|---|---|
| ASSET | rentable unit or inventory item |
| RESERVATION | date/time allocation |
| RETURN | return/check-in |
| DAMAGE | optional damage/charge log |
| RENTAL_MAINTENANCE | service/availability state |

## Production / equipment modules

| Module | Responsibility |
|---|---|
| PRODUCTION | production queue/run |
| CAPACITY | finite machine/labor capacity |
| EQUIPMENT | machine/tool asset |
| MAINTENANCE | maintenance/availability history |

## Food / recipe modules

| Module | Responsibility |
|---|---|
| INGREDIENT | purchasable food input |
| RECIPE | recipe/batch definition |
| RECIPE_LINES | ingredient quantities |
| YIELD | output quantity/unit |
| FOOD_COSTING | ingredient + packaging + waste + labor + overhead |
| RECIPE_CONVERSION | ingredient-specific volume/mass conversions where needed |

## Module design rule

A niche product selects modules and configures terminology/workflows. It should not fork shared modules without a documented reason.

If a niche-specific need can be expressed as an extension point or policy without contaminating the shared module, prefer that approach.
