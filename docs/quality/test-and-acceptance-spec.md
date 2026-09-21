# Test and Acceptance Spec

## Quality objective

A low-price one-time-purchase product cannot depend on high-touch support. Reliability and recoverability are product economics requirements.

## Test layers

### Domain unit tests
Examples:
- recipe cost;
- BOM explosion;
- margin;
- effective hourly rate;
- payment balance;
- planned-vs-actual variance;
- unit conversions.

### Service/workflow tests
Examples:
- create order;
- convert quote to project;
- record payment;
- update ingredient price;
- create campaign + deliverables.

### Repository adapter tests
Validate:
- ID lookups;
- row serialization;
- schema checks;
- batch writes;
- archive behavior.

### Migration tests
Every migration must test:
- valid prior schema;
- partially invalid schema;
- rerun/retry behavior where intended;
- preservation of representative data.

### Localization tests
Validate:
- message-key presence;
- currency/date/number formatting;
- unit labels;
- layouts with representative translated strings.

### CSV export, restore, and transfer tests

Validate:
- export/restore round trips preserve records, IDs, relationships, archived data, and historical amounts;
- accents, commas, quotes, line breaks, dates, leading-zero identifiers, and empty values survive serialization;
- metadata identifies product/schema and currency/unit context;
- transfer into a corrected workbook works for supported schema versions;
- incomplete/incompatible exports, duplicate IDs, broken references, and interrupted/retried imports fail safely;
- exported tables can be read independently in another CSV-capable tool;
- the original workbook remains available until transfer is verified.

### Interaction and device validation

Validate fluid, responsive operation on representative data and workflows. Prefer lightweight implementation over framework complexity; set concrete acceptance expectations per implementation issue.

For every product, resolve whether mobile is needed at launch. When required, test the essential actions on the intended mobile device/surface, including save/failure feedback. Responsive desktop layout is not sufficient evidence.

### Integrity tests
Validate:
- missing table/column detection;
- duplicate IDs;
- broken references;
- invalid enum values;
- malformed numeric/date fields.

## Deterministic finance examples

Every pricing/costing feature must include examples with known expected outputs.

Example recipe:
- ingredient A: 2 units × 3.00 = 6.00
- ingredient B: 1 unit × 4.00 = 4.00
- packaging: 2.00
- labor: 5.00
- overhead: 3.00
- batch cost = 20.00
- yield = 10
- unit cost = 2.00

Tests must define rounding policy explicitly.

## Acceptance checklist for a feature

For a workflow with guide content, use the same synthetic inputs/expected outcomes in the core explanation, system review scenario and relevant tests. Record text review and system verification separately in the [guide coverage map](../guides/README.md). Check unfamiliar industry claims against appropriate sources; owner comprehension alone is not domain verification.

Check that each reader-facing guide lesson is understandable and usable without purchasing the OS or following its UI. Keep product-specific rules and walkthrough steps in separate help/review documents. Product mentions should be removable without breaking the educational content; the guide must be suitable for independent sale.

- [ ] Requirement traced to a product/architecture document.
- [ ] Input validation defined.
- [ ] Success path tested.
- [ ] Failure path tested.
- [ ] User-facing error is understandable.
- [ ] Persistence changes use repositories/adapters.
- [ ] Schema change includes migration.
- [ ] Localization implications handled.
- [ ] Diagnostic implications handled.
- [ ] No unnecessary OAuth scope added.
- [ ] Documentation updated.
- [ ] Relevant core Guia Rápido section and shared example updated; pending owner feedback explicitly recorded.
- [ ] Manual smoke test instructions provided if UI is involved.

## Release gate

Before first commercial release:
- no known critical data-loss defects;
- migrations tested;
- System Check implemented;
- CSV backup/export and restore/corrected-workbook transfer path documented and tested;
- mobile launch requirement resolved, with required actions validated on the intended surface;
- sample data/onboarding tested with target users;
- core guide explanations and implemented workflows reconciled through joint review;
- permissions/scopes documented;
- version metadata visible to support;
- product can be used without touching raw data tables for routine workflows.
