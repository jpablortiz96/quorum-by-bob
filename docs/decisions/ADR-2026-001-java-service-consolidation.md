# ADR-2026-001: Java Inventory Hold Service Consolidation

**Status:** Deferred
**Date:** 2026-05-15
**Decision Makers:** Quorum Council
**Confidence Score:** 58.2/100

## Context

The Galaxium Travels booking system briefly operated a separate Java-based `inventory_hold_service` for quote and hold workflows. The service was introduced via [`commit aba26aa`](https://github.com/example/repo/commit/aba26aa) on 2026-04-10 and merged via [`commit 8f7ad7f`](https://github.com/example/repo/commit/8f7ad7f) on 2026-04-16, lasting only 13 days before consolidation back into the Python `booking_system_backend`.

The current Python implementation in [`booking_system_backend/services/booking.py:7-54`](booking_system_backend/services/booking.py) handles immediate seat decrements without intermediate hold states. The booking model in [`models.py:22-28`](booking_system_backend/models.py) and schema in [`schemas.py:24-32`](booking_system_backend/schemas.py) contain no `hold_expiry` or `quote_id` fields, indicating the hold/quote workflow was eliminated rather than ported.

Economic analysis via `module_economics("booking_system_backend")` shows the Python service incurs $400/year maintenance cost (0 commits in last 90 days, 847 LOC). The Java service directory does not exist in the repository, preventing calculation of avoided dual-service costs. Blast radius analysis via `dependency_blast_radius("booking_system_backend/services/booking.py")` identifies 10 consumers with criticality score 58/100.

## Decision

**The Council defers judgment on whether the Java service consolidation was architecturally sound.** The decision requires additional evidence on three critical gaps: (1) quantified operational cost of the never-deployed Java service, (2) comprehensive git archaeology of the 13-day lifecycle to identify failure modes, and (3) business impact assessment of the eliminated hold/quote workflow functionality.

## Consequences

### Positive
- **Polyglot complexity eliminated** — Single Python stack reduces deployment coordination, runtime dependencies, and cross-service integration risks per Risk Officer analysis of `dependency_blast_radius` results
- **Operational simplicity achieved** — Zero commits in 90 days demonstrates stable consolidated codebase per `module_economics("booking_system_backend")`

### Negative
- **Functionality gap introduced** — No evidence of hold mechanism, quote generation, or reservation expiry in current implementation per Engineer analysis of [`booking.py:7-54`](booking_system_backend/services/booking.py), [`models.py:22-28`](booking_system_backend/models.py), [`schemas.py:24-32`](booking_system_backend/schemas.py)
- **Economic case unproven** — Negative 44.4% ROI and 64.8-month break-even per Economist analysis; $2,160 consolidation cost not justified by $400/year Python maintenance alone
- **Domain boundary violated** — Conservative identified missing inventory hold domain logic; immediate booking model in [`booking.py:44-48`](booking_system_backend/services/booking.py) eliminates race condition protection

### Neutral
- **Technology stack alignment** — Python/FastAPI demonstrated capable of core booking operations per Engineer analysis of [`server.py:100+`](booking_system_backend/server.py), though Java's strong typing may have been better suited for hold state machines per Conservative argument

## Evidence Summary

| Agent | Key Finding | Source |
|-------|-------------|--------|
| Conservative | Defended separation with domain boundaries, tech fit, blast radius isolation | [`booking.py:7-54`](booking_system_backend/services/booking.py), [`commit aba26aa`](https://github.com/example/repo/commit/aba26aa), `dependency_blast_radius("booking.py")` |
| Reformer | 13-day rapid integration, zero maintenance burden post-consolidation | [`commit 8f7ad7f`](https://github.com/example/repo/commit/8f7ad7f), `module_economics("booking_system_backend")` |
| Historian | **REPORT MISSING** — No git archaeology performed | N/A |
| Economist | Negative ROI (-44.4%), 64.8-month break-even, Java service cost unknown | `module_economics("booking_system_backend")` |
| Risk Officer | Net risk reduction (3 eliminated, 2 introduced), 58/100 criticality | `dependency_blast_radius("server.py")`, `dependency_blast_radius("booking.py")` |
| Engineer | Technically incomplete — missing hold mechanism, quote generation, expiry | [`booking.py:7-54`](booking_system_backend/services/booking.py), [`models.py:22-28`](booking_system_backend/models.py), [`schemas.py:24-32`](booking_system_backend/schemas.py) |

## Decision Confidence Score Breakdown

| Dimension | Weight | Raw Score | Weighted Score | Evidence Quality | Rationale |
|-----------|--------|-----------|----------------|-----------------|-----------|
| Evidence Strength | 20% | 70/100 | 14.0/20 | PARTIAL | 5 of 6 agents provided file:line citations; Historian report missing reduces overall evidence quality |
| Historical Precedent | 15% | 40/100 | 6.0/15 | WEAK | Historian report missing; only 2 commits cited showing 13-day lifecycle, insufficient git archaeology |
| Economic Viability | 20% | 35/100 | 7.0/20 | PARTIAL | Negative ROI and long break-even documented, but Java service cost unknown prevents full analysis |
| Risk Assessment | 20% | 85/100 | 17.0/20 | STRONG | Risk Officer documented 3 eliminated risks vs 2 introduced with blast radius analysis |
| Technical Feasibility | 15% | 50/100 | 7.5/15 | PARTIAL | Engineer identified missing functionality and technical debt despite stack capability |
| Council Consensus | 10% | 67/100 | 6.7/10 | PARTIAL | 4-1 split (Conservative opposed, 4 favor consolidation with caveats, Historian absent) |
| **TOTAL** | **100%** | — | **58.2/100** | |

**Verdict:** DEFER (40-59 threshold)
**Confidence:** 58.2/100

## Inadmissible Evidence Flags

- **The Historian** — Report not submitted; no git archaeology performed despite being assigned to the Council session

## Conditions for Re-Evaluation

Before this decision can be reconsidered, the following evidence must be gathered:

1. **Quantify Java service operational cost** — Use `module_economics` on the Java service codebase (if archived) or estimate deployment/runtime costs to calculate true dual-service burden
2. **Complete git archaeology** — Run `git_archaeology` for keywords "inventory", "hold", "quote", "java", "consolidate" covering April 2026 to identify failure modes and decision rationale
3. **Business impact assessment** — Document whether the eliminated hold/quote workflow was a business requirement or experimental feature; if required, assess cost of re-implementing in Python

## Council Composition

This decision was reviewed under the Quorum Council protocol (Round 1 only; Round 2 cross-examination not performed). All agents were required to cite specific evidence. Uncited arguments were flagged as inadmissible.

| Agent | Stance | Summary |
|-------|--------|---------|
| The Conservative | **OPPOSE** | Defended separation as sound architecture with domain boundaries, appropriate tech stack, and blast radius isolation |
| The Reformer | **SUPPORT** | Argued rapid 13-day integration and zero post-consolidation maintenance justified eliminating polyglot complexity |
| The Historian | **ABSENT** | Report not submitted |
| The Economist | **DEFER** | Found negative ROI but acknowledged Java service cost unknown; recommended deferring judgment |
| The Risk Officer | **SUPPORT** | Documented net risk reduction from eliminating cross-service integration and deployment coordination |
| The Engineer | **SUPPORT WITH CAVEATS** | Confirmed Python stack capable but identified missing hold/quote functionality as technical debt |

---

**Session ID:** quorum-2026-001
**Generated:** 2026-05-15T22:39:10Z
**Protocol Version:** Quorum Council v1.0