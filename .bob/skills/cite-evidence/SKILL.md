---
name: cite-evidence
description: |-
  Enforces the Quorum evidence citation standard across all council agents.
  Every factual claim must cite a specific file:line or commit hash — no citation means the argument is inadmissible.
  Use this skill to validate citations before including them in council reports, or to teach agents the correct citation format.
  The cite_evidence MCP tool can validate that a file:line actually exists and return the code snippet.
---

# Skill: Evidence Citation Protocol

## The Sacred Rule

**Every factual claim in a council output must cite a specific, verifiable source.**

No citation → The Judge marks the argument as **inadmissible** → zero weight in the Decision Confidence Score.

This rule exists because architectural decisions made on "I think" and "usually" and "in my experience" have cost engineering teams millions of dollars in failed migrations and reverted refactors. Quorum is different: every argument is a legal exhibit.

---

## Valid Citation Formats

### 1. File and Line Reference
```
`path/to/file.py:42`
`src/auth/session_manager.js:156-203`
`packages/payment/src/index.ts:89`
```
Requirements:
- Path is relative to repository root
- Line number is specific (not just the file)
- The `cite_evidence` MCP tool can validate that the line exists and return the snippet

### 2. Git Commit Reference
```
`commit a3b8c91`
`commit a3b8c91d4e5f6a7b` (full hash also acceptable)
```
Requirements:
- Minimum 7 characters of the hash
- The commit must exist in the repository history
- Include the commit message excerpt in the argument text for context

### 3. Branch Reference
```
`branch: feature/auth-jwt-migration` (abandoned 2024-03-15)
`branch: refactor/payment-service` (merged 2023-11-02, commit a3b8c91)
```
Requirements:
- Full branch name
- State: abandoned, merged, or open
- Date of last activity

### 4. MCP Tool Attribution
```
`module_economics("src/legacy/etl/")` → LOC: 4,847, files: 23, churn: 47 commits/90d
`dependency_blast_radius("src/auth/")` → 34 direct consumers, 12 critical path
`git_archaeology("migration")` → 7 matching commits since 2022-01-01
```
Requirements:
- Tool name and input parameters shown
- Output values included in the citation

---

## Invalid Citations (Inadmissible)

| What Was Written | Why Inadmissible | What Is Required Instead |
|-----------------|-----------------|--------------------------|
| "The auth module is large" | No measurement | `module_economics("src/auth/")` → LOC: X |
| "This has been tried before" | No evidence | `commit abc1234` or `branch: feature/name` |
| "Most of the team uses this" | No source | `git shortlog -sn -- path/to/file` output |
| "The tests pass" | Which tests? | `path/to/test_file.py:line_range` |
| "Performance is acceptable" | No measurement | Benchmark file or CI metrics citation |
| "Dependencies are stable" | No source | `package.json:line` with version cited |

---

## Using the `cite_evidence` MCP Tool

The `cite_evidence` tool validates that a file and line range exists and returns the actual code snippet:

```
Input: { claim: "Session tokens stored in plaintext", file: "src/auth/session.py", lines: "45-52" }
Output: { valid: true, snippet: "session_data = {'token': token, 'user_id': user_id}\n..." }
```

Use this tool to verify citations before including them in a council report. If `valid: false`, the evidence cannot be cited.

---

## Enforcement Mechanism

The Judge applies a penalty to the Evidence Strength dimension for each inadmissible argument:

| Inadmissible Arguments | Evidence Strength Penalty |
|----------------------|--------------------------|
| 0 | No penalty |
| 1 | −10 points |
| 2 | −25 points |
| 3+ | −50 points |

An agent with 3+ inadmissible arguments in Round 1 may have their entire position discounted by The Judge.
