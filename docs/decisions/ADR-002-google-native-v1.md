# ADR-002 — Google-Native V1

**Status:** Accepted

## Decision

Desktop V1 uses:
- Google Sheets for customer-owned persistence/reporting;
- Google Apps Script for application/domain logic;
- HTML/CSS/JavaScript for intended UX inside Sheets.

## Rationale

- no Excel license dependency;
- easy distribution by copy;
- customer owns data;
- low/no vendor hosting cost;
- compatible with one-time-purchase model;
- enables a polished spreadsheet experience with lightweight guided interfaces.

## Consequences

- code in copied bound script is customer-visible;
- update/migration architecture is required;
- Apps Script quotas/scopes must be respected;
- mobile delivery remains an open architectural decision and may be needed at a niche's launch; see ADR-005.
