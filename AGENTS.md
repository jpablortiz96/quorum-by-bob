# QUORUM — Agent Context File

> Bob reads this file at the start of every conversation. It is the single source of truth for how the Quorum Council operates. Do not modify it during a session; update it between sessions.

---

## Project Purpose

**Quorum** is the first Multi-Agent Tribunal for Architectural Decision-Making. When a Tech Lead faces a high-stakes architectural decision — migrate a service, deprecate a legacy module, extract a microservice — instead of relying on tribal knowledge and gut feel, they convene a Council of 7 specialized AI agents. Each agent analyzes the repository from a distinct perspective, citing specific file references and commit hashes. The Council debates for 3 rounds, then The Judge synthesizes the evidence into a Decision Confidence Score (0–100) and a committable Architecture Decision Record (ADR).

Quorum solves a real and expensive problem: architecture decisions made without evidence cost teams $50K–$500K per incident in failed migrations, partial rollbacks, and accumulated technical debt. Quorum makes every significant decision auditable, evidence-based, and reproducible.

This project is built for the **IBM Bob Hackathon (May 2026)** using Bob IDE as the primary runtime environment. Bob's full-repo context, custom modes, slash commands, skills, and MCP server integration are what make Quorum possible — no other IDE could host this system.

---

## The Council Protocol

Quorum sessions follow a strict 3-round protocol. Do not skip rounds.

### Round 1 — Opening Statements
All 6 non-Judge agents analyze the decision question independently and produce their opening report. Agents do NOT read each other's output in Round 1. Each must produce a minimum of 2 cited pieces of evidence (`file:line` or `commit hash`).

Agent order: Conservative → Reformer → Historian → Economist → Risk Officer → Engineer

Draft outputs saved to: `docs/decisions/draft/[agent]-round1.md`

### Round 2 — Cross-Examination
Agents are paired with their logical opponent and must directly engage with the opponent's strongest argument from Round 1:
- **Conservative ↔ Reformer** (stability vs. change)
- **Historian ↔ Engineer** (past failures vs. current capability)
- **Economist ↔ Risk Officer** (break-even math vs. failure cost)

Round 2 outputs saved to: `docs/decisions/draft/[agent]-round2.md`

### Round 3 — Verdict
The Judge reads all 12 draft files (or however many exist), calculates the Decision Confidence Score, flags inadmissible evidence, and produces the final ADR. Saved to `docs/decisions/ADR-YYYY-NNN-slug.md`.

---

## The 7 Council Agents

| # | Name | Role | Primary Tool | Output |
|---|------|------|-------------|--------|
| 1 | The Conservative | Defends status quo with stability evidence | `cite_evidence` | Status Quo Defense |
| 2 | The Reformer | Argues for change with problem evidence | `cite_evidence` | Case for Change |
| 3 | The Historian | Git archaeology — precedents and patterns | `git_archaeology` | Historical Precedent Report |
| 4 | The Economist | Quantifies costs, ROI, break-even | `module_economics` | Economic Analysis |
| 5 | The Risk Officer | Maps blast radius and critical paths | `dependency_blast_radius` | Blast Radius Assessment |
| 6 | The Engineer | Assesses technical feasibility | `cite_evidence` | Technical Feasibility Report |
| 7 | The Judge | Synthesizes all evidence, emits verdict | `score_dimension` | Verdict + ADR |

Custom modes for each agent are in `.bob/modes/`. Activate via Bob IDE mode selector.

---

## Evidence Citation Rule (SACRED)

**Every factual claim must cite a specific, verifiable source.**

Valid citation formats:
- `path/to/file.py:42` — file and line number
- `path/to/file.py:42-58` — file and line range
- `commit a3b8c91` — git commit hash (minimum 7 chars)
- `branch: feature/name` — branch reference with state and date
- `module_economics("src/dir")` → [metric] — MCP tool output

**If an agent cannot cite evidence, they MUST write:** `No evidence found for this point.`

Speculation without citation is **inadmissible**. The Judge flags inadmissible arguments and reduces their weight in the Decision Confidence Score. An agent with 3+ uncited arguments may have their entire position discounted.

