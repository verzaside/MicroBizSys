# ADR-004 — UI-Independent Service Layer

**Status:** Accepted

## Decision

Business/application logic must be callable independently of the desktop Sheets UI.

## Rationale

The same services should support:
- desktop Sheets HTML UI now;
- mobile workflows when required by a niche, including at launch;
- testing without UI;
- future persistence/frontend evolution.

## Consequences

UI code must not own business rules or direct persistence logic.
