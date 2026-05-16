# ADR-2026-001: Consolidation of Inventory Hold Service into Python Backend

**Status:** Accepted with Conditions
**Date:** 2026-05-16
**Decision Confidence Score:** 69.0/100
**Verdict:** PROCEED WITH CONDITIONS

## Context

The Galaxium Travels booking system briefly operated a dual-language architecture with a separate Java `inventory_hold_service` alongside the Python `booking_system_backend`. The Java service was introduced on April 10, 2026 (`commit aba26aa`) to implement quote-and-hold workflows for temporary inventory reservation before payment confirmation. However, the service exhibited immediate integration failures—the commit message explicitly noted "But it is not visibile in the frontend"—requiring a Python backend proxy layer three days later (`commit 10d8576`). The service was merged via PR #9 on April 16 (`commit 8f7ad7f`), renamed on April 20 (`commit 59f9b46`), and subsequently abandoned with zero maintenance commits in the following 26 days.

The current Python implementation in [`booking_system_backend/services/booking.py:7-54`](booking_system_backend/services/booking.py:7-54) handles immediate seat decrements without intermediate hold states, using a service-layer error return pattern rather than exceptions. The [`models.py:22-28`](booking_system_backend/models.py:22-28) Booking model lacks `hold_expiry` or `quote_id` fields, and [`schemas.py:24-32`](booking_system_backend/schemas.py:24-32) BookingOut schema contains only final booking states. Economic analysis via `module_economics("booking_system_backend")` shows the consolidated Python service incurs only $400/year maintenance cost with 0 commits in the last 90 days, though the $2,160 consolidation cost yields a 64.8-month break-even and -44.4% 3-year ROI. The Java service directory does not exist in the repository, indicating it was never deployed to production.

## Decision

**The Council accepts the consolidation of inventory hold functionality into the Python backend, conditional upon implementing the missing hold/quote workflow capabilities that the Java service was originally designed to provide.** The 13-day lifecycle of the Java service—from introduction through integration failure, workaround architecture, renaming, and abandonment—demonstrates architectural friction that outweighs the theoretical benefits of domain boundary isolation. However, the consolidation must not be treated as complete until the Python service implements proper inventory hold mechanisms with expiry timers and quote generation.

## Council Composition

| Agent | Stance | Key Finding (1 line) |
|-------|--------|----------------------|
| The Conservative | **OPPOSE** | Java separation was architecturally sound; 13-day failure suggests implementation issues, not design flaws |
| The Reformer | **SUPPORT** | Zero maintenance burden post-consolidation ($400/year) with no documented integration benefits from dual-language architecture |
| The Historian | **SUPPORT** | 5-commit timeline shows introduction→failure→workaround→renaming→abandonment pattern; commit message "not visible in frontend" is candid evidence of mismatch |
| The Economist | **DEFER** | Java service never deployed; cannot calculate avoided dual-service cost; -44.4% ROI on Python consolidation alone is weak |
| The Risk Officer | **SUPPORT** | Consolidation eliminated cross-service communication failures, deployment coordination complexity, and dual-stack maintenance burden |
| The Engineer | **SUPPORT WITH CAVEATS** | Python/FastAPI technically capable, but current implementation missing hold mechanism, quote generation, and reservation expiry |

## Decision Confidence Score Breakdown

| Dimension | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Evidence Strength | 82/100 | 20% | 16.4 |
| Historical Precedent | 85/100 | 15% | 12.8 |
| Economic Viability | 35/100 | 20% | 7.0 |
| Risk Assessment | 85/100 | 20% | 17.0 |
| Technical Feasibility | 50/100 | 15% | 7.5 |
| Council Consensus | 83/100 | 10% | 8.3 |
| **TOTAL** | **69.0/100** | 100% | 69.0 |

## Consequences

### Positive

- **Operational simplicity**: Single Python runtime eliminates JVM tuning, Spring Boot configuration, and polyglot deployment coordination
- **Risk elimination**: No cross-service network calls, serialization errors, or timeout cascades between Java and Python services
- **Maintenance efficiency**: $400/year Python service cost with 0 commits in 90 days demonstrates post-consolidation stability
- **Evidence-based decision**: 5 commits across 13-day lifecycle provide clear historical precedent for architectural friction

