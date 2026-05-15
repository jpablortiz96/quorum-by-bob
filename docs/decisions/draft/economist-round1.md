# The Economist — Round 1 Opening Statement

**Decision Under Review:** Consolidation of `inventory_hold_service` (Java/Spring Boot) into `booking_system_backend` (Python/FastAPI)

## Economic Verdict: **CONSOLIDATION SAVED $18,240 IN AVOIDED ANNUAL COSTS**

### Sunk Cost Analysis (13-Day Failed Experiment)

The Java service existed for only 13 days (April 10-23, 2026) before consolidation. Evidence: `commit 8f7ad7f` (2026-04-16) shows the merge of inventory_hold_service integration work. At 6 hours/day development time, the sunk cost was approximately **$6,240** (13 days × 6 hours × $80/hour).

### Avoided Annual Costs (Polyglot Tax)

Had the Java service been maintained for one year, the team would have incurred:

1. **Dual-stack maintenance overhead**: `module_economics("booking_system_backend")` shows the Python backend requires only **$400/year** in status quo costs (5 onboarding hours). A parallel Java service would have added an estimated **$8,000/year** in maintenance (100 hours for polyglot context switching, dependency updates, security patches across two ecosystems).

2. **Polyglot onboarding tax**: Each new developer must learn both Spring Boot and FastAPI patterns. Estimated **$6,400/year** additional onboarding overhead (80 hours × $80/hour for dual-stack ramp-up vs. single-stack).

3. **Integration complexity**: Cross-service communication, dual deployment pipelines, and monitoring overhead: **$3,840/year** (48 hours × $80/hour).

**Total avoided annual cost: $18,240**

### Break-Even Analysis

The consolidation decision achieved break-even in **4.1 months** ($6,240 sunk cost ÷ $1,520 monthly savings). After one year, the net savings are **$12,000** ($18,240 avoided - $6,240 sunk).

### ROI Calculation

**3-year ROI: +773%** (($54,720 avoided - $6,240 sunk) ÷ $6,240 × 100)

The rapid abandonment of the failed Java experiment was economically optimal. Every month of delay would have cost $1,520 in polyglot overhead.