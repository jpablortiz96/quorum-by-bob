---
name: verdict-only
description: Invokes only The Judge to synthesize existing draft outputs and produce the final verdict + ADR. Use when Round 1 and Round 2 reports already exist.
slash_command: /verdict
usage: /verdict
estimated_cost: 0.3 Bobcoins
---

# /verdict — Invoke The Judge on Existing Drafts

## Usage

```
/verdict
```

No arguments needed. The Judge reads from `docs/decisions/draft/`.

## Prerequisites

Before running `/verdict`, the following files must exist in `docs/decisions/draft/`:
- `conservative-round1.md`
- `reformer-round1.md`
- `historian-round1.md`
- `economist-round1.md`
- `risk-officer-round1.md`
- `engineer-round1.md`
- `conservative-round2.md` (optional but recommended)
- `reformer-round2.md` (optional but recommended)

## What This Command Does

Activates The Judge mode only. The Judge reads all available draft files, synthesizes the evidence, calculates the Decision Confidence Score, and produces the final ADR.

## When To Use

- After a partial `/council` session where only some rounds completed
- When you want to re-run the verdict with updated Round 2 inputs without re-running all six Round 1 agents
- When manually editing draft files with additional evidence found outside Bob

## Instructions for Bob

When this command is invoked:

1. Read all files present in `docs/decisions/draft/`.
2. Activate The Judge custom mode.
3. The Judge synthesizes the available evidence. If any Round 1 report is missing, note it as "Agent did not participate" and reduce the Council Consensus score accordingly.
4. The Judge produces the Verdict Summary and the full ADR.
5. Save the ADR to `docs/decisions/ADR-[YYYY]-[NNN]-[slug].md`.
6. Clear the `docs/decisions/draft/` folder after successful verdict.
7. Report the ADR filename and the final Decision Confidence Score to the user.

## Cost Note

Single-agent synthesis. Estimated cost: **0.3 Bobcoins**.
