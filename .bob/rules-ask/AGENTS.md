# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Documentation Rules (Non-Obvious Only)

**Bob IDE Configuration Load Order Matters:**
- AGENTS.md is loaded FIRST on every conversation (this gives context)
- `.bob/custom_modes.yaml` defines 7 Council agent modes (Conservative, Reformer, Historian, Economist, Risk Officer, Engineer, Judge)
- `.bob/skills/*/SKILL.md` contains workflow recipes activated contextually
- `.bob/rules/*.md` contains persistent instructions (evidence-first, bobcoin-frugal)
- `.bob/mcp.json` registers the quorum-tools MCP server
- Understanding this order helps explain why certain rules take precedence

**Council Protocol Has Strict 3-Round Structure:**
- Round 1: 6 agents produce independent reports (do NOT read each other's output)
- Round 2: Paired cross-examination (Conservative↔Reformer, Historian↔Engineer, Economist↔Risk Officer)
- Round 3: Judge synthesizes (ONLY reads draft files, never accesses repo directly)
- This is NOT obvious from file structure alone — it's enforced by workflow
- Source: `.bob/skills/council-debate/SKILL.md`

**Evidence Citation Is Sacred, Not Optional:**
- Every factual claim MUST cite `file:line` or `commit hash`
- Uncited arguments receive zero weight in Decision Confidence Score
- This applies even outside full Council sessions
- Format: `` `path/to/file.py:42` `` or `` `commit a3b8c91` ``
- Source: `.bob/rules/evidence-first.md`

**Decision Confidence Score Has 6 Weighted Dimensions:**
- Evidence Strength (20%), Historical Precedent (15%), Economic Viability (20%)
- Risk Assessment (20% — INVERTED: 100 = safe), Technical Feasibility (15%), Council Consensus (10%)
- Risk dimension inversion is counterintuitive and must be accounted for
- Verdict thresholds: 80-100 PROCEED, 60-79 PROCEED WITH CONDITIONS, 40-59 DEFER, 0-39 DO NOT PROCEED

**The Judge Has Restricted Edit Permissions:**
- Judge mode can ONLY edit files matching `docs/decisions/*.md`
- This prevents The Judge from modifying source code during verdict synthesis
- Source: `.bob/custom_modes.yaml:402-404`

**MCP Tools Have Hardcoded Defaults:**
- All tools default to `demo-repo/galaxium-travels` relative to project root
- Economic formulas are NOT configurable per-call (1h per 50 LOC, 30% testing overhead, etc.)
- Blast radius criticality uses regex patterns (HIGH: auth/payment, LOW: test/mock)
- Git archaeology returns max 50 commits, defaults to 2 years of history

**File Naming Conventions Are Strict:**
- ADRs: `ADR-YYYY-NNN-kebab-case-title.md`
- Draft reports: `[agent-name]-round[1|2].md`
- Custom mode slugs: lowercase with hyphens (e.g., `the-conservative`)

**Bobcoin Budget Discipline Is Mandatory:**
- Total budget: 40 Bobcoins for 48-hour hackathon
- Full `/council` debate: 1-2 Bobcoins
- `/ask-historian`: 0.2 Bobcoins
- `/verdict` (when drafts exist): 0.3 Bobcoins
- Bob must estimate cost and ask confirmation before expensive operations
- Source: `.bob/rules/bobcoin-frugal.md`

**Documentation Structure Is Hierarchical:**
- `AGENTS.md` (root) — comprehensive project context
- `docs/architecture.md` — system architecture diagram
- `docs/council-protocol.md` — full protocol documentation
- `docs/decisions/` — final committed ADRs
- `docs/decisions/draft/` — work-in-progress agent outputs (not committed)
- `.bob/` — Bob IDE configuration (modes, skills, rules, commands)