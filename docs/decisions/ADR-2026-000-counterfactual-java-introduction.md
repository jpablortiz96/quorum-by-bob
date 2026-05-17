# ADR-2026-000 (COUNTERFACTUAL): Should Galaxium have introduced a separate Java inventory service?

**Analysis Type:** Counterfactual / Time Machine simulation
**Target Commit Analyzed:** `aba26aa` — "added java service. But it is not visibile in the frontend"
**Method:** `time_machine` MCP tool captured repository state at the parent commit of `aba26aa`.

---

## What This Analysis Is

This is a retrospective simulation: what would Quorum have advised if consulted **before** commit `aba26aa` was applied? The analysis uses only information available at the snapshot moment — the state of the repository on 2026-04-09, the day before the Java service was introduced. No hindsight is applied to the predicted scores. The Hindsight Validation section separately documents what the git record actually confirms.

---

## Repository State Before the Decision

*Source: `time_machine` MCP tool, target_commit `aba26aa`, snapshot captured at the parent commit of `aba26aa` (2026-04-09).*

| Attribute | Value | Source |
|-----------|-------|--------|
| Services present | `booking_system_backend` (Python) | time_machine snapshot |
| Total LOC (estimate) | ~3,405 across all code files | time_machine `total_loc` output |
| Test files | 3 (estimate from snapshot walk) | time_machine `test_files_count` |
| Dominant language | Python | time_machine `modules` list |

**Module breakdown (time_machine snapshot):**
- `booking_system_backend` (Python): ~2,930 LOC, 13 files
- `booking_system_frontend` (JS/TS): ~475 LOC, 9 files

**What commit `aba26aa` added:** 26 new Java files, including `inventory_hold_service/` directory with Spring Boot, JPA, H2 database, Maven build, scheduled tasks, and a `PythonBackendClient.java` HTTP client targeting the Python backend.

*Note: The repository has history dating to at least 2025-05-23 (first commit `a666c54`). LOC counts are estimates from the time_machine snapshot walker.*

---

## What Quorum Would Have Advised

### Predicted Decision Confidence Score

| Dimension | Predicted Score | Rationale |
|-----------|----------------|-----------|
| Evidence Strength | 15/100 | No evidence in snapshot of Python backend limitations requiring Java. No problem statement precedes the introduction commit. |
| Historical Precedent | 10/100 | Repository has no prior polyglot architecture attempts. No commits touching "inventory hold" or "quote workflow" exist in Python backend before this commit. |
| Economic Viability | 25/100 | 26 Java files for unproven integration value. No break-even analysis. Equivalent Python implementation would reuse existing ORM and models. |
| Risk Assessment | 20/100 | **Inverted (raw risk: 80/100).** New runtime (JVM), new build system (Maven), cross-service HTTP dependency via `PythonBackendClient.java`, no routing configuration visible in snapshot. |
| Technical Feasibility | 40/100 | Spring Boot is technically sound, but `PythonBackendClient.java` reveals a circular call architecture — Java calls Python which calls frontend — with no routing or service discovery present. |
| Council Consensus | 5/100 | No agent could support this without a problem statement, integration plan, and routing configuration. |

**Predicted DCS: 19/100**

### Predicted Verdict: **DO NOT PROCEED**

*Score below 40 triggers DO NOT PROCEED. No dimension exceeds 40/100. The absence of a problem statement, integration plan, and frontend routing configuration makes this a high-risk introduction with no documented justification.*

---

## Simulated Council Concerns

### The Conservative
- Python backend handles all booking logic successfully. No evidence of Python performance or domain limitations requiring a second runtime.
- Single-language stack eliminates the deployment complexity that JVM + Maven introduces alongside Python + pip.
- Burden of proof is on the proposer: where is the documented Python inadequacy?

### The Reformer
- Java's type system and Spring Boot's scheduling could provide real value for inventory hold workflows.
- **BUT:** Without evidence that Python cannot achieve the same goals, the Reformer votes against. Polyglot complexity must be earned by Python insufficiency, not theoretical Java superiority.

