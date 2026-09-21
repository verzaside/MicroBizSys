# BackOffice OS

Repository for a modular portfolio of lightweight management systems for owner-operated microbusinesses.

> **Status:** UGC OS V1 beta implemented for owner validation; live Google and real-phone verification pending.  
> **Primary market:** Brazil.  
> **Commercial model:** one-time purchase.  
> **Technology direction:** Google Sheets + Google Apps Script + HTML/CSS/JavaScript.

## Product thesis

BackOffice OS is not intended to be a generic ERP. It is a reusable platform for building **small, niche-specific operating systems** for businesses that have outgrown WhatsApp, notebooks, and ad-hoc spreadsheets but do not need or want a full SaaS ERP.

The product is a customer-owned spreadsheet with a polished, guided HTML/CSS experience. HTML forms, intuitive navigation, clear actions, and helpful feedback are central to making routine work easy. Use native Sheets capabilities for suitable views and reporting, and keep the supporting code lightweight, fluid, and responsive.

## Canonical principles

- Brazil first; architecture is localization/internationalization-ready for later U.S. products.
- One-time purchase, one and done; no subscriptions or planned paid upgrades.
- Customer-owned Google Sheet and data.
- Apps Script business/service layer.
- HTML/CSS/JS desktop V1 user experience inside Google Sheets.
- Mobile is required for UGC V1. Its validation build uses a private Apps Script web app; other niches retain per-product delivery decisions.
- Shared reusable modules + niche-specific modules.
- Clear separation between UI, services, domain logic, and data access.
- Minimal OAuth scopes.
- Versioning, schema migrations, backup/export, integrity checks, and diagnostics from the first shipped product.
- Customer-controlled CSV exports of data tables, with a validated restore/transfer path into a corrected workbook.
- Customer release code may be visible; IP secrecy is not a design dependency.
- Avoid hidden background automation unless the value clearly justifies it.
- Do not become accounting/tax software or a general-purpose ERP.

## First reference-build wave

1. **UGC OS** — creator/service workflow reference.
2. **Personalizados OS** — order/BOM/inventory workflow reference.
3. **Maquete OS** — project/scope/labor/change-order workflow reference.

A **Food / Recipe Costing** family is now part of the planned portfolio and should reuse the Orders + BOM + Inventory + Finance backbone.

Keep all mapped niches in the [Product Portfolio Roadmap](docs/roadmap/product-portfolio.md). These are launch candidates after the first product, not a commitment to build them all now.

## Repository map

```text
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
```

## Source-of-truth hierarchy

When documents disagree, use this authority order:

1. Architecture Spec
2. Module Catalog + Canonical Data Dictionary + Interface Contracts
3. UX Standard + Localization Standard
4. ADRs
5. Product Manifest
6. Product Spec
7. Implementation

If a new decision conflicts with a higher-authority document, update the higher-authority document and add an ADR before implementation.

## Implementation status

UGC OS `1.0.0-beta.2` (schema 2) includes guided forms, campaign/client economics, campaign origin tracking, attention, financial corrections, CSV backup/restore and diagnostics. See [installation and joint guide validation](INSTALAR.md), [acceptance evidence](docs/quality/ugc-v1-implementation.md), and [implementation decisions](docs/decisions/ADR-013-ugc-validation-build.md).

Readable source is in `src/` (domain/services/Sheets adapter) and `ui/` (plain HTML/CSS/JS). Run `npm test`, `npm run build`, and `npm run preview` with Node.js. Build outputs the Apps Script package and local preview under `dist/`, plus `dist/ugc-os-v1-beta.zip`. After the one-time `clasp login` and Script ID setup described in [`INSTALAR.md`](INSTALAR.md), run `npm run deploy:google` to build and push updates without pasting files into Apps Script. No frontend framework or third-party runtime library is required. The local preview stores synthetic validation data in the browser; Google installs store canonical data in the customer-owned workbook.

The guide remains a standalone publication. Owner text review and actual workflow validation are tracked separately in [the guide review map](docs/guides/README.md). The beta has not yet passed the live Google or real-device acceptance gates and is not a verified commercial release.
