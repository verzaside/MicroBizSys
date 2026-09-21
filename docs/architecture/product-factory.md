# Product Factory / Build-System Spec

## Objective

Use one private source repository to build and maintain multiple niche products without manually copying divergent workbooks or scripts.

The repository—not any customer workbook—is the canonical source of truth.

Keep assembly and runtime code minimal for the workflows being shipped. Shared modules are maintainable source boundaries, not a requirement for a large framework or a custom implementation of capabilities Sheets already supplies adequately.

## Conceptual flow

```text
Canonical shared source
      +
Niche modules
      +
Product manifest
      +
Locale/configuration
      ↓
Build / assembly process
      ↓
Release-ready product package
      ↓
Customer-owned Google-native installation
```

## Source responsibilities

### Shared source
Contains:
- shared domain logic;
- services;
- repository interfaces/adapters;
- reusable UI components;
- localization infrastructure;
- migrations;
- diagnostics;
- build/release tooling.

### Niche modules
Contain domain logic that is genuinely specific to a workflow:
- UGC rights/deliverables;
- recipe/yield costing;
- project change orders;
- rental reservations;
- equipment capacity.

### Product manifest
Declares:
- product identity;
- market/locale;
- enabled modules;
- product-specific terminology/configuration;
- optional features;
- release metadata.

The manifest should configure a product, not become an alternate codebase.

Mobile planning fields: `phase: per_product_requirement` avoids a global deferral; `required_at_launch` starts as `undecided` and must be resolved to true/false before launch scope is committed; `required_actions` lists the actions to validate. An empty list while undecided means the assessment is pending, not that mobile is unnecessary. `ready_from_v1` expresses a design requirement, not proof that mobile has been implemented or tested.

## Build tooling

Python may be used as an internal developer tool for:
- validating manifests/specs;
- assembling release source;
- generating configuration;
- linting/checking schemas;
- running deterministic tests;
- packaging/minifying/obfuscating customer release code;
- producing release metadata/artifacts.

Python is not required to run on the customer's machine.

If JavaScript/Node tooling later becomes more appropriate for bundling Apps Script and frontend source, it may be introduced without changing the product architecture.

## Release-code principle

Private source:
- readable;
- modular;
- documented;
- tested.

Customer release:
- assembled from canonical source;
- may be bundled/minified/obfuscated;
- must contain no secrets;
- must be traceable to a source revision/version.

## No manual forks

Do not create separate manually maintained code copies such as:

```text
ugc-final-v3
ugc-final-v3-fixed
personalizados-copy-new
```

Differences belong in:
- reusable modules;
- configuration;
- manifests;
- explicit product-specific source directories.

## Build validation

A release build should eventually fail if:
- manifest references unknown modules;
- localization keys are missing;
- migration chain is incomplete;
- schema definitions conflict;
- required acceptance tests fail;
- product/version metadata is missing.

## Generated artifacts

Generated release artifacts belong in ignored build/release directories and are not the architectural source of truth unless a later decision explicitly changes this.

## Relationship to Google Sheets

The build system may eventually:
- generate/bootstrap required system tables;
- install Apps Script source into a template project;
- generate UI bundles/config;
- create release checklists.

The exact deployment automation is not yet locked. Do not prematurely design a complex CI/CD pipeline before the first vertical slice proves the required workflow.
