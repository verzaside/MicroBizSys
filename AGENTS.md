# AGENTS.md — Codex / Engineering Agent Instructions

This file contains persistent repository rules. Treat it as binding unless the user explicitly changes a canonical decision.

## 1. Mission

Build a reusable, Google-native product platform for lightweight niche management systems serving owner-operated microbusinesses.

The products are **polished, guided spreadsheets** for specific niches. Keep software code as light as practical so the experience stays fluid, nimble, and responsive. Use native Sheets capabilities where appropriate and thin HTML interfaces where they simplify routine work; do not require users to operate raw system tables.

A polished HTML/CSS UX is a core product requirement: guided forms, intuitive navigation, clear next actions, and helpful validation/feedback should make routine use easy. Lightweight implementation must preserve this quality of guidance and visual design.

Primary launch market: **Brazil**.  
Architecture: **internationalization-ready** for later U.S. products without expanding Brazilian V1 scope.

Commercial model: **one-time purchase, one and done**, with no subscriptions or planned paid upgrades.

Keep mapped niches alive in `docs/roadmap/product-portfolio.md`; update their validation/priority state as evidence arrives without treating the full list as current implementation scope.

Write core Guia Rápido sections alongside the corresponding system workflows. Deliver the explanation and shared example with each relevant slice so the product owner can read the guide while validating the system. Track text review and system verification separately in `docs/guides/README.md`; verify unfamiliar niche-specific claims rather than inventing domain advice.

The Guia Rápido is standalone literature that can be sold without the OS and serves as a funnel to it. Teach methods readers can apply with their own tools; keep screens, buttons and product-specific rules in separate help/review material. Joint development must not turn the guide into a system manual.

## 2. Do not implement beyond scope

Before writing code, identify the issue or specification being implemented.

Do **not**:
- invent product requirements not present in canonical docs;
- add speculative SaaS infrastructure;
- add subscriptions, paid upgrades, license servers, remote databases, telemetry, marketplace integrations, tax engines, or mobile deployments without a defined product requirement;
- build features solely for the future U.S. market;
- silently make architecture decisions;
- hardcode niche logic into shared modules;
- couple business logic directly to arbitrary spreadsheet coordinates.

If a needed decision is missing, document the assumption in the PR/issue response and choose the smallest reversible implementation.

## 3. Canonical technology direction

Desktop V1:
- Google Sheets: customer-owned data store and reporting layer.
- Google Apps Script: domain/service/application logic.
- HTML/CSS/JavaScript: intended UX via Sheets sidebar/dialogs and other appropriate embedded surfaces.
- Google Drive: only for explicitly enabled backup/export/file workflows.

Mobile readiness:
- mobile usage may be mandatory for a niche's first release; determine this before committing to its launch scope;
- record required mobile actions and validate them on the intended device/surface;
- a standalone Apps Script web app or another compatible frontend may reuse the same service/domain logic;
- mobile deployment architecture is intentionally not locked yet; do not assume every niche can defer mobile.

Do not depend on custom UI support in the Google Sheets mobile app.

## 4. Architecture boundaries

Preferred dependency direction:

```text
UI
↓
Application / Service Layer
↓
Domain Logic
↓
Repository Interfaces
↓
Google Sheets Adapters
```

Rules:
- UI code must not manipulate arbitrary sheet cells directly.
- Business rules must not depend on HTML or spreadsheet coordinates.
- Repositories/adapters own persistence concerns.
- Use immutable generated IDs for canonical entities.
- Use canonical field names internally; localize labels at the UI boundary.
- Prefer explicit commands such as `createOrder`, `recordPayment`, `updateIngredientPrice`.
- Prefer batched reads/writes.
- Avoid trigger-heavy and cell-edit-driven architectures.
- Avoid large numbers of custom Apps Script functions in sheet cells.

## 5. Shared domain model

Shared backbone:
- CORE
- CRM
- JOB
- FINANCE
- DASHBOARD

`JOB` is the common parent/reference point for commercial work where practical.

Specializations/engines include:
- Orders
- Projects
- Creator/UGC
- Affiliate
- Rental
- Production/Equipment
- Food/Recipe Costing

Finance and reporting should reference canonical IDs such as `job_id` when applicable.

## 6. Product boundaries

### UGC OS
Focus on brands/clients, campaigns, deliverables, usage rights, invoices/payments, expenses, profitability, effective hourly rate, renewal/expiry attention.

### Personalizados OS
Focus on customers, catalog, orders, BOM/materials, inventory, purchasing, production/fulfillment as needed, finance, profitability.

### Maquete OS
Focus on quote, project, scope, tasks/milestones, BOM/materials, labor, purchases, change orders, payments, planned-vs-actual profitability.

### Food OS
Focus on recipes/yield, ingredients, unit conversions, packaging, waste, labor/overhead costing, product pricing, orders, inventory/purchasing, profitability.

Food is a specialization of reusable BOM/costing concepts, not a completely separate architecture.

## 7. Internationalization rules

Brazil is the first commercial market.

From V1:
- canonical code must be country-neutral;
- UI strings must be externalized;
- locale, currency, date/number formatting, address labels, and unit systems must be configurable;
- `pt-BR` is first;
- `en-US` is a planned later locale.

