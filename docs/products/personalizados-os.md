# Personalizados OS — Product Spec

## Role in platform

First-wave reference product validating:
- orders;
- catalog;
- BOM/materials;
- inventory;
- purchasing;
- finance;
- product/job profitability.

## Target user

Small custom-product businesses such as:
- sublimation;
- Cricut/vinyl;
- laser engraving;
- custom mugs/shirts;
- party favors;
- personalized signs;
- similar made-to-order products.

## Core workflow

```text
Customer
  ↓
Order
  ↓
Items
  ↓
Material requirements / BOM
  ↓
Production / fulfillment
  ↓
Payment
  ↓
Profitability
```

## V1 capabilities

### CRM
- customer record;
- order history.

### Catalog
- products/services;
- prices;
- BOM definitions;
- optional variants where simple.

### Orders
- due date;
- status;
- items/quantities;
- discounts/fees;
- payment status.

### BOM / costing
- material quantity per product;
- current material purchase costs;
- waste allowance where needed;
- expected item/order cost.

### Inventory
- basic stock on hand;
- material movements;
- reorder/shortage attention.

### Purchasing
- supplier;
- purchases;
- material cost updates.

### Finance
- receivable/payments;
- expenses;
- order profitability.

### Dashboard
- orders due;
- unpaid orders;
- stock attention;
- revenue/profitability KPIs.

## V1 non-goals

- marketplace live sync;
- fiscal invoicing;
- shipping-carrier integrations;
- complex manufacturing scheduling;
- multi-location warehouse management.
