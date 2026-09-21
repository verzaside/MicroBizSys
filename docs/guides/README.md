# Guides and System Validation

## Purpose

Develop the core Guia Rápido text alongside each product workflow. The guide teaches the operating method; the system puts it into practice. The product owner reads the relevant text while validating the system so that confusing terminology, missing steps and inconsistent results can be corrected together.

The guide is a standalone educational publication that can be sold without the system. Write for readers who may never buy UGC OS: teach the work, reasoning and practical habits independently of any software. It also serves as an acquisition funnel to the system; product instructions belong in separate help/walkthrough material.

This complements the guide's education/acquisition role. Do not wait for a finished book before building, and do not postpone all core writing until after implementation. Publication layout and final editing can follow validated workflows.

## Working cycle

1. Identify the reader's learning need and the workflow being developed. Separate general operating concepts from product-specific behavior.
2. Draft its short `pt-BR` explanation: concept, why it matters, synthetic example, and what the reader should understand afterward.
3. Implement the same scenario and use its expected results in fixtures/tests where practical.
4. Deliver the standalone guide section alongside a separate system review scenario. Keep screen steps, validation rules and implementation status out of the publication text; mark unbuilt UI steps as proposed in the review material.
5. The product owner reads and exercises the scenario. Record questions and mismatches; update the guide, UI, rules or tests as appropriate.
6. Record guide review and system verification separately. A clear explanation does not prove correct code; passing tests do not prove understandable guidance.

UGC is also a learning exercise for the product owner. Do not treat their review as independent verification of unfamiliar industry practices. Check niche-specific factual claims against suitable primary sources and record sources in editorial notes before presenting them as established practice. Separate product-defined metrics from industry conventions. Rights/contract, tax or other specialized claims need appropriate sourcing and scope discipline; do not invent advice to fill a chapter.

No autonomous messages to beta users or external publishing are part of this workflow.

## UGC coverage and review map

Current source: [Guia Rápido UGC — working draft](ugc-guia-rapido.md). All nine core sections and a practical closing are drafted. The owner liked the initial draft's context/example pattern and requested the remaining topics in that style; the new sections still await review. All system work and formal joint validation remain pending.

| Guide section | Paired system slice | Shared example / review check | Text | System | Owner review |
|---|---|---|---|---|---|
| 1. Marca, campanha e entrega | Brand/campaign/deliverable forms | One fictional brand, one campaign, two deliverables; explain each relationship and record how the opportunity was discovered separately from usage channels | Draft | Beta implemented; owner validation pending | Pending |
| 2. Combinado, a receber e recebido | Receivable and payment | R$ 1.200,00 owed, R$ 400,00 received, R$ 800,00 outstanding; no double counting | Draft | Not implemented | Pending |
| 3. Despesas, contribuição e horas | Expense/hour entry and campaign economics | R$ 150,00 expense, 6 hours; R$ 1.050,00 contribution and R$ 200,00/h | Draft | Not implemented | Pending |
| 4. Prazos e próximos passos | Deliverable status and attention | As of 09/10/2026, 08/10 delivery overdue but 15/10 payment not yet due; illustrative statuses are not implementation decisions | Draft | Not implemented | Pending |
| 5. Revisões e tempo previsto/realizado | Revisions and hour entry | One included round per video is hypothetical; alternative 8-hour scenario gives R$ 150,00/h | Draft | Not implemented | Pending |
| 6. Condições de uso e renovação | Rights records and expiry attention | Fictional November usage period; R$ 300,00 renewal proposal does not become owed/received money | Draft | Not implemented | Pending |
| 7. Resultados e atenção | Campaign/client economics and dashboard | Campaign B: R$ 1.800,00, R$ 600,00 expense, 12 hours; combined rate R$ 166,67/h | Draft | Not implemented | Pending |
| 8. Rotina de acompanhamento | Required mobile actions | Capture work/hours/payment once and reconcile with main records; separate review exercises the chosen phone interface | Draft | Not implemented | Pending |
| 9. Preservação dos registros | CSV export/restore and System Check | Ownership and accessible backup concepts; example retains baseline relationships/amounts; exact restore procedure belongs in help | Draft | Not implemented | Pending |

Keep this map current with links to implementation issues/tests when they exist. On review, record date, observed difficulty, expected/actual result and resolution. Preserve unresolved items; do not mark owner review complete on the owner's behalf.

## Guide versus product help

The core guide remains useful independently: explain concepts and use worked examples without distributing a substitute management workbook or full calculator. Keep exact button-by-button instructions in clearly identified product walkthroughs/help and align them with the implemented release. Both may be reviewed together, but unbuilt screens must not be described as available.

The publication may include brief, clearly separated invitations to UGC OS when its actual available capabilities support them. Teach the complete method first; do not withhold essential explanations to force a purchase. Product mentions must be removable without breaking any lesson. Do not imply availability or invent a purchase link before release.

Publication review check: could someone who never buys the system understand and apply each lesson using their own records? Would this chapter still provide value with every product mention removed?

## Editorial notes for the current draft

- The initial example is fictional: R$ 1.200,00 agreed, R$ 400,00 received, R$ 150,00 in direct campaign expenses and 6 hours. It illustrates the stated calculation bases, not a market price or universal UGC accounting standard.
- Product rules such as rejecting an R$ 801,00 payment against an R$ 800,00 balance remain in the [system scope/review scenario](../products/ugc-v1-review.md), not the standalone guide.
- The guide's contribution/hourly example and the accepted UGC calculations remain aligned, but product decisions are not external evidence. Verify industry claims against appropriate primary sources before adding them.
- Future reader-facing chapters should explain methods and judgment; development status, implementation links and test records stay here or in separate product help.

## Expansion notes and source verification — 2026-09-17

Each new section follows brief context → concrete example → interpretation → comprehension question. This is educational coverage of V1 concepts, not a claim that V1 exists or that every implementation rule is settled. Editorial suggestions do not add software features, status enums, automatic reminders or contract terms to the product scope.

The 8-hour revision scenario is explicitly an alternative; the baseline stays at 6 hours. The second-campaign comparison uses R$ 1.800,00 agreed, R$ 600,00 expenses and 12 hours. Combined agreed amounts are R$ 3.000,00, expenses R$ 750,00, contribution R$ 2.250,00 and hours 18; the aggregate hourly metric is total amount divided by total hours, rounded to R$ 166,67/h. Example dates, revision limits, rights conditions and renewal value are fictional, not industry benchmarks.

Primary references checked for the new material:

| Source | What it supports | Editorial boundary |
|---|---|---|
| [Lei nº 9.610/1998, updated text, Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/lei/1998/lei-9610-19-fevereiro-1998-365399-normaatualizada-pl.html) | Article 31: different uses are not automatically covered by one authorization | Do not decide a reader's legal rights or interpret a particular contract; fictional scope/dates are organizing examples |
| [CERT.br — Backup](https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf) | Copies in different locations, suitable frequency, access protection and checking backups | General record-preservation habits; no claim that this product automates backup |
| [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180) | CSV as text records/fields for data interchange | Explains the file concept, not universal import compatibility or a selected application serialization contract |

Sources are linked near the corresponding claims in the reader draft. Calculations and workflow scenarios are original fictional examples. Statuses, revision agreements and suggested routines are explicitly illustrative; no claim is made that they are universal UGC standards. Further niche-specific guidance still requires evidence and review.

References: [guide strategy](../business/guide-os-funnel.md), [UGC product scope](../products/ugc-os.md), [accepted scope review](../products/ugc-v1-review.md), and [quality standard](../quality/test-and-acceptance-spec.md).