Do not build U.S. tax, legal, or compliance logic unless separately specified.

Never use internal field names such as `valor_reais` or `cpf_cliente`. Prefer `amount`, `customer_tax_id`, etc.

## 8. Security and Google authorization

- Use minimum OAuth scopes.
- Core functionality should avoid unnecessary Gmail, Calendar, Contacts, broad Drive, or external API access.
- Optional capabilities may request broader scopes only when explicitly enabled and justified.
- Never place secrets in customer-visible Apps Script.
- Assume customer owners can inspect release code.
- Do not treat minification/obfuscation as security.

## 9. Versioning and migrations

Every install must have at minimum:
- `product_id`
- `product_version`
- `schema_version`
- `installation_id` if/when required

All schema changes after first release require migration logic.

A corrected workbook may replace an old file only through a validated data transfer/migration that preserves the customer's records. Never require re-entry or abandonment of live data; retain the original until transfer is verified.

Migrations must:
- be idempotent where practical;
- preserve customer data;
- validate prerequisites;
- record completion;
- fail safely and diagnostically.

## 10. Data integrity

Raw data tables are system-managed.

Required practices:
- protected/hidden where appropriate;
- immutable entity IDs;
- referential integrity checks;
- schema validation;
- defensive parsing and validation at service boundaries;
- no partial writes for critical multi-record operations when avoidable;
- locking for critical concurrent writes where needed.

Provide a `System Check` / integrity-check capability before release.

## 11. Backup, export, and recovery

Every product must support a documented recovery path.

At minimum:
- customer-controlled CSV export of canonical data tables, using multiple files when needed;
- validated import/restore into a compatible or corrected workbook, preserving IDs and relationships;
- product/schema metadata accompanying the export so migration can validate compatibility;
- integrity diagnostics;
- backup strategy.

Exports must be usable outside this product. Back up data and necessary configuration; recreatable UI/report sheets and code do not need to be part of a data backup.

Do not require customers to understand Google Sheets internals to recover from common problems.

## 12. Supportability

Support cost is a product constraint.

Design for self-service:
- guided onboarding;
- contextual help;
- actionable validation messages;
- safe diagnostics;
- clear setup state;
- visible product/schema version.

A diagnostic report should expose technical state without unnecessarily including customer names, revenue, or other private business data.

Do not build per-customer customization into the product workflow. Customization requests are product feedback unless explicitly converted into paid/custom work outside this repository.

## 13. Testing expectations

For each feature:
- unit-test domain calculations where feasible;
- test repository/adapters separately from domain rules;
- test migration paths;
- test locale-sensitive formatting;
- test data validation and failure behavior;
- provide fixture/sample data;
- define acceptance criteria before implementation.

For financial/costing calculations, include deterministic examples with expected outputs.

## 14. UX rules

Target style:
- modern, lightweight, professional, serious;
- neutral UI;
- marine blue + light grey + restrained silver/chrome accents;
- information-dense enough for business use but not ERP-like.

The user should not need to navigate raw tables for routine work.

Desktop:
- management/configuration/planning/reporting.

Mobile, when required by the niche:
- capture/status/quick actions.

Prioritize:
- 3–5 key KPIs;
- attention lists;
- clear primary actions;
- guided forms;
- empty states;
- responsive components.

Avoid:
- decorative chart overload;
- excessive tabs;
- spreadsheet-first workflows;
- hidden side effects.

## 15. Performance rules

Apps Script is quota-constrained.

Prefer:
- batch reads and writes;
- targeted updates;
- explicit service calls;
- caching only when justified.

Avoid:
- scanning entire large tables for every UI action;
- unnecessary triggers;
- per-cell API loops;
- volatile or deeply chained spreadsheet formulas for core business logic.

## 16. Release-code policy

Private repository source should remain readable and maintainable.

Release pipeline may bundle/minify/obfuscate customer-facing code, but:
- tests run against readable source;
- source maps or equivalent internal debugging aids should remain private;
- obfuscation must not compromise reliability;
- never describe obfuscation as encryption or strong IP protection.

## 17. Decision discipline

If a change affects any of the following, create/update an ADR:
- domain model;
- module contracts;
- storage model;
- Google authorization/scopes;
- update/migration strategy;
- mobile architecture;
- commercialization model;
- shared-vs-niche responsibility.

Do not bury architecture changes inside implementation commits.

## 18. Definition of done

A feature is not done until:
- acceptance criteria pass;
- failure cases are handled;
- documentation is updated;
- relevant core Guia Rápido text and review scenario are aligned with the workflow; owner review status is recorded without assuming approval;
- localization implications are considered;
- schema changes include migrations;
- diagnostics/support implications are considered;
- no canonical architecture rule is violated.

## 19. Communication with the user

When reporting work:
1. state what changed;
2. state which requirements/acceptance criteria it satisfies;
3. flag assumptions or unresolved decisions;
4. identify tests run and their outcome;
5. avoid presenting speculative future work as implemented.

Keep implementation choices reversible unless a canonical decision explicitly requires commitment.
