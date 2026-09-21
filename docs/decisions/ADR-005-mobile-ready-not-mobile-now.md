# ADR-005 — Mobile-Ready from V1; Delivery Timing by Niche

**Status:** Accepted

## Decision

Frontend components and services are designed to be responsive/mobile-ready from inception. Mobile usage may be mandatory for an individual niche's first commercial release.

Desktop remains the baseline for the reference build. Before committing to a product's launch scope, record whether mobile is required and which actions must work. No niche is assumed to be desktop-only by default. The deployment/auth approach remains undecided until needed.

## Rationale

Sheets mobile does not provide the same custom UI experience as desktop. Prematurely locking deployment/auth architecture could create avoidable complexity.

## Consequences

- responsive HTML components now;
- select and validate mobile-specific deployment/auth when a product requires it;
- desktop emphasizes management/planning/reporting;
- mobile emphasizes capture/status/quick actions according to the niche;
- test launch-required actions on the intended device/surface; responsive layout alone is insufficient.

This decision was amended following product-owner clarification; it replaces the previous blanket deferral of mobile delivery.
