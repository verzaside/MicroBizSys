# Canonical Data Dictionary

This document defines canonical entity/field concepts. Exact storage-column ordering is an implementation detail.

## UGC schema 2 implementation profile

The validation build implements the subset below; the broader catalog in this document is not a claim that every entity is shipped. [ADR-013](../decisions/ADR-013-ugc-validation-build.md) records the policy. The exact typed, ordered schema is `MBS.schemas` in [core.js](../../src/core.js).

| Table | Implemented responsibility / additions |
|---|---|
| installation | Product/version/schema/installation ID, locale/currency/metric units, timezone, business_name, created_at, last_migrated_at and monotonic revision. Installation configuration is stored here; no separate setting table in UGC schema 1. |
| parties | party_id, party_type, display_name, email, phone, notes, active and timestamps; UI creates brands. |
| jobs | Shared parent: job_id, job_type, party_id, title, status, due_date, quoted_amount and timestamps; one per campaign. |
| campaigns | campaign_id, job_id, brand_id, campaign_name, status, agreed_fee, start_date, due_date, notes, timestamps and optional `origin_source` (how the creator learned the opportunity was available). |
| deliverables | deliverable_id, campaign_id, deliverable_type, description, due_date, status, revision_rounds_included/used, estimated_hours/actual_hours and timestamps. Blank hours mean unknown. |
| rights | right_id, campaign_id, deliverable_id, right_type, start_date, end_date, territory, `channels` (where the content may be used), renewal_value, status and timestamps. Blank end_date means unspecified. |
| receivables | receivable_id, job_id, party_id, description, amount, due_date, open/paid/void status, void_reason and timestamps. These are internal obligations, not fiscal invoices. |
| payments | payment_id, receivable_id, job_id, party_id, amount, payment_date, payment_method, reference, active/void status, void_reason and timestamps. |
| expenses | expense_id, optional job_id/party_id, category_key, description, amount, expense_date, active/void status, void_reason and timestamps. No automatic allocation of general expenses. |
| operations | operation_id, request fingerprint, created_at, revision; last 200 successful operations, for retry safety. Technical receipts are regenerated after restore and excluded from data backups. |

Amounts are stored as numeric values; calculations sum integer cents. Dates are `YYYY-MM-DD`; timestamps are UTC ISO strings. `created_at` and `updated_at` apply to all business tables. JSON/service enums remain country-neutral; labels are in `ui/locale.js`. UI categories use production/transport/equipment/other; imports can preserve existing custom category keys.

Backup includes every table above except operations, plus `_backup.csv` metadata, exact headers, row counts and text-escaping version. Restore validates the complete relationship graph before persistence. Financial void records remain in exports; reports exclude void amounts.

## Global conventions

- IDs: opaque immutable strings.
- Dates: canonical ISO-like values internally; locale formatting only at presentation.
- Money: numeric amount + configured currency context; never embed currency in canonical field names.
- Booleans: explicit true/false.
- Enumerations: stable machine keys; localized display labels.
- Names are display attributes, never foreign keys.
- Archiving is preferred over destructive deletion for business records.

## CORE

### installation
- `installation_id`
- `product_id`
- `product_version`
- `schema_version`
- `locale`
- `currency`
- `unit_system`
- `created_at`
- `last_migrated_at`

### setting
- `setting_key`
- `setting_value`
- `setting_type`

## CRM

### party
- `party_id`
- `party_type` — customer / client / brand / supplier / other
- `display_name`
- `legal_name`
- `email`
- `phone`
- `tax_id`
- `address_line_1`
- `address_line_2`
- `city`
- `region`
- `postal_code`
- `country_code`
- `notes`
- `active`
- `created_at`
- `updated_at`

A product may expose simplified terminology while persisting through a shared party model.

## JOB

### job
- `job_id`
- `job_type`
- `party_id`
- `title`
- `status`
- `opened_date`
- `due_date`
- `completed_date`
- `quoted_amount`
- `notes`
- `created_at`
- `updated_at`

