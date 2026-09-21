# Food / Recipe Costing OS — Product Spec

## Status

Planned portfolio family. Not part of the original first-three reference-build wave, but considered a high-potential follow-on niche.

## Target users

Examples:
- confeiteiras/home bakers;
- brigadeiro/doces businesses;
- salgados;
- marmitas/meal prep;
- small caterers;
- cottage-food businesses in future U.S. localization.

## Product thesis

The system should answer:
- What does this recipe actually cost?
- What should I charge?
- What is my real margin?
- What ingredients do I need for upcoming orders?
- What should I buy?
- Which orders/production tasks are due?

## Core workflow

```text
Ingredient / Purchase Price
  ↓
Recipe + Yield
  ↓
True Batch / Unit Cost
  ↓
Sellable Product
  ↓
Customer Order
  ↓
Production Requirements
  ↓
Inventory / Shopping Shortage
  ↓
Payment / Profitability
```

## Costing

Recipe cost may include:
- ingredients;
- packaging;
- expected waste;
- direct labor;
- overhead allocation;
- payment/platform fees where configured.

Outputs:
- batch cost;
- unit cost;
- current selling-price margin;
- optional target-margin price guidance.

## Unit conversion

Support safe conversions within dimensions.

Examples:
- g ↔ kg
- mL ↔ L
- units ↔ dozen/package when configured

For volume-to-mass food conversions such as cups-to-grams, use ingredient-specific conversion data. Never assume universal density.

## Reuse

Food should reuse:
- CRM
- CATALOG
- ORDER
- BOM/material concepts
- INVENTORY
- PURCHASE
- FINANCE
- DASHBOARD
- UNITS

`RECIPE` is a food-specialized composition/yield view over shared costing concepts.

## V1 non-goals

- nutrition facts compliance;
- food-safety certification;
- tax/accounting;
- delivery marketplace sync;
- restaurant POS;
- table service;
- kitchen display system.
