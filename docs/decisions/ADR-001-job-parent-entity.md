# ADR-001 — JOB as Common Commercial Work Reference

**Status:** Accepted

## Context

Orders, projects, campaigns, and service work share finance, CRM, reporting, status, and profitability concepts.

## Decision

Use `JOB` as a common parent/reference for commercial work where this improves reuse.

Specialized entities such as ORDER, PROJECT, and CAMPAIGN may reference `job_id`.

Finance should reference `job_id` when applicable.

## Consequences

Positive:
- shared finance/reporting;
- common profitability model;
- easier cross-product reuse.

Constraint:
- do not force unrelated concepts through JOB when it reduces domain clarity.