## FINANCE

### receivable
- `receivable_id`
- `job_id`
- `party_id`
- `description`
- `amount`
- `due_date`
- `status`
- `created_at`

### payment
- `payment_id`
- `receivable_id`
- `job_id`
- `party_id`
- `amount`
- `payment_date`
- `payment_method`
- `reference`
- `created_at`

### expense
- `expense_id`
- `job_id`
- `party_id`
- `category_key`
- `description`
- `amount`
- `expense_date`
- `created_at`

## CATALOG / ORDERS

### catalog_item
- `item_id`
- `sku`
- `name`
- `item_type`
- `sale_price`
- `active`

### order
- `order_id`
- `job_id`
- `customer_id`
- `order_date`
- `due_date`
- `status`
- `channel`
- `subtotal`
- `discount_amount`
- `fee_amount`
- `total_amount`

### job_line
- `job_line_id`
- `job_id`
- `item_id`
- `description`
- `quantity`
- `unit_price`
- `unit_cost_snapshot`
- `line_total`

## BOM / INVENTORY / PURCHASE

### material
- `material_id`
- `supplier_id`
- `name`
- `purchase_unit`
- `purchase_quantity`
- `purchase_price`
- `canonical_unit`
- `conversion_factor`
- `active`

### bom
- `bom_id`
- `item_id`
- `version`
- `active`

### bom_line
- `bom_line_id`
- `bom_id`
- `material_id`
- `quantity`
- `unit`
- `waste_pct`

### inventory_movement
- `movement_id`
- `material_id`
- `movement_type`
- `quantity`
- `unit`
- `job_id`
- `movement_date`
- `reference`

### purchase
- `purchase_id`
- `supplier_id`
- `purchase_date`
- `status`
- `total_amount`

## PROJECT

### project
- `project_id`
- `job_id`
- `quote_id`
- `scope_version`
- `project_status`
- `planned_start`
- `planned_finish`
- `actual_start`
- `actual_finish`

### quote
- `quote_id`
- `party_id`
- `quote_date`
- `valid_until`
- `status`
- `quoted_revenue`
- `planned_material_cost`
- `planned_labor_cost`
- `planned_other_cost`
- `planned_margin`

### labor_entry
- `labor_entry_id`
- `job_id`
- `task_id`
- `work_date`
- `hours`
- `cost_rate`
- `cost_amount`

### change_order
- `change_id`
- `job_id`
- `description`
- `revenue_delta`
- `cost_delta`
- `approved`
- `approved_date`

## UGC

### campaign
- `campaign_id`
- `job_id`
- `brand_id`
- `campaign_name`
- `status`
- `agreed_fee`
- `start_date`
- `due_date`

### deliverable
- `deliverable_id`
- `campaign_id`
- `deliverable_type`
- `description`
- `due_date`
- `status`
- `revision_rounds_included`
- `revision_rounds_used`
- `estimated_hours`
- `actual_hours`

### usage_right
- `right_id`
- `campaign_id`
- `deliverable_id`
- `right_type`
- `start_date`
- `end_date`
- `territory`
- `channels`
- `renewal_value`
- `status`

## FOOD

### ingredient
May reuse `material`; food products may expose food-specific terminology.

### recipe
- `recipe_id`
- `item_id`
- `name`
- `yield_quantity`
- `yield_unit`
- `prep_minutes`
- `production_minutes`
- `waste_pct`
- `labor_cost`
- `overhead_cost`
- `packaging_cost`
- `active`

### recipe_line
- `recipe_line_id`
- `recipe_id`
- `ingredient_id`
- `quantity`
- `unit`

### ingredient_conversion
- `conversion_id`
- `ingredient_id`
- `from_unit`
- `to_unit`
- `factor`

Ingredient-specific conversions are required for conversions such as cups-to-grams when density matters.

## Extension rule

Product-specific fields should be added only when:
1. the concept cannot be represented by existing canonical fields;
2. the field has a clear domain definition;
3. the product spec defines its lifecycle and reporting use.
