# ADR-010 — Guias Rápidos as Acquisition/Education Layer

**Status:** Accepted

## Decision

Niche Guias Rápidos are the education/acquisition layer for the management-system portfolio.

They are standalone educational publications that can be sold independently of the OS. Readers must be able to apply the methods without buying the system. Write product help/manuals separately; the guide is literature that leads naturally toward the OS, not instructions for operating it.

Canonical funnel:

```text
Guia → BackOffice OS
```

No default intermediate “Kit” product.

Core guide content is also developed alongside the corresponding system workflows. The product owner reads the relevant text while validating each slice, reconciling concepts, terminology, examples and system behavior. The guide retains its standalone educational value.

## Consequences

Guides teach the operating method and concepts but avoid providing full operational templates that substitute for the OS.

Keep screen instructions and product-specific validation rules in help/review material. Any invitation to the OS must be removable without diminishing the lesson; never withhold essential explanations to require a system purchase. Product-owner clarification on 2026-09-17 explicitly confirmed this standalone commercial/editorial role.

Deliver paired guide sections and system review scenarios incrementally; do not require a complete book before implementation. Record text review and software verification separately. Verify unfamiliar niche-specific claims rather than treating owner approval as domain evidence. This development/validation role was clarified by the product owner on 2026-09-17.
