# Versioning and Migration Standard

## Why this exists

A sold workbook is an independent customer installation containing live business data. A bug fix may be delivered as a corrected workbook. Customers must be able to transfer their existing data into it through a validated import/migration, without re-entering records or losing history. Retain the original workbook until the transfer is verified.

In-place migration and transfer into a corrected workbook are both valid delivery paths. Neither requires a paid upgrade.

## Required installation metadata

Every install must persist:
- `product_id`
- `product_version`
- `schema_version`
- `locale`
- `created_at`
- `last_migrated_at`

Add `installation_id` when needed for diagnostics/licensing/version tracking.

## Version types

### Product version
Tracks customer-facing release.

Use semantic-version-like format where practical:
- major: compatibility/large behavior change;
- minor: backward-compatible feature addition;
- patch: bug fix.

### Schema version
Integer or monotonic identifier for persisted data structure.

Schema version is independent from marketing/product version.

## Migration rules

Each schema change must define:
- from-version;
- to-version;
- prerequisites;
- transformation;
- validation;
- rollback/recovery behavior where practical.

Migrations should be:
- deterministic;
- safely retryable/idempotent where practical;
- logged;
- data-preserving.

## Example

Schema 3 → 4:
1. verify required tables;
2. add `waste_pct` to recipe records;
3. default existing values to 0;
4. validate numeric type;
5. set schema version to 4;
6. record migration timestamp.

## CSV backup and portability

Use customer-controlled export of canonical data tables as CSV, normally one file per table. Multiple files are acceptable; ZIP packaging is optional. Back up data and the configuration needed to interpret it, not recreatable dashboards, formatting, or application code.

The export contract must:
- use stable canonical field headers and preserve immutable IDs and foreign keys;
- include product/schema version and locale/currency/unit context, using a metadata CSV where appropriate;
- preserve historical amounts, dates, cost snapshots, and archived records;
- use UTF-8 and documented CSV quoting, date, number, and empty-value conventions;
- keep data usable by other tools without proprietary software or a vendor account;
- allow the customer to download and store their own files without requiring a broad Drive integration.

The exact file naming and serialization conventions must be specified with the export implementation. A data-table export is a portability/restore artifact, not a byte-for-byte backup of the workbook's presentation or code.

## Restore and corrected-workbook transfer

The first shipped product needs a documented and tested path to restore a compatible export. When a corrected release is delivered, its transfer path must:
1. inspect export metadata and validate product/schema compatibility;
2. validate required files, fields, values, duplicate IDs, and references before applying data;
3. apply supported schema migrations where needed, retaining IDs and historical values;
4. validate restored record counts and relationships with System Check;
5. report success or actionable failure and keep the original data available.

Reject incompatible or incomplete exports clearly. Do not silently merge into an installation with existing business data, duplicate records on retry, or leave a failed import presented as successful. Define the target-state and retry/recovery policy in the implementation issue; arbitrary record merging is outside this baseline.

## Update UX

The customer update/transfer path must support:
- preflight system check;
- backup prompt/automatic backup where permitted;
- migration;
- post-migration validation;
- clear success/failure message.

Do not expose implementation details unless needed for diagnostics.

## Commercial boundary

One-time purchase, one and done. No paid upgrades are planned. Product/schema versions remain technical identifiers for fixes, compatibility, and migration.

Support duration and release cadence are not specified by this technical standard.