### The Historian
- Repository has no prior polyglot or multi-service architecture. This is a novel risk with no organizational learning.
- `PythonBackendClient.java` in the snapshot reveals the Java service was designed to call back to Python — a circular dependency that historically signals integration fragility.
- Introducing a second runtime before the first service is fully stable is a pattern associated with premature complexity.

### The Economist
- 26 Java files = an estimated 20-35 development hours (estimate, not measured from snapshot).
- The same inventory hold logic in Python would reuse existing models, ORM, and test fixtures — estimated at half the cost.
- No break-even analysis accompanies the proposal. Without one, the economic case cannot be evaluated.

### The Risk Officer
- `PythonBackendClient.java` in the snapshot proves a cross-service HTTP call was planned — introducing network failure as a new booking failure mode.
- No routing configuration (nginx, API gateway) visible in snapshot. The frontend cannot reach the Java service without it.
- Two build systems (pip + Maven), two runtimes (CPython + JVM): operational surface area more than doubled.

### The Engineer
- Spring Boot is technically capable. Feasibility is not the concern.
- **Critical signal:** `PythonBackendClient.java` requires the Java service to call Python, creating bidirectional HTTP dependency. This architecture cannot work without explicit routing configuration — absent from the snapshot.
- No integration tests visible. No API contract document. The service cannot be validated without these prerequisites.

---

## Hindsight Validation — What the Git Record Actually Shows

| Quorum's Predicted Concern | Real Git Evidence | Verdict |
|----------------------------|-------------------|---------|
| Frontend integration would fail at introduction | `aba26aa` commit message: "But it is not visibile in the frontend" — developer confirmed integration failure in the commit itself | **CONFIRMED** |
| Service would require remediation commits | `10d8576` — "feat(inventory_hold_service): integrate quote and hold workflow with frontend" — 3-day remediation attempt after introduction | **CONFIRMED** |
| Service would be merged despite unresolved issues | `8f7ad7f` — "Merge pull request #9 from IBM/inventory_hold_service" — merged 6 days after the self-documented failure | **CONFIRMED** |
| Organizational or naming churn would follow | `59f9b46` — "Renaming the holding service." — directory renamed 10 days after introduction | **CONFIRMED** |
| Subsequent development would bypass the Java service | `4156ec0` — "feat: Add checkout add-ons feature (Issue #33)" — next feature commit develops exclusively in Python backend | **CONFIRMED** |

---

## Honest Limitation Note

The git history does **not** contain an explicit "consolidation" or "deletion" commit for the Java service. This analysis makes no such claim. What the record documents is: a service introduced with a self-acknowledged integration failure (`aba26aa`), a remediation attempt (`10d8576`), merged despite unresolved issues (`8f7ad7f`), renamed (`59f9b46`), and subsequently bypassed by feature development (`4156ec0`). Whether the service was eventually removed, remains in renamed form, or was silently abandoned cannot be determined from the available commit record alone.

Quorum's counterfactual value is not in predicting the exact outcome — it is in flagging the risks **before the first commit** that the git record then confirms. Every concern the council would have raised (integration failure, remediation cost, naming churn, bypass) materialized in the actual commit history.

---

## The Lesson

Architectural decisions need a tribunal before the first line of code, not an ADR written after the evidence has accumulated. The commit message "added java service. But it is not visibile in the frontend" is a developer admitting in writing — at merge time — that the integration was incomplete. This is precisely the gap Quorum's Engineer and Risk Officer would have flagged in a pre-commit review: an architectural introduction with no routing configuration, no integration tests, and no demonstrated frontend connectivity. A 19/100 DCS would have deferred this decision until those gaps were resolved. The git record shows they were never fully resolved.

---

## Methodology

- **Tool:** `time_machine` MCP tool
- **Target commit:** `aba26aa`
- **Snapshot date:** 2026-04-09 (parent commit of `aba26aa`)
- **Commit hashes cited in this document:** `aba26aa`, `10d8576`, `8f7ad7f`, `59f9b46`, `4156ec0`, `a666c54`
- **Predicted scores are illustrative** of Quorum's analytical framework applied to the pre-commit snapshot. They are not outputs of the MCP scoring tool.
- This is a demonstration of the Time Machine capability. The counterfactual council session was not conducted with live agent participation.
