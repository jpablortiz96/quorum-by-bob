---
name: council-start
description: Convenes the full Quorum Council (7 agents) for a complete 3-round architectural debate and produces a Decision Confidence Score + ADR.
slash_command: /council
usage: /council [decision_question]
estimated_cost: 1-2 Bobcoins
---

# /council — Convene the Full Quorum Council

## Usage

```
/council Should we migrate the authentication service from session-based to JWT tokens?
/council Is it safe to deprecate the legacy Python ETL pipeline and replace it with the TypeScript version?
/council Should we extract the payment module into a separate microservice?
```

## What This Command Does

Invoking `/council [decision_question]` triggers the full 3-round council debate protocol:

**Round 1 — Opening Statements (6 agents in parallel)**
Each of the six non-Judge council members produces their opening statement citing repository evidence:
1. The Conservative → Status Quo Defense
2. The Reformer → Case for Change
3. The Historian → Historical Precedent Report
4. The Economist → Economic Analysis
5. The Risk Officer → Blast Radius Assessment
6. The Engineer → Technical Feasibility Report

**Round 2 — Cross-Examination (3 paired debates)**
- The Conservative ↔ The Reformer: stability evidence vs. problem evidence
- The Historian ↔ The Engineer: past failures vs. current technical feasibility
- The Economist ↔ The Risk Officer: break-even math vs. failure cost scenarios

**Round 3 — Verdict**
The Judge synthesizes all evidence, calculates the Decision Confidence Score, and produces a committable ADR.

## Instructions for Bob

When this command is invoked:

1. Parse the decision question from the command arguments.
2. Invoke the council-debate skill to structure the session.
3. For each Round 1 agent, activate that agent's custom mode and request their report on the decision question. Use quorum-tools MCP for evidence gathering.
4. Save each agent's output to `docs/decisions/draft/[agent-name]-round1.md`.
5. For Round 2, activate each agent's mode again and have them respond to their paired opponent's strongest argument.
6. Save Round 2 responses to `docs/decisions/draft/[agent-name]-round2.md`.
7. Invoke The Judge mode to synthesize. The Judge reads the draft files and produces the final verdict.
8. Save the final ADR to `docs/decisions/ADR-[date]-[NNN]-[slug].md`.
9. Summarize the verdict and the ADR filename for the user.

## Cost Note

This command invokes all 7 modes and calls the quorum-tools MCP server multiple times. Estimated cost: **1-2 Bobcoins**. Use `/ask-historian` for lightweight single-agent queries (0.2 Bobcoins) or `/verdict` when Round 1+2 drafts already exist (0.3 Bobcoins).
