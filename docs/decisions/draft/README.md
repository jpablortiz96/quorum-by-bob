# Quorum Council - Draft Decision Files

This directory contains working documents from active council sessions.

## Structure

```
draft/
  the-<agent>-round1.md       Opening statements (Round 1)
  the-<agent>-round2-rebuttal.md  Cross-examination rebuttals (Round 2)
  README.md                   This file
```

## Council Rounds

### Round 1 - Opening Statements
Each of the 6 agents (Conservative, Reformer, Historian, Economist, Risk Officer, Engineer)
delivers an opening statement with:
- A clear stance (SUPPORT / OPPOSE / DEFER / SUPPORT WITH CAVEATS)
- Evidence cited as file:line references or commit hashes
- A DCS score contribution for their assigned dimension

The Judge synthesizes Round 1 into a preliminary ADR in `docs/decisions/`.

### Round 2 - Cross-Examination
Three head-to-head confrontations where agents must engage each other's arguments:

1. **Conservative vs. Reformer** - Status quo vs. change
2. **Historian vs. Engineer** - Precedent vs. feasibility  
3. **Economist vs. Risk Officer** - Cost vs. risk

Each agent writes an 80-120 word rebuttal that either refutes the opponent with new evidence
or concedes partially. Stances marked REVISE or CONCEDE trigger a DCS score update.

Run `/cross-examination` to start Round 2 for the current session.

### Promotion to docs/decisions/
Once the Judge synthesizes both rounds, the final ADR is written to `docs/decisions/`
with status `Accepted with Conditions` (or `Deferred` / `Rejected`).

Draft files remain here as the tribunal record — they show HOW the decision was reached,
not just WHAT was decided.

## Active Session

Current ADR: **ADR-2026-001** - Java Service Consolidation  
Round 1: Complete (6/6 agents)  
Round 2: Pending (`/cross-examination`)  
