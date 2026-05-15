# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Architecture Rules (Non-Obvious Only)

**Quorum Is a Multi-Agent Tribunal, Not a Single AI:**
- 7 specialized agents debate architectural decisions from different perspectives
- Each agent has a distinct role, primary MCP tool, and output format
- Agents operate independently in Round 1, then cross-examine in Round 2
- The Judge synthesizes in Round 3 without accessing the repository directly
- This architecture is unique to this project — not a standard pattern

**Council Protocol Enforces Evidence-Based Decision Making:**
- Every factual claim MUST cite `file:line` or `commit hash`
- Uncited arguments are flagged as "inadmissible" and receive zero weight
- This is enforced by The Judge in Round 3, not by linters or CI
- An agent with 3+ uncited arguments may have their entire position discounted
- Source: `.bob/rules/evidence-first.md`

**Decision Confidence Score Is a Weighted Aggregate:**
- 6 dimensions: Evidence Strength (20%), Historical Precedent (15%), Economic Viability (20%), Risk Assessment (20%), Technical Feasibility (15%), Council Consensus (10%)
- Risk Assessment dimension is INVERTED: 100 = low risk (safe), 0 = extreme risk
- All other dimensions: 100 = favorable, 0 = unfavorable
- The Judge must account for this inversion when calculating final DCS
- Verdict thresholds: 80-100 PROCEED, 60-79 PROCEED WITH CONDITIONS, 40-59 DEFER, 0-39 DO NOT PROCEED

**The Judge Has Restricted Edit Permissions by Design:**
- Judge mode can ONLY edit files matching `docs/decisions/*.md`
- This architectural constraint prevents The Judge from modifying source code
- The Judge synthesizes evidence but never touches the codebase being analyzed
- Source: `.bob/custom_modes.yaml:402-404`

**MCP Tools Have Hardcoded Economic and Risk Models:**
- Economic formulas: 1h per 50 LOC refactor, 30% testing overhead, 20% integration overhead
- Risk criticality: HIGH (auth/payment), MED (app code), LOW (test/mock)
- These models are NOT configurable per-call — they're baked into the tools
- To change them, you must modify `mcp-server/src/tools/*.ts`
- Source: `mcp-server/src/tools/module_economics.ts:110-127`, `dependency_blast_radius.ts:20-42`

**Round 1 Independence Is Enforced by Workflow, Not Code:**
- In Round 1, agents do NOT read each other's draft files
- This prevents groupthink and ensures diverse perspectives
- Cross-contamination only happens in Round 2 cross-examination
- Agents who reference other agents' Round 1 arguments are violating protocol
- Source: `.bob/skills/council-debate/SKILL.md:20-38`

**MCP Server Must Be Built Before Any Council Operation:**
- The quorum-tools MCP server requires compilation: `cd mcp-server && npm run build`
- Without dist/, all 5 MCP tools will fail silently
- Bob calls `node ./mcp-server/dist/index.js` via stdio transport
- This is a critical setup step that's easy to miss
- Source: `.bob/mcp.json:4-5`

**Demo Repository Is Hardcoded in All MCP Tools:**
- All tools default to `demo-repo/galaxium-travels` relative to project root
- This path is hardcoded in each tool's default parameter
- Run `scripts/clone-demo-repo.ps1` to populate this directory
- Tools return error JSON with hint if repo not found

**Bobcoin Budget Discipline Is a Competitive Advantage:**
- Total budget: 40 Bobcoins for 48-hour hackathon
- Conservative spending in first 12 hours = capacity for polish in final 12 hours
- Full `/council` debate: 1-2 Bobcoins (use sparingly)
- `/ask-historian`: 0.2 Bobcoins (use for pre-validation)
- `/verdict`: 0.3 Bobcoins (use when drafts already exist)
- Source: `.bob/rules/bobcoin-frugal.md`

**File Naming Conventions Are Strict and Sequential:**
- ADRs: `ADR-YYYY-NNN-kebab-case-title.md` (sequential numbering within each year)
- Draft reports: `[agent-name]-round[1|2].md` (lowercase with hyphens)
- Custom mode slugs: `the-conservative`, `the-risk-officer` (NOT `TheConservative`)
- Violating these conventions breaks the workflow

**TypeScript Configuration Uses Bundler Resolution:**
- MCP server uses `moduleResolution: "bundler"` in tsconfig.json
- This means imports MUST use `.js` extensions even for `.ts` files
- Example: `import { tool } from "./tools/tool.js";` (NOT `"./tools/tool.ts"`)
- Using `.ts` extensions will cause runtime errors after compilation
- Source: `mcp-server/tsconfig.json:5`