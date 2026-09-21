# Localization and Internationalization Standard

## Canonical decision

Brazil is the first market. The platform must be localization-ready from V1 so later U.S.-focused products do not require a structural rewrite.

This is an architecture requirement, not a mandate to build U.S. product features now.

## Internal language

Canonical identifiers use neutral English-like machine names:
- `amount`
- `customer_id`
- `tax_id`
- `due_date`
- `region`
- `postal_code`

Avoid:
- `valor_reais`
- `cpf_cliente`
- `cep`
- `data_entrega_br`

## Locale packs

At minimum plan for:
- `pt-BR`
- `en-US` later

UI text must be referenced through message keys.

Example:

```text
new_order
amount_due
customer
payment_received
```

## Currency

Configuration defines currency separately from amount.

Do not store formatted currency strings as numeric data.

Example:
- canonical value: `1250.50`
- pt-BR presentation: `R$ 1.250,50`
- en-US presentation: `$1,250.50`

## Dates

Store canonical date values; format at UI/report boundary.

Examples:
- pt-BR: `30/09/2026`
- en-US: `09/30/2026`

## Addresses

Canonical fields:
- address lines
- city
- region
- postal code
- country code
- tax ID

UI labels vary by locale/product.

## Units

Use explicit dimensions:
- mass
- volume
- length
- area
- count
- time

Support metric first where appropriate.

Plan for later U.S. units such as:
- oz/lb
- in/ft
- fl oz/cup/tbsp/tsp

Do not assume volume-to-mass conversion is universal. Food conversions may be ingredient-specific.

## Tax/compliance boundary

Localization readiness does not mean implementing:
- U.S. sales-tax engines;
- federal/state compliance;
- Brazilian DAS/Simples automation;
- fiscal invoice automation.

Such features require separate product decisions.
