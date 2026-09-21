# ADR-006 — Brazil First, Internationalization Ready

**Status:** Accepted

## Decision

Commercial development focuses on Brazil.

Canonical architecture is country-neutral and supports later localization, especially `en-US`, without major refactoring.

## Consequences

Required from V1:
- externalized strings;
- configurable locale/currency/date/number formats;
- unit abstraction;
- country-neutral field names.

Not required now:
- U.S.-specific products;
- U.S. tax/compliance;
- U.S. launch operations.