### Negative

- **Missing functionality**: Current Python implementation lacks hold/quote workflows that Java service was designed to provide
- **Technical debt**: [`booking.py:43-54`](booking_system_backend/services/booking.py:43-54) immediate booking model eliminates race condition protection
- **Weak ROI**: 64.8-month break-even and -44.4% 3-year ROI without quantified dual-service cost savings
- **Performance risk**: Python GIL-constrained runtime replaces Java's multi-threaded JVM for inventory operations

### Neutral

- **API contract simplification**: Multi-stage hold/quote workflow reduced to single-stage immediate booking
- **Complete rewrite pattern**: No Java port artifacts; Python uses service-layer error returns instead of exceptions

## Binding Conditions

1. **Implement inventory hold mechanism** with expiry timers in [`booking_system_backend/services/booking.py`](booking_system_backend/services/booking.py) before declaring consolidation complete
2. **Add hold state fields** to [`models.py:22-28`](booking_system_backend/models.py:22-28) Booking model: `hold_expiry: datetime`, `quote_id: str`, `status: Enum['pending', 'held', 'booked', 'cancelled']`
3. **Extend BookingOut schema** in [`schemas.py:24-32`](booking_system_backend/schemas.py:24-32) to expose hold/quote states to frontend
4. **Document race condition handling** for concurrent booking attempts during hold period
5. **Quantify avoided dual-service operational costs** (Java runtime, deployment coordination, integration testing) to validate economic case post-consolidation

## Evidence Summary

1. `commit aba26aa` (2026-04-10) — "added java service. But it is not visibile in the frontend" — immediate integration failure
2. `commit 10d8576` (2026-04-13) — "feat(inventory_hold_service): integrate quote and hold workflow with frontend" — Python proxy workaround
3. `commit 8f7ad7f` (2026-04-16) — "Merge pull request #9 from IBM/inventory_hold_service" — feature branch merged despite issues
4. `commit 59f9b46` (2026-04-20) — "Renaming the holding service." — namespace collision or organizational regret
5. `commit 4156ec0` (2026-04-23) — "feat: Add checkout add-ons feature (Issue #33)" — subsequent development bypasses Java service
6. [`booking_system_backend/services/booking.py:7-54`](booking_system_backend/services/booking.py:7-54) — immediate booking with seat decrement, no hold states
7. [`booking_system_backend/services/booking.py:44`](booking_system_backend/services/booking.py:44) — direct "booked" status assignment
8. [`booking_system_backend/services/booking.py:74-77`](booking_system_backend/services/booking.py:74-77) — cancellation with seat restoration
9. [`booking_system_backend/models.py:22-28`](booking_system_backend/models.py:22-28) — Booking model lacks hold_expiry or quote_id fields
10. [`booking_system_backend/schemas.py:24-32`](booking_system_backend/schemas.py:24-32) — BookingOut schema contains only final booking states
11. [`booking_system_backend/server.py:100+`](booking_system_backend/server.py:100) — FastAPI REST endpoints
12. [`booking_system_backend/server.py:19-97`](booking_system_backend/server.py:19-97) — FastMCP tool exposure
13. `dependency_blast_radius("booking_system_backend/services/booking.py")` → 10 consumers, criticality 58/100
14. `dependency_blast_radius("server.py")` → criticality 99/100 (minimal blast radius)
15. `module_economics("booking_system_backend")` → 0 commits/90 days, $400/year maintenance, $2,160 consolidation cost, 64.8-month break-even, -44.4% 3-year ROI

## Council Session Metadata

- **Session ID:** quorum-2026-001
- **Date:** 2026-05-16
- **Repository:** demo-repo/galaxium-travels
- **Agents Participating:** 6 of 6
- **Total Evidence Citations:** 15 (5 commit hashes, 8 file:line references, 2 MCP tool outputs)
- **Protocol:** Quorum Council Round 1 (full participation)
- **Inadmissible Evidence:** None (all agents cited specific sources)