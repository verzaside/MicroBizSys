# ADR-013 — UGC V1 validation build

**Status:** Accepted implementation baseline, 2026-09-18. Reversible choices under the authorized V1 build; owner validation remains pending.

**Amendment 2026-09-18:** The beta now uses schema 2. Campaigns carry one optional `origin_source` value, entered freely by the creator, to record how the opportunity was discovered. Rights retain the separate `channels` field for where the content may be used. Existing schema 1 workbooks and backups migrate by adding a blank origin; no existing IDs, amounts or relationships change. Text and textarea controls expose localized hover guidance without changing their stored values.

## Delivery, permissions and storage

Use plain JavaScript, HTML and CSS without a frontend framework. One bound Apps Script package serves the Sheets dialog and a responsive web app. Deploy the web app as `MYSELF` / `USER_DEPLOYING` for this single-owner validation build; no anonymous or multi-customer endpoint. Mobile uses that private URL in the owner's browser, not the Sheets mobile custom UI.

Store the workbook ID in script properties during bound setup; web apps cannot rely on active-container methods. Request `spreadsheets` and `script.container.ui` only. The full Sheets scope is needed for opening the configured workbook by ID and the advanced Sheets service; no Drive, Gmail, external requests or remote services. The code only targets the configured workbook. Google consent and deployment must be completed by the owner when required.

Use normalized hidden `_ugc_*` tables. Sheets API batchUpdate atomically writes changed rows, revision and operation receipt in one request, protected by a script lock. A revision token prevents stale writes; operation IDs make retries safe. System Check validates types, keys and references. Cache is only an optimization; it is keyed by persisted revision. No cell-edit automation; `onOpen` only adds the menu.

Schema 2 adds campaign `origin_source`, the creator-entered description of how the opportunity became known. This is separate from rights `channels`, which describe where content may be used. Revision and idempotency metadata, plus `active` and timestamps where needed for archiving, remain part of the schema. Financial corrections void an erroneous record with a reason; replacement is an explicit new record. Voiding a receivable requires its payments to be voided first. This is correction bookkeeping, not a refund/credit engine. Export includes void history; operational totals exclude voided entries.

## UGC policies

- Campaigns: draft, active, completed, cancelled. Completion requires all deliveries completed/cancelled; cancellation requires no active outstanding receivable. Reopening is explicit. Financial balances remain independent of delivery status. Cancellation preserves agreed fees and recorded hours/costs in historical economics; revise the agreed fee explicitly if the agreement changed, respecting issued receivables. Cancelled deliverables retain effort already entered.
- Deliverables: planned, in_progress, review, completed, cancelled. Status changes are explicit; hours/revisions are nonnegative. Missing actual hours remain unknown, distinct from zero.
- Receivables cannot exceed the campaign agreed fee in total. Lower totals are allowed and visibly represent an unbilled difference. Fee cannot be reduced below issued active receivables. Overpayments are rejected. Money inputs are cent-precision, represented in cents during calculations; final hourly displays use half-up rounding.
- Rights belong to a deliverable/campaign, have an optional end date (blank means unspecified, never assumed perpetual), and active/expired/renewed/closed states. Renewal value is a proposal, excluded from amounts owed until explicitly agreed/billed. Rights that are renewed/closed leave attention lists.
- Date-only values use ISO dates and installation timezone; no UTC conversion of user-entered dates. Default is America/Sao_Paulo; locale/currency/timezone are configurable.
- Archive brands only without open campaigns; archived records remain in history and exports.

## Backup and migration

Export one UTF-8 CSV per table and metadata; quote every cell and prefix formula-like text with an apostrophe, recorded as `apostrophe-v1` encoding and reversed on import. This protects spreadsheet opening while preserving exact round trips. UI downloads a ZIP with CSV files and accepts that ZIP or the CSV set. Import only into an installation with no business records; validate all files/types/references/metadata before any write. Retain the source. Schema 1 backups migrate by adding a blank `origin_source` to existing campaigns; schema 0 metadata-only bootstrap also remains supported. Unsupported future versions fail clearly rather than guessing a migration.

## Validation boundaries

A browser-local preview uses the same domain/service code and synthetic data but is explicitly labelled local validation mode, separate from Google storage. It supports review while Google installation is pending. Live Sheets, Google consent, private deployment and a real-phone check are separate acceptance gates; local tests do not certify them.

References: [bound scripts](https://developers.google.com/apps-script/guides/bound), [web-app manifest](https://developers.google.com/apps-script/manifest/web-app-api-executable), [atomic Sheets batches](https://developers.google.com/workspace/sheets/api/guides/batch).
