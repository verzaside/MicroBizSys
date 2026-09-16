
# BackOffice OS
Documentation-first repository for a modular portfolio of lightweight management systems for owner-operated microbusinesses.

- Status: architecture and product definition phase.
- Primary market: Brazil.
- Commercial model: one-time purchase.
- Technology direction: Google Sheets + Google Apps Script + HTML/CSS/JavaScript.

# Product thesis
BackOffice OS is not intended to be a generic ERP. It is a reusable platform for building small, niche-specific operating systems for businesses that have outgrown WhatsApp, notebooks, and ad-hoc spreadsheets but do not need or want a full SaaS ERP.

The customer experience should feel like a small vertical application, not an 18-tab spreadsheet. Google Sheets is primarily the customer-owned data/reporting layer; HTML/CSS/JS provides the intended interaction layer.

# Canonical principles
* Brazil first; architecture is localization/internationalization-ready for later U.S. products.

* One-time purchase; no subscription dependency in the core business model.

* Customer-owned Google Sheet and data.

* Apps Script business/service layer.

* HTML/CSS/JS desktop V1 user experience inside Google Sheets.

* Mobile-ready component strategy from V1; standalone mobile web app is a later phase.

* Shared reusable modules + niche-specific modules.

* Clear separation between UI, services, domain logic, and data access.

* Minimal to no OAuth scopes.

* Versioning, schema migrations, backup/export, integrity checks, and diagnostics from the first shipped product.

* Customer release code may be visible; IP secrecy is not a design dependency.

* Avoid hidden background automation unless the value clearly justifies it.

* Do not become accounting/tax software or a general-purpose ERP.

# First reference-build wave
* UGC OS — creator/service workflow reference.

* Personalizados OS — order/BOM/inventory workflow reference.

* Maquete OS — project/scope/labor/change-order workflow reference.

A Food / Recipe Costing family is now part of the planned portfolio and should reuse the Orders + BOM + Inventory + Finance backbone.

# Repository map
backoffice-os/
├── AGENTS.md
├── README.md
├── .gitignore
├── .editorconfig
├── .github/
├── docs/
│   ├── business/
│   ├── architecture/
│   ├── products/
│   ├── decisions/
│   ├── quality/
│   └── operations/
└── products/
    ├── ugc/manifest.yaml
    ├── personalizados/manifest.yaml
    ├── maquete/manifest.yaml
    └── food/manifest.yaml
# Source-of-truth hierarchy
When documents disagree, use this authority order:

1. Architecture Spec

2. Module Catalog + Canonical Data Dictionary + Interface Contracts

3. UX Standard + Localization Standard

4. ADRs

5. Product Manifest

6. Product Spec

# Implementation

If a new decision conflicts with a higher-authority document, update the higher-authority document and add an ADR before implementation.

Implementation status
No production implementation is intentionally included in this starter. The next step is to create implementation issues/vertical slices from these documents.
