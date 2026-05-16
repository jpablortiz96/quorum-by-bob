---
name: cross-examination
description: Round 2 of the Quorum Council. Agents directly rebut the strongest opposing argument using evidence. This is what makes Quorum a tribunal, not a report.
---

# Cross-Examination: Round 2 Protocol

## What This Is

Round 1 is opening statements — each agent presents their position with evidence.  
Round 2 is the tribunal: agents are **forced to engage with each other's strongest argument** and either refute it with new evidence or concede it.

This is Quorum's key differentiator from "AI generates a report." A report has no adversarial pressure. Cross-examination does.

## The Three Confrontations

### 1. The Conservative vs. The Reformer
**Theme:** Status quo vs. change  
**Question:** Has the Reformer shown that the risk of changing is lower than the risk of not changing?

- **Conservative rebuttal target:** The Reformer's strongest economic or operational argument for change
- **Reformer rebuttal target:** The Conservative's strongest evidence that the current state is intentional, not broken

### 2. The Historian vs. The Engineer
**Theme:** Precedent vs. feasibility  
**Question:** Does the historical pattern predict future behavior, or has the technical context changed enough to break the analogy?

- **Historian rebuttal target:** The Engineer's claim that the current technical stack can support the proposed change
- **Engineer rebuttal target:** The Historian's pattern that most similar past changes failed

### 3. The Economist vs. The Risk Officer
**Theme:** Cost vs. risk  
**Question:** Is the economic case strong enough to justify accepting the identified risks?

- **Economist rebuttal target:** The Risk Officer's highest-severity risk item
- **Risk Officer rebuttal target:** The Economist's break-even timeline or ROI calculation

## Rebuttal Format (80-120 words each)

Each rebuttal MUST follow this structure:

```
**[Agent Name] rebuts [Opponent Name]:**

> "[Quote the opponent's strongest argument verbatim or near-verbatim]"

[Your rebuttal in 2-3 sentences. Either:]
- Refute with NEW evidence: cite a file:line or commit hash not used in Round 1
- Concede partially: "This is valid for X but does not account for Y because [evidence]"
- Expose a gap: "This claim assumes [X], but [file:line] shows [Y contradicts it]"

**Stance after cross-examination:** [MAINTAIN / REVISE / CONCEDE]
```

## How to Run This Skill

### Step 1: Read Round 1 reports
Load `docs/decisions/draft/the-*-round1.md` for each paired agent.

### Step 2: Run each confrontation
For each of the 3 pairs:
1. Show the Reformer's Round 1 argument to the Conservative. Ask for a rebuttal.
2. Show the Conservative's Round 1 argument to the Reformer. Ask for a rebuttal.

### Step 3: Write output files
Each rebuttal saves to `docs/decisions/draft/<slug>-round2-rebuttal.md`

File format:
```markdown
# [Agent Name] - Round 2 Rebuttal

**Session:** [ADR ID]  
**Opponent:** [Opponent slug]  
**Date:** [ISO date]

## Rebuttal

[80-120 word rebuttal following the format above]

## Citations

- [commit hash or file:line]
- [commit hash or file:line]
```

### Step 4: Judge synthesizes
After all 6 rebuttals are written, The Judge reads all of them and updates:
- Any DCS dimension scores that shifted due to strong rebuttal evidence
- The final verdict if the cross-examination changed the balance of evidence

## What Makes a Good Rebuttal

**Strong:** Cites specific evidence the opponent did not address  
**Strong:** Forces the opponent to revise their DCS score contribution  
**Weak:** Restates your own opening argument without engaging the opponent's specific claim  
**Weak:** Attacks the opponent's conclusions without addressing their evidence

## Example

```
**The Economist rebuts The Risk Officer:**

> "Current risk: booking.py has 10 consumers with criticality score 58/100 — 
> any modification to the hold implementation has broad blast radius."

The blast radius argument is valid — but it applies equally to the status quo.
`dependency_blast_radius("booking_system_backend/services/booking.py")` confirms 
10 consumers, but 8 are MED-criticality with clear API contracts. The high 
blast radius makes *any* future hold implementation expensive — not just this one.
Deferral does not eliminate the blast radius; it defers it to a higher-LOC system.

**Stance after cross-examination:** MAINTAIN - DEFER, but acknowledge blast radius is 
a fixed constraint, not an argument against consolidation specifically.
```
