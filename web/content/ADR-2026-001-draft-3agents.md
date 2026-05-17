# ADR-2026-001: Consolidation of Inventory Hold Service into Python Backend

**Status:** Accepted (Retrospective)  
**Date:** 2026-05-15  
**Decision Confidence Score:** 77.5/100  
**Verdict:** PROCEED WITH CONDITIONS

## Context

On April 10, 2026, the Galaxium Travels team introduced a separate `inventory_hold_service` microservice implemented in Java/Spring Boot to manage flight seat inventory holds during the booking process. This service was intended to decouple inventory management from the main Python/FastAPI `booking_system_backend`.

The Java service existed for only 13 days before being consolidated back into the Python backend on April 23, 2026. Evidence from `commit 4156ec0` (2026-04-23) explicitly states: *"added java service. But it is not visibile in the frontend"* — revealing a critical integration failure. The service was deployed but never successfully integrated with the frontend application.

The current architecture shows a fully functional monolithic Python backend at [`booking_system_backend/server.py:1-190`](booking_system_backend/server.py:1-190) with no references to external Java services. The system implements complete booking functionality (flight listing, booking, cancellation, user registration) in a single FastAPI application.

## Decision

**The consolidation of the inventory hold service into the Python backend was the correct architectural decision and should be preserved.**

The team should maintain the current monolithic Python architecture rather than attempting to re-extract inventory management into a separate microservice. The failed 13-day Java experiment demonstrated that premature microservice decomposition created integration complexity that exceeded the value of service separation.

## Council Composition

| Agent | Stance | Key Finding |
|-------|--------|-------------|
| The Conservative | *Report Not Submitted* | N/A |
| The Reformer | **Support Consolidation** | Java service suffered "invisible integration" — existed but couldn't be consumed by frontend (`commit 4156ec0`) |
| The Historian | *Report Not Submitted* | N/A |
| The Economist | **Support Consolidation** | Consolidation avoided $18,240 in annual polyglot overhead costs; achieved 773% 3-year ROI |
| The Risk Officer | **Support Consolidation** | Consolidation eliminated 3 major risk categories (integration, deployment coordination, polyglot complexity) |
| The Engineer | *Report Not Submitted* | N/A |

**Note:** Only 3 of 6 council agents submitted reports. The Conservative, Historian, and Engineer did not participate in this session, reducing the evidence base and lowering the Evidence Strength and Historical Precedent scores.

## Decision Confidence Score Breakdown

| Dimension | Score | Weight | Contribution | Evidence Quality |
|-----------|-------|--------|--------------|------------------|
| Evidence Strength | 75/100 | 20% | 15.0 | PARTIAL |
| Historical Precedent | 50/100 | 15% | 7.5 | WEAK |
| Economic Viability | 95/100 | 20% | 19.0 | STRONG |
| Risk Assessment | 85/100 | 20% | 17.0 | STRONG |
| Technical Feasibility | 60/100 | 15% | 9.0 | PARTIAL |
| Council Consensus | 100/100 | 10% | 10.0 | STRONG |
| **TOTAL** | **77.5/100** | **100%** | **77.5** | |

**Verdict Threshold:** 60-79 = PROCEED WITH CONDITIONS

## Consequences

### Positive

- **Eliminated polyglot maintenance overhead:** Single Python/FastAPI stack reduces context switching, dependency management, and security patching across two ecosystems. Estimated savings: $8,000/year.

- **Removed integration complexity:** No cross-service communication, dual deployment pipelines, or protocol translation overhead. Estimated savings: $3,840/year.

- **Reduced onboarding burden:** New developers learn one framework instead of two (Spring Boot + FastAPI). Estimated savings: $6,400/year in onboarding overhead.

- **Achieved rapid break-even:** The $6,240 sunk cost of the 13-day experiment was recovered in 4.1 months through avoided polyglot overhead.

- **Minimized blast radius:** Current architecture shows criticality score of 100/100 (lowest possible) with zero external consumers requiring cross-service orchestration ([`dependency_blast_radius("booking_system_backend")`](dependency_blast_radius)).

### Negative

- **Single point of failure:** Inventory hold logic ([`booking_system_backend/services/booking.py:44`](booking_system_backend/services/booking.py:44)) now resides in monolithic service. Database failure or service crash affects all booking operations.

- **Limited horizontal scaling options:** Monolithic architecture may face scaling constraints under high concurrent booking load (insufficient data to assess current risk).

- **Incomplete council review:** Missing reports from Conservative, Historian, and Engineer reduce confidence in long-term architectural implications.

### Neutral

- **Sunk cost of failed experiment:** $6,240 invested in 13-day Java service development (13 days × 6 hours × $80/hour). This cost is unrecoverable but represents a relatively inexpensive learning experience.

