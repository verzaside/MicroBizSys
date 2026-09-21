# UX Standard

## Product experience goal

The product is a polished, focused spreadsheet with a deliberately designed HTML/CSS experience. Guided forms, intuitive navigation, clear next actions, and helpful feedback are core requirements for routine use. Use native Sheets views and reporting where they work well, and keep the supporting implementation lightweight, fluid, and responsive.

Routine users should not need to understand normalized tables, formulas, ranges, or Apps Script.

## Visual direction

Desired tone:
- modern;
- lightweight;
- professional;
- serious;
- calm;
- not colorful consumer SaaS;
- not old accounting software.

### Working palette

- Deep marine: `#16324F`
- Dark marine hover: `#10263C`
- Slate blue: `#365A78`
- Main background: `#F4F6F8`
- White card: `#FFFFFF`
- Cool grey: `#E9EDF1`
- Soft silver: `#C7CDD4`
- Charcoal text: `#20262D`
- Secondary text: `#66717D`
- Muted green: `#3F7D5A`
- Muted amber: `#B9862D`
- Muted red: `#A94A4A`

Silver/chrome is restrained: borders, dividers, icons, subtle details; no skeuomorphic metallic effects.

Typography direction:
- Inter
- Segoe UI
- Roboto
- Arial fallback

Buttons:
- modest radius, roughly 6–8px;
- obvious primary action;
- no excessive pill styling.

Icons:
- simple line icons;
- consistent visual weight.

## Information architecture

### Home/dashboard

Prioritize:
1. 3–5 key KPIs;
2. one key operational trend or summary;
3. profitability/status;
4. attention/action list;
5. obvious primary actions.

Avoid decorative chart walls.

### Forms

- use visually polished HTML/CSS forms for routine data entry and actions;
- progressive, task-oriented grouping;
- sensible defaults;
- immediate field validation;
- do not expose system IDs;
- searchable selectors when lists grow;
- clear Save/Cancel behavior;
- success feedback that confirms what changed.

The user should understand what to enter, why it matters when explanation is needed, and what to do next. Show guidance at the point of use and reveal additional fields or steps only when relevant. Use multi-step forms only when they make the task easier.

### Empty states

Every major screen should explain:
- what the area is for;
- the first useful action;
- what the user gains from completing setup.

## Desktop vs mobile intent

Desktop baseline:
- configuration;
- product/service setup;
- pricing;
- detailed planning;
- reports;
- bulk management.

Potential mobile actions, selected according to each niche's launch needs:
- new customer;
- quick quote/order;
- payment;
- expense;
- hours;
- status updates;
- today's work.

Design responsive components from V1. For each product, establish whether mobile is required at launch and which actions must work. Validate those actions on the actual intended mobile surface; responsive desktop HTML alone is not sufficient. Delivery architecture remains undecided until the relevant product requires it.

## Raw Sheets

Raw system tables should be:
- hidden/protected where practical;
- clearly labeled if visible;
- not linked as the primary workflow.

Reporting sheets may remain user-readable.

## Accessibility

- sufficient contrast;
- labels not communicated only by color;
- keyboard-friendly form controls where practical;
- status icons paired with text;
- readable base font size;
- error messages associated with fields.

## Localization

Never bake Portuguese text directly into reusable UI components. Use message keys.

Layouts should tolerate longer English/Portuguese labels without breaking.

## Supportability

Errors should say:
- what happened;
- what the user can do;
- whether data was saved.

Prefer:
> “Ingredient price is missing. Add a purchase price before calculating recipe cost.”

over:
> “Error 500 / undefined.”
