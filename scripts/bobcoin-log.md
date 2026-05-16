# Bobcoin Budget Log

Total budget: **40 Bobcoins**

Update this log after every Bob IDE session. Actual cost comes from the Bob IDE task consumption summary (click "..." next to the task → History → Consumption Summary).

---

## Budget Summary

| Status | Bobcoins |
|--------|---------|
| Total Budget | 40 |
| Spent | 0 |
| Remaining | 40 |

---

## Session Log

| Date | Task Description | Mode/Command | Estimated Cost | Actual Cost | Notes |
|------|-----------------|-------------|----------------|-------------|-------|
| 2026-05-15 | *— No sessions yet —* | — | — | — | Setup was done without Bob (free) |
| 2026-05-15 | /init on Quorum workspace | Code | 1.0 | [2.24] | Generated enriched AGENTS.md + mode-specific context files in .bob/ |
| 2026-05-15 | /init on Galaxium Travels (demo repo context) | Code | 1.0 | [1.10] | Enriched context for Council debates on demo case study |
| 2026-05-15 | Council #1 v1 (3/6 agents — draft) | Orchestrator | 4.0 | 4.90 | Partial council. Preserved as ADR-001-draft. |
| 2026-05-15 | Council #1 v2 (6/6 agents — FINAL) | Orchestrator | 4.0 | [5.55] | Full council. ADR-001 final. |
| 2026-05-15 | Historian re-run + Judge re-synth | Orchestrator | 1.5 | [0.58] | Final ADR-001 with 6/6 agents and real git evidence |
---

## Budget Allocation Plan

| Phase | Hours | Target Spend | Purpose |
|-------|-------|-------------|---------|
| Setup | 0–4h | 0 Bobcoins | Directory structure, files (no Bob needed) |
| /init | 4–6h | ~2 Bobcoins | Bob enriches AGENTS.md with repo analysis |
| First /council | 6–12h | ~2 Bobcoins | Full debate on galaxium-travels auth module |
| Additional sessions | 12–30h | ~10 Bobcoins | 3–5 more council sessions, /ask-historian runs |
| Polish & demo | 30–44h | ~8 Bobcoins | Refine ADRs, prepare submission |
| Reserve | — | ~18 Bobcoins | Buffer for unexpected needs |

---

## Frugality Notes

- Always use `/ask-historian` (~0.2 BC) before `/council` (~1-2 BC) to validate relevance
- Use `/verdict` (~0.3 BC) when Round 1+2 drafts already exist — don't re-run 6 agents
- Single file reads are essentially free — do targeted analysis before broad scans
- Bob's Bobcoin counter resets per task — start a new task for each distinct council session

