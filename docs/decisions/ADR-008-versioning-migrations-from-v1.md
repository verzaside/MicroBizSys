# ADR-008 — Versioning and Migrations from V1

**Status:** Accepted

## Decision

Every shipped installation has product and schema version metadata. Schema changes require migration logic. Support customer-controlled CSV backups of canonical data tables and validated restoration/transfer into a compatible or corrected workbook.

## Rationale

Customer-owned copies accumulate live business data. Bug fixes may be delivered in a new workbook, provided existing records and relationships can be transferred safely. Customers must also be able to use their exported data elsewhere.

## Consequences

Migration tests and recovery become release requirements from the first commercial version.

Preserve IDs and historical values, validate export compatibility, retain the original until transfer succeeds, and avoid paid-upgrade dependencies. See [Versioning and Migrations](../architecture/versioning-and-migrations.md) for the CSV and recovery requirements.
