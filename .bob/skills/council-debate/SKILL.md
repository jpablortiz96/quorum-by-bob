---
name: council-debate
description: |-
  Orchestrates a full 3-round Quorum Council debate for an architectural decision question.
  Round 1: all 6 agents produce independent opening statements citing repository evidence.
  Round 2: paired opponents cross-examine each other (Conservative vs Reformer, Historian vs Engineer, Economist vs Risk Officer).
  Round 3: The Judge synthesizes evidence, calculates Decision Confidence Score, and produces a committable ADR.
  Use this skill when the user invokes /council or asks for a full architectural debate.
---

# Skill: Council Debate Protocol

## Purpose

This skill defines the exact sequence, responsibilities, and evidence requirements for a full Quorum Council session. Bob uses this skill when executing the `/council` command to ensure debates are structured, evidence-grounded, and produce an actionable ADR.

## The Three Rounds

---

### Round 1 — Opening Statements

**Goal:** Each of the 6 non-Judge agents delivers their independent analysis of the decision question, citing real evidence from the repository.

**Sequence:** All 6 agents operate on the same decision question independently. They do NOT respond to each other in Round 1.

**Agent order (for readability, not dependency):**
1. The Conservative → produces `conservative-round1.md`
2. The Reformer → produces `reformer-round1.md`
3. The Historian → produces `historian-round1.md` (uses `git_archaeology` MCP tool)
4. The Economist → produces `economist-round1.md` (uses `module_economics` MCP tool)
5. The Risk Officer → produces `risk-officer-round1.md` (uses `dependency_blast_radius` MCP tool)
6. The Engineer → produces `engineer-round1.md`

**Evidence requirement:** Each agent must provide a minimum of **2 cited pieces of evidence** (`file:line` or `commit hash`). Agents with 0 citations are flagged by The Judge in Round 3.

**Output location:** `docs/decisions/draft/`

---

### Round 2 — Cross-Examination

**Goal:** Paired opponents challenge each other's strongest arguments. This forces agents to engage with the actual evidence on the other side, not strawmen.

**The three debate pairs:**

**Pair A: Conservative ↔ Reformer** (stability vs. change)
- The Conservative reads `reformer-round1.md` and responds to the strongest "Case for Change" argument
- The Reformer reads `conservative-round1.md` and responds to the strongest "Status Quo Defense" argument
- Output: `conservative-round2.md`, `reformer-round2.md`

**Pair B: Historian ↔ Engineer** (past patterns vs. current capability)
- The Historian reads `engineer-round1.md` and asks: "Has this technical approach been tried before? What happened?"
- The Engineer reads `historian-round1.md` and responds: "Are those past failures still technically relevant today, or has the stack changed?"
- Output: `historian-round2.md`, `engineer-round2.md`

**Pair C: Economist ↔ Risk Officer** (cost math vs. failure cost)
- The Economist reads `risk-officer-round1.md` and challenges: "Does the blast radius justify the status quo cost?"
- The Risk Officer reads `economist-round1.md` and challenges: "Does the break-even calculation include the cost of a worst-case failure?"
- Output: `economist-round2.md`, `risk-officer-round2.md`

**Evidence requirement:** Round 2 responses must cite at least **1 piece of evidence** from the opponent's Round 1 report (quoting their own citation back).

---

### Round 3 — Verdict

**Goal:** The Judge synthesizes all available evidence, calculates the Decision Confidence Score, and produces a committable ADR.

**The Judge reads:** All 12 draft files (6 × Round 1, 6 × Round 2).

**The Judge does NOT:** Access the repository directly, form opinions outside the presented evidence, or advocate for any position.

**Output:**
- Verdict Summary (Decision Confidence Score table + binding conditions)
- Full ADR saved to `docs/decisions/ADR-YYYY-NNN-slug.md`

---

## Evidence Citation Standard

Every factual claim in every agent output must be cited as one of:
- `path/to/file.py:42` — specific line reference
- `path/to/file.py:42-58` — line range reference
- `commit a3b8c91` — git commit hash (first 7 characters minimum)
- `branch: feature/name` — branch reference
- MCP tool output — attributed as `module_economics(path/to/dir)` or `git_archaeology(keyword)`

**Uncited claims are inadmissible.** The Judge flags them and zeros their weight in the Evidence Strength dimension.

---

## Session File Naming Convention

```
docs/decisions/draft/
├── conservative-round1.md
├── reformer-round1.md
├── historian-round1.md
├── economist-round1.md
├── risk-officer-round1.md
├── engineer-round1.md
├── conservative-round2.md
├── reformer-round2.md
├── historian-round2.md
├── engineer-round2.md
├── economist-round2.md
└── risk-officer-round2.md

docs/decisions/
└── ADR-2026-001-kebab-title.md   ← final output, committed to repo
```
