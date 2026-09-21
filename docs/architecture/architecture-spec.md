# Architecture Spec

## 1. Objective

Define a reusable architecture for a portfolio of lightweight, niche-specific microbusiness management systems.

The architecture must support product reuse without turning the system into a generic ERP.

The delivered product is a polished spreadsheet. Keep the software layer as light as practical: use native Sheets reporting/presentation where appropriate, thin HTML interfaces for guided actions, and only the abstractions needed by real workflows. Fluid, nimble, responsive operation is a product requirement. Layer boundaries protect data and testability; they do not require a large application framework.

A polished HTML/CSS interface is central to the intended experience. Routine data entry and actions should use guided forms, intuitive navigation, contextual help, and clear validation/save feedback. Keep the supporting implementation small while preserving the visual quality and ease of use defined in the UX Standard.

## 2. Platform

### Desktop baseline

- **Google Sheets** — customer-owned persistence and reporting layer.
- **Google Apps Script** — application/service/domain orchestration.
- **HTML/CSS/JavaScript** — intended user interface embedded through supported Google Sheets surfaces.
- **Google Drive** — optional backup/export/file features only when explicitly enabled.

### Mobile according to niche requirements

A niche may require mobile usage at launch. Define its essential mobile actions before committing to release scope and validate them on the intended device/surface. Responsive HTML alone does not demonstrate a usable mobile product.

A standalone web UI may reuse the same application/domain services and persistence model. Do not depend on desktop Sheets custom UI being available in the Sheets mobile app.

For the UGC V1 owner-validation build, use one bound Apps Script package with a desktop dialog and an owner-only web-app deployment sharing the same services and Sheets adapter. The workbook ID is bound during desktop opening. This choice does not prescribe deployment for other niches. See [ADR-013](../decisions/ADR-013-ugc-validation-build.md); real-device and Google deployment acceptance remain required.

Defer mobile delivery only for products whose required workflows can be served without it. Avoid a blanket mobile-later assumption across the portfolio.

## 3. Layering

```text
Presentation
  HTML/CSS/JS
  Sheets dashboard/report views
        ↓
Application / Services
  commands, workflows, orchestration
        ↓
Domain
  entities, calculations, policies
        ↓
Repository interfaces
        ↓
Google Sheets adapters
        ↓
Google Sheets tables
```

### Rules

1. UI must not directly encode persistence coordinates.
2. Domain logic must not depend on Google Sheets ranges.
3. Repository adapters isolate storage mechanics.
4. Tables use stable schemas and immutable IDs.
5. Labels are localized; canonical internal names remain country-neutral.
6. Reporting sheets may use formulas where appropriate, but critical business rules belong in testable services/domain logic.

## 4. Shared backbone

### CORE
Settings, lists, navigation metadata, locale/configuration, product/schema version.

### CRM
Customers, clients, brands, suppliers, contacts as appropriate.

### JOB
Common parent/reference for commercial work.

A job may specialize into:
- order;
- project;
- campaign;
- service job;
- rental booking where useful.

Not every niche must force every concept through JOB if doing so harms clarity, but shared finance/reporting should prefer a canonical commercial-work reference.

### FINANCE
Revenue, receivables/payments, expenses, profitability, transaction references.

### DASHBOARD
KPIs, attention lists, summaries, trends.

## 5. Operational engines

### Orders engine
- CATALOG
- ORDER
- JOB_LINES
- BOM
- INVENTORY
- PURCHASE
- optional production/fulfillment

### Projects engine
- QUOTE
- PROJECT
- SCOPE
- TASKS
- MILESTONES
- BOM
- PURCHASE
- LABOR
- CHANGE
- planned vs actual costing

### Creator/UGC engine
- CAMPAIGN
- DELIVERABLE
- RIGHTS
- invoicing/receivables
- profitability

### Affiliate engine
- CONTENT
- PRODUCT
- SAMPLES
- AFFILIATE
- COMMISSIONS
- PAYOUTS

### Rental engine
- ASSET
- RESERVATION
- RETURN
- optional damage/maintenance

### Production/equipment engine
- PRODUCTION
- CAPACITY
- EQUIPMENT
- MAINTENANCE

### Food/recipe engine
- RECIPE
- RECIPE_LINES
- YIELD
- ingredient/unit conversion support
- waste/packaging/labor/overhead costing

Food must reuse BOM/costing concepts where practical.

## 6. Persistence model

Prefer normalized system tables over wide presentation sheets.

Each canonical table should include:
- stable primary ID;
- created timestamp;
- updated timestamp where useful;
- active/archive status where useful;
- foreign keys by ID rather than name.

Never use row number as a durable business identifier.

## 7. Commands and workflows

Prefer explicit user operations:
- `createCustomer`
- `createOrder`
- `createProject`
- `recordPayment`
- `addExpense`
- `updateIngredientPrice`
- `generateQuote`
- `completeDeliverable`

Each command:
1. validates input;
2. resolves references;
3. applies domain rules;
4. persists required records;
5. returns an explicit result;
6. logs safe diagnostic context when appropriate.

## 8. Concurrency

Target users are owner-operators or very small teams.

Use locks for critical write workflows where simultaneous actions could create duplicate IDs, stock inconsistencies, or partial financial records.

Do not design for high-concurrency enterprise workloads.

## 9. Performance

- batch spreadsheet reads/writes;
- avoid per-cell loops;
- avoid full-table scans on every action;
- index/cache lookup maps within an operation when useful;
- do not use volatile spreadsheet formulas as the primary rules engine;
- minimize trigger usage.

## 10. Authorization

Core functionality should use minimal scopes.

Broader services such as Drive, Gmail, Calendar, external APIs, or future integrations must be optional and explicitly justified.

## 11. Customer ownership

Each sold copy is an independent customer-owned installation.

Therefore the architecture must support:
- versioning;
- migrations;
- backup/export;
- integrity checks;
- diagnostics;
- recovery.

Use customer-controlled CSV export of canonical data tables, with the metadata and configuration needed for validated restoration. A corrected workbook may receive migrated data from an existing installation; preserve IDs, relationships, and historical values, and retain the source until validation succeeds. Exports must also be usable independently of this product. See [Versioning and Migrations](versioning-and-migrations.md).

## 12. Source visibility

Assume workbook owners can inspect customer release Apps Script.

Private source quality, release bundling/obfuscation, and commercial execution are the protection strategy—not secrecy of deployed code.

## 13. Portability

Domain and application layers should not be structurally dependent on Google Sheets.

Persistence interfaces should leave open a future adapter to another store, although no alternate backend is in current scope.
