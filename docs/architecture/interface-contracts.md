# Module Interface Contracts

## Purpose

Shared modules communicate through stable commands and DTO-like records rather than direct sheet references.

The exact function signatures may change during implementation, but these responsibilities are canonical.

## UGC V1 transport and implementation mapping

The beta uses one `api({action, payload, operation_id, revision})` endpoint. Successful responses return `{ok:true,data}`; failures return `{ok:false,error:{code,field,issues}}`. UI strings are resolved from error codes; exceptions do not expose customer records. Queries are `load`, `systemCheck`, `export`. Writes require a unique operation ID and the displayed installation revision.

| Canonical responsibility | UGC implementation |
|---|---|
| Create/update/archive party | saveParty with optional party_id; archiveParty toggles active while retaining history |
| Create/update job and campaign | saveCampaign writes both; transitionCampaign synchronizes their status |
| Maintain deliverable, hours and revisions | saveDeliverable with optional deliverable_id |
| Maintain rights / renewal attention | saveRight with optional right_id; renewal_value remains a proposal |
| Issue obligation / record cash received / expense | createReceivable, recordPayment, recordExpense |
| Correct financial input | voidRecord with table, id, reason; replacement is explicit |
| Setup/configuration/recovery | setup, saveSettings, restore, loadSample (empty installation only) |

`UGC.createService` owns dispatch and policy; `SheetStore.create` adapts persistence. The repository contract is `read(fresh?)` and `transact(operationId, revision, fingerprint, fn)`: lock, validate revision/idempotency, apply a pure update to a copy, validate, then atomically commit data plus receipt/revision. Cache bypass is used for System Check/export. Same operation/same fingerprint is safe to retry within the retained 200-operation window; changed payload under the same operation ID is rejected. A full page reload starts a new UI operation: inspect records before repeating an uncertain save.

An Apps Script Sheets batch is the transaction boundary; no UI writes raw cells. Google transport/private deployment require live acceptance in addition to unit/adapter tests. See [ADR-013](../decisions/ADR-013-ugc-validation-build.md) and [implementation evidence](../quality/ugc-v1-implementation.md).

## CRM service

### createParty(input)
Input:
- party type
- display name
- optional contact/address fields

Returns:
- `party_id`
- normalized saved party

### updateParty(partyId, patch)
Must preserve immutable `party_id`.

### getParty(partyId)
Returns canonical party or not-found error.

## JOB service

### createJob(input)
Input:
- `job_type`
- `party_id`
- title
- optional due date / initial status

Returns:
- `job_id`

### transitionJobStatus(jobId, nextStatus)
Validates state transition policy for the product/job type.

## FINANCE service

### createReceivable(input)
May reference:
- `job_id`
- `party_id`

### recordPayment(input)
Must not silently over-apply payments without a defined policy.

### recordExpense(input)
May reference `job_id` for job profitability.

### getJobEconomics(jobId)
Returns at least:
- revenue/receivable summary
- paid amount
- expense/cost summary
- gross contribution/profitability metrics appropriate to product

## Orders service

### createOrder(input)
Expected orchestration:
1. validate customer;
2. create/reuse JOB;
3. create ORDER;
4. create JOB_LINES;
5. snapshot pricing/cost where required;
6. create receivable when configured;
7. return order summary.

### updateOrderStatus(orderId, status)
Must honor product workflow.

## BOM / costing service

### calculateItemCost(itemId, context)
Returns a deterministic cost breakdown.

### getMaterialRequirements(itemId, quantity)
Returns normalized material requirements.

### explodeRequirements(jobId or lines)
Aggregates materials for production/procurement.

## Inventory service

### recordMovement(input)
Requires:
- material/item
- movement type
- quantity
- canonical unit/reference

### getAvailability(materialId)
Returns current calculated availability according to the selected inventory policy.

Do not silently allow negative inventory unless product configuration permits it.

## Project service

### createQuote(input)
Creates planned commercial/cost assumptions.

### convertQuoteToProject(quoteId)
Preserves quote snapshot and creates a project/JOB relationship.

### addChangeOrder(jobId, input)
Tracks revenue/cost deltas independently from original scope.

### getPlannedVsActual(jobId)
Returns comparable planned and actual:
- revenue
- materials
- labor
- other cost
- margin

## UGC service

### createCampaign(input)
Creates JOB + campaign.

### addDeliverable(campaignId, input)

### recordUsageRights(deliverableId, input)

### getCreatorAttentionQueue()
Should support:
- upcoming deliverables
- overdue invoices
- rights expiring soon
- follow-up/renewal opportunities

## Food service

### createRecipe(input)
Creates recipe/yield definition.

### calculateRecipeCost(recipeId, quantityOrBatchContext)
Returns breakdown:
- ingredient cost
- packaging
- waste
- labor
- overhead
- batch cost
- unit cost

### updateIngredientPurchasePrice(ingredientId, purchaseContext)
Updates current input cost without rewriting historical job/order cost snapshots.

### convertIngredientUnit(ingredientId, fromUnit, toUnit, quantity)
Must use ingredient-specific density/conversion when necessary.

## Dashboard/query contracts

Dashboards are consumers of services/query models, not owners of business logic.

Attention lists must return actionable records with stable IDs so the UI can open the underlying entity.

## Error contract

Services should return or throw structured errors with:
- stable error code
- localized/user-safe message key
- diagnostic context safe for logging
- optional field identifier

Avoid exposing raw stack traces to end users.
