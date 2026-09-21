# ADR-007 — Customer Release Code Is Not Assumed Secret

**Status:** Accepted

## Decision

Assume customer owners can inspect Apps Script in their copied workbook.

Private source remains readable. Release code may be bundled/minified/obfuscated, but security and product value do not depend on secrecy.

## Consequences

- no secrets in client release;
- no expensive DRM architecture in V1;
- product moat is UX, niche fit, brand, execution, portfolio, documentation, and improvements.
