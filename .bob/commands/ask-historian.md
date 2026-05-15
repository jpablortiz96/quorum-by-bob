---
name: ask-historian
description: Invokes only The Historian for rapid git archaeology without convening the full Council.
slash_command: /ask-historian
usage: /ask-historian [keyword or module_path]
estimated_cost: 0.2 Bobcoins
---

# /ask-historian — Rapid Git Archaeology

## Usage

```
/ask-historian authentication
/ask-historian src/legacy/etl/
/ask-historian migration
/ask-historian payment revert
```

## What This Command Does

Invokes only The Historian mode to search git history for patterns, abandoned branches, reverts, and precedents related to the given keyword or module path. Does NOT convene the full Council.

## When To Use

- Quick sanity check before starting a full `/council` session
- Investigating whether a specific change has been attempted before
- Finding the history of a problematic module
- Pre-research to inform a new architectural decision

## Instructions for Bob

When this command is invoked:

1. Parse the keyword or module path from the command arguments.
2. Activate The Historian custom mode.
3. Use the `git_archaeology` MCP tool with the provided keyword and a `since_date` of 2 years ago.
4. The Historian produces a Historical Precedent Report for the given subject.
5. Present the report inline in the chat — do NOT save to `docs/decisions/draft/` unless the user requests it.

## Output

The Historian's full **Historical Precedent Report** including:
- Timeline table of relevant commits
- Pattern analysis (up to 3 precedents)
- Historian's Observation (neutral, evidence-only)

## Cost Note

Single-agent invocation. Estimated cost: **0.2 Bobcoins**. Significantly cheaper than a full `/council` session.
