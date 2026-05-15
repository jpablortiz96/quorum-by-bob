# Quorum Council Protocol

## Overview

The Quorum Council Protocol defines the structure, sequence, and rules governing a full architectural debate session. A session consists of 3 rounds involving 7 agents. The protocol is deterministic: agents have assigned roles, speak in defined order, and produce outputs in a specified format.

This document is the authoritative reference for the `council-debate` skill and the `/council` slash command.

---

## Pre-Session Setup

Before a session begins:

1. **Decision question is stated clearly.** The question must be answerable (not "should we improve the codebase?" but "should we migrate the payment module from synchronous REST calls to an async event-driven architecture?").

2. **Target module or scope is identified.** The council needs to know what part of the repository is under review.

3. **Session ID is assigned.** Format: `ADR-YYYY-NNN`. Check `docs/decisions/` for the next available number.

4. **Draft folder is cleared.** `docs/decisions/draft/` should not contain stale files from a previous session. Archive or delete them before starting.

---

## Round 1 — Opening Statements

**Purpose:** Independent analysis. Each agent examines the repository from their own perspective and produces their strongest evidence-based argument.

**Critical rule:** Agents in Round 1 do NOT read each other's output. Independence is required to prevent groupthink and ensure all perspectives are represented.

### Agent Sequence

**1. The Conservative**
- Mode: `conservative`
- Tool: `cite_evidence` (to validate stability claims)
- Minimum evidence: 2 cited `file:line` or `commit hash`
- Output: `docs/decisions/draft/conservative-round1.md`
- Score registered: `score_dimension(evidence_strength, conservative, X, rationale)`

**2. The Reformer**
- Mode: `reformer`
- Tool: `cite_evidence` (to validate problem evidence)
- Minimum evidence: 2 cited `file:line` or `commit hash`
- Output: `docs/decisions/draft/reformer-round1.md`
- Score registered: `score_dimension(evidence_strength, reformer, X, rationale)`

**3. The Historian**
- Mode: `historian`
- Tool: `git_archaeology(keyword, since_date)`
- Minimum evidence: Timeline with at least 1 commit hash
- Output: `docs/decisions/draft/historian-round1.md`
- Score registered: `score_dimension(historical_precedent, historian, X, rationale)`

**4. The Economist**
- Mode: `economist`
- Tool: `module_economics(directory_path)`
- Minimum evidence: Module metrics from MCP tool output
- Output: `docs/decisions/draft/economist-round1.md`
- Score registered: `score_dimension(economic_viability, economist, X, rationale)`

**5. The Risk Officer**
- Mode: `risk-officer`
- Tool: `dependency_blast_radius(file_path)`
- Minimum evidence: Consumer list from MCP tool output
- Output: `docs/decisions/draft/risk-officer-round1.md`
- Score registered: `score_dimension(risk_assessment, risk_officer, X, rationale)`

**6. The Engineer**
- Mode: `engineer`
- Tool: `cite_evidence` (for stack version references, interface citations)
- Minimum evidence: 2 cited `file:line` references
- Output: `docs/decisions/draft/engineer-round1.md`
- Score registered: `score_dimension(technical_feasibility, engineer, X, rationale)`

### Round 1 Quality Gate

Before proceeding to Round 2, verify:
- All 6 Round 1 files exist in `docs/decisions/draft/`
- Each file contains at least 2 citations
- No file is a placeholder or empty

---

## Round 2 — Cross-Examination

**Purpose:** Adversarial engagement. Each agent reads their paired opponent's Round 1 output and challenges the strongest argument directly.

**Critical rule:** Agents in Round 2 MUST quote their opponent's evidence. A Round 2 response that does not engage with the opponent's specific citations is inadmissible.

### Debate Pair A: Conservative ↔ Reformer

**The Conservative responds to The Reformer**
- Reads: `docs/decisions/draft/reformer-round1.md`
- Must quote: At least 1 of The Reformer's cited pieces of evidence
- Challenge: Explain why the Reformer's evidence does not justify the proposed change (e.g., "The TODO at `src/auth/session.py:89` has existed for 2 years without causing a production incident — `commit a3b8c91` shows it was acknowledged but deprioritized because [stability evidence]")
- Output: `docs/decisions/draft/conservative-round2.md`

**The Reformer responds to The Conservative**
- Reads: `docs/decisions/draft/conservative-round1.md`
- Must quote: At least 1 of The Conservative's cited pieces of evidence
- Challenge: Explain why the Conservative's stability evidence is misleading (e.g., "The Conservative cites low churn at `src/auth/session.py:45`, but `commit b4c2d89` shows the last three bug fixes in this module each touched this exact file — stability of churn does not equal stability of behavior")
- Output: `docs/decisions/draft/reformer-round2.md`

