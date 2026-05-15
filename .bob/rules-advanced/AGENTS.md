# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Advanced Coding Rules (Non-Obvious Only)

**MCP Server Build Is Mandatory Before Any Council Operation:**
- The MCP server MUST be compiled before Bob can use any Council tools
- Run `cd mcp-server && npm run build` to create the dist/ directory
- Without dist/, all 5 MCP tools (git_archaeology, dependency_blast_radius, module_economics, cite_evidence, score_dimension) will fail silently
- Bob calls `node ./mcp-server/dist/index.js` via stdio transport defined in `.bob/mcp.json:4-5`

**TypeScript Import Extensions Are Counterintuitive:**
- All local imports MUST use `.js` extensions even though source files are `.ts`
- Example: `import { tool } from "./tools/tool.js";` (NOT `"./tools/tool.ts"`)
- This is due to `moduleResolution: "bundler"` in `mcp-server/tsconfig.json:5`
- Using `.ts` extensions will cause runtime errors after compilation

**MCP Tools Return JSON Strings, Not Objects:**
- All 5 MCP tool functions return `JSON.stringify()` output, not plain objects
- Calling agents must parse the JSON string to access data
- Error responses include `{ error: string, hint?: string }` and set `isError: true`
- Success responses are pretty-printed with `JSON.stringify(data, null, 2)`
- Source: `mcp-server/src/index.ts:167-201`

**Evidence Citation Is Enforced by The Judge, Not Linters:**
- Every factual claim in Council reports MUST cite `file:line` or `commit hash`
- Uncited arguments are flagged as "inadmissible" and receive zero weight in Decision Confidence Score
- An agent with 3+ uncited arguments may have their entire position discounted
- This rule applies even outside full Council sessions (see `.bob/rules/evidence-first.md`)
- Format: `` `path/to/file.py:42` `` or `` `commit a3b8c91` ``

**The Judge Cannot Edit Source Code:**
- The Judge mode has a fileRegex constraint: `docs/decisions/.*\.md$`
- This prevents The Judge from modifying the codebase being analyzed
- The Judge can ONLY write ADRs to `docs/decisions/`
- Source: `.bob/custom_modes.yaml:402-404`

**Economic Formulas Are Hardcoded in module_economics Tool:**
- Refactor estimate: 1 hour per 50 LOC (not configurable per-call)
- Testing overhead: 30% of implementation time
- Integration overhead: 20% of implementation time
- Annual maintenance: commits_last_90_days × 2 hours
- Annual bug tax: commits_last_90_days × 1.5 hours
- These formulas cannot be overridden without modifying `mcp-server/src/tools/module_economics.ts:110-127`

**Blast Radius Criticality Uses Regex Pattern Matching:**
- HIGH criticality (15 points): `/auth|payment|billing|security|login|checkout|transaction|order|account|wallet/i`
- LOW criticality (1 point): `/test|spec|mock|fixture|\.stories\.|storybook|example|demo|playground/i`
- MED criticality (5 points): everything else
- Score formula: `max(0, 100 - HIGH×15 - MED×5 - LOW×1)`
- Source: `mcp-server/src/tools/dependency_blast_radius.ts:20-42`

**Round 1 Agents Must Operate Independently:**
- In Round 1, agents do NOT read each other's draft files
- Cross-contamination only happens in Round 2 cross-examination
- This is enforced by workflow, not technical restrictions
- Agents who reference other agents' Round 1 arguments are violating protocol
- Source: `.bob/skills/council-debate/SKILL.md:20-38`

**File Naming Conventions Are Strict:**
- ADRs: `ADR-YYYY-NNN-kebab-case-title.md` (e.g., `ADR-2026-001-migrate-auth.md`)
- Draft reports: `[agent-name]-round[1|2].md` (e.g., `conservative-round1.md`)
- Agent names: `conservative`, `reformer`, `historian`, `economist`, `risk-officer`, `engineer` (lowercase with hyphens)
- Custom mode slugs: `the-conservative`, `the-risk-officer` (NOT `TheConservative` or `the_risk_officer`)

**Demo Repository Path Is Hardcoded:**
- All MCP tools default to `demo-repo/galaxium-travels` relative to project root
- This path is hardcoded in each tool's default parameter
- Run `scripts/clone-demo-repo.ps1` to populate this directory
- Tools return `{ error: "...", hint: "Run scripts/clone-demo-repo.ps1" }` if repo not found

**MCP and Browser Tools Are Available in Advanced Mode:**
- Advanced mode has access to MCP server tools for evidence gathering
- Use git_archaeology, dependency_blast_radius, module_economics, cite_evidence, score_dimension
- Browser tools may also be available for external research