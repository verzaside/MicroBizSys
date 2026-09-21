# Product Strategy

## Purpose

Build a portfolio of one-time-purchase, niche-specific management systems for owner-operated microbusinesses.

The products sit between:
- ad-hoc notebooks / WhatsApp / basic spreadsheets; and
- full subscription ERP/SaaS products.

The strategic middle ground is:

> **A polished, niche-specific spreadsheet with guided workflows, customer ownership, and a one-time price.**

This remains a spreadsheet product. Add only the software code needed for useful guidance, reliable operations, and reuse; keep the experience fluid, nimble, and responsive.

## Primary customer

Brazilian owner-operators, including MEIs and similarly small businesses that:
- run much of the business themselves;
- have recurring operational and financial organization pain;
- are too small for a full ERP;
- dislike recurring software subscriptions;
- benefit from understanding what work is due, what it costs, what is owed, and what is profitable.

Do not narrowly require formal MEI status in all positioning. Many useful niches include autônomos and other owner-operated businesses.

## Commercial model

Canonical direction:
- one-time purchase;
- no mandatory subscription;
- no required vendor-hosted database;
- no recurring hosting cost required for the core product.

One and done: do not plan paid upgrades or recurring charges. Version numbers track fixes and compatibility; they do not imply a paid-upgrade model. Support duration and release cadence remain unspecified and should not be inferred as an unlimited ongoing service promise.

## Portfolio model

One shared platform supports multiple commercial products through reusable modules and product manifests.

The living [Product Portfolio Roadmap](../roadmap/product-portfolio.md) preserves all mapped niches, their reuse opportunities, and launch-readiness questions. Review it after the first product and as workflow evidence arrives; candidates are not current implementation scope.

### First reference-build wave

1. UGC OS
2. Personalizados OS
3. Maquete OS

### Planned/high-interest families

- Food / Recipe Costing / Home Bakery / Confeitaria
- Party/Event Rental
- Solo Technician/Service
- TikTok Shop / Affiliate Creator
- Handmade/Artesanato
- Marcenaria/custom woodworking
- 3D printing
- Atelier/seamstress
- Photographer (lower priority)
- small reseller
- other niche adaptations after platform validation

## Brazil-first, international-ready

Commercial execution remains focused on Brazil.

Architecture must allow later U.S.-focused products by localizing:
- language;
- currency;
- date and number formats;
- addresses and tax-ID labels;
- measurement/unit systems.

Do not let U.S. requirements delay or enlarge Brazilian V1.

## Mobile by niche

Some niches may require mobile usage in their first commercial release. Assess essential mobile actions per product before fixing launch scope. Keep services reusable and components responsive now; select and validate an actual mobile delivery approach when a product requires it. Mobile is not automatically deferred for every niche.

## Competitive differentiation

Features alone are not sufficient differentiation. Many existing templates already offer interconnected tables, dashboards, costing, orders, and inventory.

The intended differentiation is:
1. niche-specific workflow;
2. polished HTML/CSS UX with intuitive guided forms, navigation, and feedback;
3. guided actions instead of spreadsheet navigation;
4. customer-owned data;
5. one-time price;
6. reusable but deeply contextualized domain workflows;
7. supportability and data integrity better than typical templates.

## What we are not building

- generic ERP;
- full accounting platform;
- automated Brazilian tax/DAS/Simples engine;
- U.S. sales-tax engine;
- high-concurrency multi-user enterprise system;
- marketplace-sync platform;
- invoicing/fiscal-compliance SaaS;
- remote backend solely for IP protection;
- open-ended custom spreadsheet consulting.

## Product economics constraint

Support time must remain low enough for one-time-purchase economics.

Product decisions should favor:
- self-service onboarding;
- guided workflows;
- diagnostics;
- narrow product scope;
- reusable modules;
- documentation;
- standardized releases.

Avoid high-touch custom support as a default operating model.