---

## Decision Confidence Score

The DCS is a weighted aggregate of 6 dimensions, each scored 0–100:

| Dimension | Weight | Scoring Agent | Note |
|-----------|--------|---------------|------|
| Evidence Strength | 20% | The Judge (aggregated) | Quality of citations across all agents |
| Historical Precedent | 15% | The Historian | How much relevant history exists |
| Economic Viability | 20% | The Economist | Break-even and ROI |
| Risk Assessment | 20% | The Risk Officer | **INVERTED**: 100 = low risk |
| Technical Feasibility | 15% | The Engineer | Stack compatibility, migration path |
| Council Consensus | 10% | The Judge | Agreement across the 6 agents |

**Verdict thresholds:**
- 80–100 → **PROCEED**
- 60–79 → **PROCEED WITH CONDITIONS**
- 40–59 → **DEFER** (gather more evidence)
- 0–39 → **DO NOT PROCEED**

---

## ADR Output Format

Every Quorum session produces an ADR with these sections:

```
# ADR-YYYY-NNN: [Short Decision Title]
Status: Accepted | Rejected | Deferred
Date: YYYY-MM-DD
Confidence Score: X/100

## Context      — observable facts, cited
## Decision     — one clear sentence + elaboration
## Consequences — Positive / Negative / Neutral
## Evidence Summary — table: Agent | Finding | Source
## Decision Confidence Score Breakdown — the 6 dimensions
## Council Composition — session metadata
```

Filename format: `ADR-YYYY-NNN-kebab-case-title.md`
Save location: `docs/decisions/`

---

## File Map

```
.bob/
├── modes/          7 custom agent modes (conservative, reformer, historian, economist, risk-officer, engineer, judge)
├── commands/       Slash commands: /council, /ask-historian, /verdict, /export-session
├── skills/         council-debate, generate-adr, cite-evidence, score-decision
├── rules/          evidence-first, bobcoin-frugal
└── mcp.json        MCP server configuration

mcp-server/         TypeScript MCP server (quorum-tools)
  src/tools/        git_archaeology, dependency_blast_radius, module_economics, cite_evidence, score_dimension

demo-repo/          Target repository for analysis (galaxium-travels)
docs/
  decisions/        Final ADRs (committed)
  decisions/draft/  Work-in-progress agent outputs (not committed)
  architecture.md   System architecture diagram
  council-protocol.md  Full protocol documentation

bob_sessions/       Required hackathon submission artifacts
  screenshots/      PNG exports from Bob IDE
  exports/          Markdown exports from Bob IDE

scripts/
  verify-setup.ps1      Environment verification
  clone-demo-repo.ps1   Clone galaxium-travels
  bobcoin-log.md        Manual Bobcoin budget tracker
```

---

## Bob Usage Strategy

**Total budget: 40 Bobcoins for ~48 hours.**

| Operation | Estimated Cost | When to Use |
|-----------|---------------|-------------|
| `/council` (full 7-agent debate) | 1–2 Bobcoins | Major architectural decisions |
| `/ask-historian [keyword]` | 0.2 Bobcoins | Quick precedent check |
| `/verdict` (Judge only, drafts exist) | 0.3 Bobcoins | Re-running verdict after edits |
| Single file read + analysis | 0.05 Bobcoins | Research, debugging |
| Multi-file analysis (>10 files) | 0.3–0.5 Bobcoins | Use targeted reads instead |

**Frugality rules:**
1. Use `/ask-historian` before `/council` to pre-validate relevance
2. Use `/verdict` when Round 1+2 drafts already exist — don't re-run all 6 agents
3. Never do a full repo scan when a targeted file read will do
4. After each significant operation, run `/export-session` and update `scripts/bobcoin-log.md`

**Target allocation:**
- Hours 0–12: Setup + first demo council session (8–10 Bobcoins)
- Hours 12–24: 2–3 additional council sessions on galaxium-travels (10–15 Bobcoins)
- Hours 24–36: Polish, README, submission prep (5–8 Bobcoins)
- Hours 36–48: Reserve for demo fixes (remaining budget)
