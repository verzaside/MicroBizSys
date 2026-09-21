# UGC V1 implementation and acceptance

Implements [UGC scope](../products/ugc-os.md), [accepted review](../products/ugc-v1-review.md), [ADR-013](../decisions/ADR-013-ugc-validation-build.md) and guide chapters 1–9.

Acceptance before owner pilot:

- Guided pt-BR setup, brands, campaign origin, deliverable maintenance, rights, receivables/partial payments, expenses and hours; free-text fields expose concise hover guidance.
- Home attention and campaign/client economics match the guide's R$ 1.200 / 400 / 150 / 6 example and the aggregate hourly example.
- Stale writes, duplicate requests, invalid references, overpayments, invalid dates and malformed backups fail without partial data; schema 1 campaign records migrate with blank origin.
- CSV round trip preserves canonical IDs, history, Unicode, quotes, newlines and formula-like text; incompatible/nonempty restoration is rejected.
- Schema checks, privacy-safe diagnostics and versions are available without raw-table editing.
- Responsive navigation exposes required mobile actions; private Google deployment and real-phone validation are explicitly tracked.
- Readable source, deterministic tests, installable Apps Script package and product help are delivered; standalone guide remains educational.

Technical assumptions/policies are recorded in ADR-013. No subscriptions, integrations, telemetry, fiscal invoices, refund engine, offline Google mode or generic ERP modules are added.

Track actual results in the installation/validation documentation and guide coverage map; never substitute implementation for owner review.