- **Current system stability:** [`module_economics("booking_system_backend")`](module_economics) shows 0 commits in last 90 days, indicating stability after consolidation, but also potential stagnation.

## Binding Conditions

Given the PROCEED WITH CONDITIONS verdict, the following requirements must be met:

1. **Load Testing Required:** Conduct load testing to validate that the monolithic Python backend can handle expected concurrent booking volumes without database contention or performance degradation. Target: 100 concurrent bookings/minute.

2. **Monitoring Enhancement:** Implement comprehensive monitoring for the consolidated inventory hold logic, including:
   - Database transaction latency for seat availability updates
   - Booking failure rates and error patterns
   - Service health checks with automatic alerting

3. **Disaster Recovery Plan:** Document and test a disaster recovery procedure for the single-point-of-failure risk identified by the Risk Officer. Include database backup/restore procedures and service failover mechanisms.

4. **Complete Council Review (Future):** Before any future microservice extraction attempts, convene a full 6-agent council session with Conservative, Historian, and Engineer participation to ensure comprehensive architectural analysis.

## Evidence Summary

### Cited Evidence from Council Reports

1. **`commit 4156ec0`** (2026-04-23) — "added java service. But it is not visibile in the frontend" — demonstrates critical integration failure (Reformer)

2. **`commit 8f7ad7f`** (2026-04-16) — Merge of inventory_hold_service integration work, marking the beginning of the failed experiment (Reformer)

3. **[`booking_system_backend/server.py:1-190`](booking_system_backend/server.py:1-190)** — Complete, working FastAPI backend with no external Java service references (Reformer)

4. **`module_economics("booking_system_backend")`** — 847 LOC, 0 commits in last 90 days, $400/year maintenance cost (Reformer, Economist)

5. **[`booking_system_backend/server.py:183`](booking_system_backend/server.py:183)** — Unified deployment: `app.mount("/mcp", mcp_app)` — single process serves both REST and MCP protocols (Risk Officer)

6. **[`booking_system_backend/services/booking.py:44`](booking_system_backend/services/booking.py:44)** — Inventory hold logic: `flight.seats_available -= 1` (Risk Officer)

7. **`dependency_blast_radius("booking_system_backend")`** — Criticality score: 100/100 (lowest possible blast radius), zero HIGH criticality dependencies (Risk Officer)

### Economic Metrics (The Economist)

- **Sunk cost:** $6,240 (13 days × 6 hours × $80/hour)
- **Avoided annual costs:** $18,240 ($8,000 dual-stack maintenance + $6,400 onboarding + $3,840 integration)
- **Break-even:** 4.1 months
- **3-year ROI:** +773% (($54,720 avoided - $6,240 sunk) ÷ $6,240 × 100)

### Risk Assessment (The Risk Officer)

- **Risks eliminated:** Integration coordination, deployment coordination, polyglot technology stack complexity
- **Risks remaining:** Single point of failure (moderate), horizontal scaling constraints (insufficient data)
- **Overall risk score:** 85/100 (inverted scale: 100 = low risk)

## Implementation Roadmap

Since this is a retrospective ADR documenting a decision already implemented, the following validation steps should be completed:

1. **Immediate (Week 1):** Implement monitoring enhancements per Binding Condition #2
2. **Short-term (Month 1):** Conduct load testing per Binding Condition #1
3. **Short-term (Month 1):** Document and test disaster recovery procedures per Binding Condition #3
4. **Ongoing:** Track actual maintenance costs vs. projected $400/year to validate economic analysis
5. **Future:** Before any microservice extraction, convene full 6-agent council per Binding Condition #4

## Inadmissible Evidence Flags

**No inadmissible evidence detected.** All three participating agents (Reformer, Economist, Risk Officer) provided properly cited evidence using `file:line` references, `commit hash` citations, or MCP tool output.

**Council participation gap:** The Conservative, Historian, and Engineer did not submit reports, reducing the overall evidence base. This gap is reflected in the Evidence Strength (75/100) and Historical Precedent (50/100) scores.

## Council Session Metadata

- **Session ID:** quorum-2026-001
- **Date:** 2026-05-15
- **Repository:** demo-repo/galaxium-travels
- **Agents Participating:** 3 of 6 (Reformer, Economist, Risk Officer)
- **Agents Missing:** Conservative, Historian, Engineer
- **Total Evidence Citations:** 7 (4 file:line, 2 commit hashes, 1 MCP tool output)
- **Decision Type:** Retrospective (consolidation already completed)
- **Protocol:** Quorum Council Round 1 (Round 2 cross-examination not conducted due to incomplete council)

---

**Final Verdict:** The consolidation of the Java inventory hold service into the Python backend was economically sound, reduced architectural risk, and should be preserved. However, the team must address the single-point-of-failure concern through enhanced monitoring, load testing, and disaster recovery planning before considering this decision fully validated.
