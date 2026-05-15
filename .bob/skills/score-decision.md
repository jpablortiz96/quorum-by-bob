---
name: score-decision
description: Recipe for calculating the Quorum Decision Confidence Score across 6 weighted dimensions. Used by The Judge in Round 3.
---

# Skill: Decision Confidence Score Calculation

## Overview

The Decision Confidence Score (DCS) is a weighted aggregate of 6 dimensions, each scored 0-100 by the relevant council agent. The Judge synthesizes these into a final score that determines the verdict.

**Final DCS = Σ(dimension_score × weight)**

---

## The 6 Dimensions

### Dimension 1: Evidence Strength (Weight: 20%)

**Definition:** How much hard, cited evidence supports the dominant position (change vs. status quo)?

**Scoring agent:** The Judge synthesizes from all 6 agents' citation quality.

| Score Range | Meaning |
|-------------|---------|
| 80-100 | Multiple agents provided 3+ citations each. All citations validated. |
| 60-79 | Most agents cited 2+ pieces of evidence. Minor gaps. |
| 40-59 | Some agents cited evidence, others had gaps. Mixed quality. |
| 20-39 | Majority of arguments were uncited or speculative. |
| 0-19 | Almost no cited evidence across the session. |

**Penalty modifier:** −10 per inadmissible argument (see cite-evidence skill).

---

### Dimension 2: Historical Precedent (Weight: 15%)

**Definition:** What does the git history tell us? Does precedent support or undermine the proposed direction?

**Scoring agent:** The Historian provides a raw score (0-100) in their Historical Confidence Score.

| Score Range | Meaning |
|-------------|---------|
| 80-100 | Strong historical evidence directly relevant to this decision. |
| 60-79 | Some historical precedent found; moderately relevant. |
| 40-59 | Limited history; repository is young or module is new. |
| 20-39 | History exists but is contradictory or ambiguous. |
| 0-19 | No relevant historical data found. |

**Note:** The Historian's score reflects confidence in the historical data, not a recommendation. The Judge interprets direction.

---

### Dimension 3: Economic Viability (Weight: 20%)

**Definition:** Does the economic case support the decision? Is the break-even achievable?

**Scoring agent:** The Economist provides a raw score (0-100) in their Economist Score.

| Score Range | Meaning |
|-------------|---------|
| 80-100 | Clear economic advantage. Payback period < 6 months. ROI > 200%. |
| 60-79 | Positive economics. Payback period 6-18 months. |
| 40-59 | Break-even or marginal. Payback period 18-36 months. |
| 20-39 | Negative economics in the short term. Long-term unclear. |
| 0-19 | Change is economically unjustifiable. Cost >> benefit. |

---

### Dimension 4: Risk Assessment (Weight: 20%)

**INVERTED DIMENSION:** A higher score means LOWER risk (safer to proceed).

**Scoring agent:** The Risk Officer provides a raw score (0-100) in their Risk Officer Score.

| Score Range | Meaning |
|-------------|---------|
| 80-100 | Low blast radius. Few consumers. No critical paths affected. Easy rollback. |
| 60-79 | Manageable risk. Some consumers affected. Clear rollback path. |
| 40-59 | Moderate risk. Several critical consumers. Rollback is complex. |
| 20-39 | High risk. Core business paths affected. Rollback is painful. |
| 0-19 | Extreme risk. Mission-critical systems affected. No safe rollback. |

**The Judge reminder:** Risk Score 100 = safe. Risk Score 0 = dangerous. Include "(INVERTED)" note in the final table.

---

### Dimension 5: Technical Feasibility (Weight: 15%)

**Definition:** Can this be done with the current stack, skills, and codebase?

**Scoring agent:** The Engineer provides a raw score (0-100) in their Feasibility Score.

| Score Range | Meaning |
|-------------|---------|
| 80-100 | Technically straightforward. No breaking changes. Clear migration path. |
| 60-79 | Feasible with manageable breaking changes. Proven migration pattern applies. |
| 40-59 | Significant technical challenges. Some breaking changes. Requires research. |
| 20-39 | High technical complexity. Multiple breaking changes. Uncertain path. |
| 0-19 | Technically infeasible with current stack. Requires prerequisite work. |

---

### Dimension 6: Council Consensus (Weight: 10%)

**Definition:** How much do the 6 council agents agree on the direction?

**Scoring agent:** The Judge calculates this from the individual agent scores.

**Calculation:**
1. Convert each agent's score to a binary direction: ≥50 = SUPPORT_CHANGE, <50 = SUPPORT_STATUS_QUO
2. Count agents aligned with the dominant direction
3. Score = (aligned_agents / 6) × 100

| Alignment | Score |
|-----------|-------|
| 6/6 agents aligned | 100 |
| 5/6 agents aligned | 83 |
| 4/6 agents aligned | 67 |
| 3/6 agents aligned (split) | 50 |
| 2/6 agents aligned | 33 |
| 1/6 agents aligned | 17 |

---

## Final Score Calculation

```
DCS = (Evidence × 0.20) + (Historical × 0.15) + (Economic × 0.20) +
      (Risk × 0.20) + (Technical × 0.15) + (Consensus × 0.10)
```

## Verdict Thresholds

| DCS Range | Verdict |
|-----------|---------|
| 80-100 | **PROCEED** — Strong confidence. Move forward with the change. |
| 60-79 | **PROCEED WITH CONDITIONS** — Viable but address flagged risks first. |
| 40-59 | **DEFER** — Insufficient evidence. Gather more data before deciding. |
| 0-39 | **DO NOT PROCEED** — Evidence does not support the change. |

## Score Registry (MCP Tool)

The `score_dimension` MCP tool allows agents to register their scores programmatically:

```
Input: {
  dimension: "economic_viability",
  value: 72,
  rationale: "Break-even at 14 months based on module_economics output"
}
Output: { registered: true, session_total: [accumulated scores] }
```

The Judge reads all registered scores and computes the final DCS.
