# Risk Register

## R1 — Customer copy updates and transfers

**Severity:** High  
**Risk:** Every customer owns an independent copy containing live data. Updating code/schema is nontrivial.

**Controls:**
- product/schema version metadata;
- migration framework;
- preflight/postflight validation;
- backup before migrations where practical;
- CSV data-table export and validated transfer into a corrected workbook;
- preserve IDs/history and retain the source until transfer is verified;
- no manual re-entry or abandonment of live data.

## R2 — Customer-visible Apps Script source

**Severity:** High business/IP, Low technical  
**Risk:** Workbook owners can inspect copied bound script.

**Controls:**
- do not make secrecy a moat;
- keep private source readable;
- optionally bundle/minify/obfuscate release artifacts;
- no secrets in release code;
- terms/licensing/support entitlement.

## R3 — OAuth authorization friction

**Severity:** High UX  
**Risk:** Broad or confusing permission prompts hurt trust and onboarding.

**Controls:**
- minimum scopes;
- optional features isolated;
- avoid Gmail/Calendar/Drive access unless justified;
- document permissions in plain language.

## R4 — Apps Script quotas/runtime

**Severity:** Medium  
**Risk:** Slow/failed actions if architecture performs too many calls or trigger work.

**Controls:**
- batch reads/writes;
- explicit actions;
- avoid full scans;
- minimize triggers;
- no per-cell API loops.

## R5 — Customer data corruption

**Severity:** High  
**Risk:** Users edit/delete/sort raw tables or formulas.

**Controls:**
- protected/hidden system tables;
- intended HTML UI;
- stable schemas;
- System Check;
- archive instead of destructive delete;
- backup/recovery.

## R6 — Support burden

**Severity:** High business  
**Risk:** R$79–149 one-time product becomes unprofitable if onboarding/support is high touch.

**Controls:**
- guided onboarding;
- contextual help;
- diagnostics;
- narrow standard scope;
- no default bespoke customization;
- productized support docs.

## R7 — Data loss/recovery

**Severity:** High trust  
**Controls:**
- export;
- backup strategy;
- migration backups;
- integrity check;
- documented recovery path.

## R8 — Piracy/redistribution

**Severity:** Medium  
**Risk:** Buyer may share product copy/link/code.

**Controls:**
- reasonable license terms;
- support entitlement tied to legitimate purchase where practical, without a paid-upgrade model;
- optional installation metadata;
- no heavy DRM in V1.

## R9 — Google platform dependency

**Severity:** Medium  
**Risk:** quotas, APIs, authorization, UI policies may change.

**Controls:**
- repository abstraction;
- portable domain model;
- customer export;
- limited dependence on exotic Google features.

## R10 — Multi-user concurrency

**Severity:** Medium  
**Risk:** simultaneous writes can conflict.

**Controls:**
- owner-operator target;
- locks for critical writes;
- do not market as high-concurrency team ERP.

## R11 — Feedback blindness

**Severity:** Medium  
**Risk:** customer-owned architecture does not naturally provide SaaS usage analytics.

**Controls:**
- deliberate beta cohorts;
- in-product feedback/report links;
- structured interviews;
- optional telemetry only if later justified and transparently disclosed.

## R12 — Distribution channel dependency

**Severity:** Medium  
**Risk:** relying on one marketplace/platform for sales.

**Controls:**
- own product/customer documentation;
- maintain portable product delivery;
- diversify channels after initial validation.

## R13 — Scope creep

**Severity:** High  
**Risk:** the reusable platform becomes a generic ERP/SaaS before product-market validation.

**Controls:**
- product manifests;
- first-wave vertical slices;
- ADR discipline;
- no speculative integrations/compliance modules;
- shared module only when multiple products genuinely need it.

## R14 — Internationalization overbuild

**Severity:** Medium  
**Risk:** U.S. readiness delays Brazil.

**Controls:**
- country-neutral architecture only;
- pt-BR shipped first;
- no U.S.-specific workflow/compliance development until planned.

## R15 — Mobile architecture premature lock-in

**Severity:** Medium  
**Risk:** choosing deployment/auth before learning actual mobile needs, or deferring mobile for a niche that requires it at launch.

**Controls:**
- responsive components now;
- UI-independent services;
- assess and record mobile requirements before committing to each product's launch scope;
- choose delivery when needed and validate required actions on actual target devices/surfaces.
