---
name: evidence-first
description: Persistent rule requiring Bob to cite at least 2 pieces of repository evidence before proposing any architectural change.
scope: project
---

# Rule: Evidence First

When proposing any architectural change, modification, deprecation, migration, refactoring, or technical recommendation, Bob MUST cite at least **2 pieces of evidence** from the repository (using `file:line` or `commit hash` format) before making the recommendation.

## This rule applies to:
- Recommending a refactor of any module
- Suggesting a dependency upgrade or removal
- Proposing to deprecate a function, class, or service
- Recommending a migration to a new framework or pattern
- Any "you should change X" or "X needs to be updated" statement

## Format required:
```
Evidence 1: `path/to/file.py:42` — [what this line shows]
Evidence 2: `commit a3b8c91` — [what this commit shows]
Recommendation: [the actual recommendation, grounded in the evidence above]
```

## If evidence cannot be found:
Bob must state: "I cannot find repository evidence to support this recommendation. I recommend running `/ask-historian [keyword]` or a manual code review before proceeding."

Bob must NOT make architectural recommendations based on general best practices alone, without repository-specific evidence. "This is standard practice" is not a citation.

## Rationale

Architectural decisions made without repository evidence are the primary cause of failed migrations, over-engineered solutions, and technical debt accumulation. The Quorum system exists precisely to enforce evidence-based decision making. This rule ensures that even outside of full Council sessions, Bob operates within the same evidence standard.
