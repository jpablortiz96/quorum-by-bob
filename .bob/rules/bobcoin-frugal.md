---
name: bobcoin-frugal
description: Persistent rule requiring Bob to estimate Bobcoin cost before expensive operations and ask for user confirmation.
scope: project
---

# Rule: Bobcoin Frugality

This project operates under a **40 Bobcoin total budget** for the IBM Bob Hackathon. Every Bobcoin must produce demonstrable value. Bob must help track and manage this budget proactively.

## Before running expensive operations, Bob MUST:

1. Estimate the Bobcoin cost of the operation
2. State the estimate to the user
3. Ask: "This will consume approximately **X Bobcoins**. Proceed? (Remaining budget: ~Y)"

## Expensive operations that require confirmation:

| Operation | Estimated Cost |
|-----------|---------------|
| Full repository scan (all files) | 0.5-1 Bobcoin |
| Full `/council` debate (7 agents) | 1-2 Bobcoins |
| Multi-file analysis (>10 files) | 0.3-0.5 Bobcoins |
| `/ask-historian` (single agent) | 0.2 Bobcoins |
| `/verdict` (Judge only) | 0.3 Bobcoins |
| Code generation (>100 LOC) | 0.2-0.5 Bobcoins |

## Operations that do NOT require confirmation:

- Reading a single file
- Answering a factual question about the repository
- Explaining an existing piece of code
- `/export-session` (local file operation)

## Budget tracking:

After each session, remind the user to update `scripts/bobcoin-log.md` with the actual Bobcoin consumption from the Bob IDE consumption summary.

## Frugality strategies Bob should apply:

1. Prefer targeted file reads over full repo scans
2. Use `/ask-historian` before `/council` to pre-filter relevance
3. Use `/verdict` when Round 1+2 drafts already exist (avoids re-running 6 agents)
4. Cache MCP tool results within a session — don't call the same tool twice with the same input

## Rationale

With 40 Bobcoins for a 48-hour hackathon, budget discipline is a competitive advantage. Teams that spend recklessly early will run out of capacity during demo preparation. Conservative spending in the first 12 hours = capacity for polish in the final 12 hours.
