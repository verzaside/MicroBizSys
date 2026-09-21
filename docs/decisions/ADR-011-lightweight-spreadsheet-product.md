# ADR-011 — Lightweight Spreadsheet Product

**Status:** Accepted

## Context

The product owner clarified that this is a polished spreadsheet product and that software code should remain as light as practical to keep operation fluid, nimble, and responsive.

## Decision

Use native Google Sheets capabilities where they adequately serve reporting and presentation. Add thin HTML interfaces and Apps Script logic where needed for guided workflows, data integrity, deterministic calculations, and reuse.

The product owner further clarified that polished HTML/CSS forms and intuitive guidance are central to usability. Treat visual quality, clear next actions, and helpful validation/feedback as core requirements. Keep their implementation lightweight while preserving the intended user experience.

Keep the existing separation of UI, services, domain logic, and persistence. Implement those boundaries with the smallest practical structure for the workflow being shipped; they do not mandate a large application framework.

## Consequences

- Do not rebuild adequate Sheets capabilities solely to resemble a standalone software product.
- Routine workflows must remain guided and must not depend on editing raw system tables.
- Critical business rules remain testable and independent of arbitrary sheet coordinates.
- Avoid speculative frameworks, background automation, and layers without a concrete workflow need.
- Evaluate responsiveness on representative product workflows; code size alone is not a performance guarantee.
