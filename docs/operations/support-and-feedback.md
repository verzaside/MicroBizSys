# Support and Feedback Standard

## Support principle

Supportability is a core product requirement because the commercial model is one-time purchase.

Target outcome:
> Most customers should reach first value and perform routine workflows without contacting support.

## Onboarding

Each product should guide a new user through:
1. welcome / permissions explanation;
2. basic business settings;
3. first party/customer/client;
4. first product/service/recipe as applicable;
5. first commercial job/order/campaign/project;
6. first financial outcome;
7. dashboard/attention view.

## In-product help

Provide:
- concise contextual help;
- examples;
- validation messages;
- links to a product guide/FAQ;
- setup checklist.

Avoid relying on a long manual as the only onboarding mechanism.

## Customer backup and recovery

Provide a guided download of CSV data tables and the metadata/configuration needed to restore them. Explain how to keep the files, use them in another tool, and restore them into a compatible workbook without raw-table manipulation.

When a bug fix is delivered as a corrected workbook, document the validated transfer steps, supported source versions, and how to confirm success. Keep the old workbook until the customer has verified the transferred data. Report incompatible or incomplete backups clearly.

No paid upgrades are planned. Support duration and release cadence remain unspecified; do not imply an unlimited ongoing service commitment.

## Diagnostics

Provide a privacy-safe “Generate diagnostic” function.

Suggested report:

```text
Product
Product version
Schema version
Locale
Integrity check results
Last known operation
Stable error code
Relevant module state
```

Do not include names, customer lists, revenue, or sensitive business data by default.

## Support boundaries

Default support covers:
- installation/setup defects;
- product bugs;
- documented workflow questions;
- migration/recovery issues.

Default support does not include:
- custom fields/workflows for one customer;
- bookkeeping/accounting advice;
- tax/legal advice;
- rebuilding intentionally modified raw tables without available backup;
- unrelated Google account/device troubleshooting.

## Feedback

Early product learning should rely on:
- 5–10 deliberate beta users per niche where practical;
- structured feedback questions;
- observed workflow friction;
- support issue categorization.

High-value questions:
- What did you try to do that you could not?
- What are you still tracking elsewhere?
- Which fields/screens did you ignore?
- What information do you check every day?
- Which step required explanation?
- What would make you stop using the product?

## Telemetry

No remote behavioral telemetry is required for V1.

If telemetry is introduced later:
- make it optional or transparently disclosed as appropriate;
- minimize collected data;
- avoid collecting customer business records;
- document purpose and retention.