### Debate Pair B: Historian ↔ Engineer

**The Historian responds to The Engineer**
- Reads: `docs/decisions/draft/engineer-round1.md`
- Must quote: The Engineer's proposed migration pattern
- Challenge: Has this technical approach been attempted in this repository before? What was the outcome? (Uses `git_archaeology` to verify)
- Output: `docs/decisions/draft/historian-round2.md`

**The Engineer responds to The Historian**
- Reads: `docs/decisions/draft/historian-round1.md`
- Must quote: The Historian's most relevant precedent (commit hash)
- Challenge: Are the past failures still technically relevant? Has the stack changed since then? What is different now? (Uses `cite_evidence` to reference current stack versions)
- Output: `docs/decisions/draft/engineer-round2.md`

### Debate Pair C: Economist ↔ Risk Officer

**The Economist responds to The Risk Officer**
- Reads: `docs/decisions/draft/risk-officer-round1.md`
- Must quote: The Risk Officer's blast radius count or criticality score
- Challenge: Does the blast radius justify the cost of inaction? What is the economic cost of the risk scenario compared to the economic cost of the change? (Uses `module_economics` to anchor numbers)
- Output: `docs/decisions/draft/economist-round2.md`

**The Risk Officer responds to The Economist**
- Reads: `docs/decisions/draft/economist-round1.md`
- Must quote: The Economist's break-even calculation
- Challenge: Does the break-even math include the cost of a worst-case failure scenario? What is the recovery cost if the migration fails at the `HIGH` criticality consumers? (Uses `dependency_blast_radius` to quantify failure impact)
- Output: `docs/decisions/draft/risk-officer-round2.md`

---

## Round 3 — Verdict

**Purpose:** Synthesis. The Judge reads all available evidence, applies the scoring formula, flags inadmissible arguments, and produces the final ADR.

**The Judge's constraints:**
1. Does NOT access the repository directly
2. Does NOT advocate for any position
3. Does NOT introduce new evidence not present in Rounds 1–2
4. DOES flag inadmissible arguments (uncited claims)
5. DOES calculate the DCS using the `score_dimension` tool outputs

### Verdict Sequence

1. **Read all draft files** from `docs/decisions/draft/`
2. **Flag inadmissible arguments** — any claim without a `file:line` or `commit hash` citation
3. **Apply evidence penalties** — −10/arg for 1 inadmissible, −25 for 2, −50 for 3+
4. **Calculate DCS** — use the `score_dimension` tool outputs or compute manually from agent scores
5. **Determine verdict** — apply threshold: 80+ PROCEED, 60+ PROCEED WITH CONDITIONS, 40+ DEFER, <40 DO NOT PROCEED
6. **Draft the ADR** — follow the `generate-adr` skill template exactly
7. **Save ADR** — `docs/decisions/ADR-YYYY-NNN-slug.md`
8. **Clear draft folder** — archive or delete Round 1+2 files

### What Makes a Good Verdict

A good Judge verdict:
- Names the dominant position clearly ("the evidence supports proceeding with the migration")
- Acknowledges the strongest counter-argument ("The Conservative's evidence of low churn is real but insufficient given The Economist's 8-month break-even")
- States binding conditions precisely ("Proceed only if a feature flag is implemented before deployment, as The Risk Officer identified 3 HIGH-criticality consumers at `file:line`")
- Produces an ADR a future engineer could open in two years and understand without context

---

## Evidence Citation Standard

See [`.bob/skills/cite-evidence.md`](.bob/skills/cite-evidence.md) for the full standard.

**Summary:** `file:line` or `commit hash`. No exceptions. No "I believe" or "typically" or "best practice." The evidence exists in the repository or it does not exist.

---

## Session File Reference

```
docs/decisions/draft/
├── conservative-round1.md    The Conservative opening statement
├── reformer-round1.md        The Reformer opening statement
├── historian-round1.md       The Historian opening statement
├── economist-round1.md       The Economist opening statement
├── risk-officer-round1.md    The Risk Officer opening statement
├── engineer-round1.md        The Engineer opening statement
├── conservative-round2.md    The Conservative cross-examination response
├── reformer-round2.md        The Reformer cross-examination response
├── historian-round2.md       The Historian cross-examination response
├── engineer-round2.md        The Engineer cross-examination response
├── economist-round2.md       The Economist cross-examination response
├── risk-officer-round2.md    The Risk Officer cross-examination response
└── scores-ADR-YYYY-NNN.json  Score registry (written by score_dimension MCP tool)

docs/decisions/
└── ADR-YYYY-NNN-slug.md      Final verdict (committed to repository)
```
