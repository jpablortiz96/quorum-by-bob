# QUORUM — Agent Context File

> Bob reads this file at the start of every conversation. It is the single source of truth for how the Quorum Council operates. Do not modify it during a session; update it between sessions.

> **For debates about Galaxium Travels (the demo case), see also `docs/galaxium-context.md`** which captures non-obvious architectural patterns of that codebase (dual-protocol server, service layer error returns, double-patch test setup, snake_case type coupling, and more). Council agents should read it before starting any council session targeting `demo-repo/galaxium-travels/`.

---

## Bob IDE Configuration Files (load order)

1. **AGENTS.md** (this file) — project context, loaded on every conversation
2. **`.bob/custom_modes.yaml`** — defines the 7 Council agents as selectable modes (🛡️ Conservative, 🔥 Reformer, 📜 Historian, 💰 Economist, ⚠️ Risk Officer, 🔧 Engineer, ⚖️ Judge)
3. **`.bob/skills/*/SKILL.md`** — reusable workflow recipes Bob activates contextually (`council-debate`, `generate-adr`, `cite-evidence`, `score-decision`)
4. **`.bob/rules/*.md`** — persistent instructions injected into every prompt (`evidence-first`, `bobcoin-frugal`)
5. **`.bob/mcp.json`** — registers the `quorum-tools` MCP server with 5 tools

## How to Invoke the Council

**For a full architectural debate:**
1. In Bob IDE, open the mode selector (bottom-left dropdown or `@` in chat)
2. Select the first agent: `🛡️ The Conservative`
3. Ask the decision question: *"Analyze whether we should [decision]"*
4. Repeat for each agent in order (Reformer → Historian → Economist → Risk Officer → Engineer)
5. Switch to `⚖️ The Judge` and ask: *"Synthesize the council reports and produce the verdict and ADR"*
6. The Judge saves the ADR to `docs/decisions/`

**Shortcut — use the `council-debate` skill:**
- In chat, reference the skill: *"Use the council-debate skill to debate: [decision question]"*
- Bob will orchestrate the 3-round protocol automatically

**For quick git archaeology only:**
- Switch to `📜 The Historian` and ask: *"Search for commits related to [keyword]"*
- The Historian uses the `git_archaeology` MCP tool

**All Council agents MUST cite evidence** (`file:line` or `commit hash`) before every claim. Uncited arguments are flagged as inadmissible by The Judge and receive zero weight.

---

## Project Purpose

**Quorum** is the first Multi-Agent Tribunal for Architectural Decision-Making. When a Tech Lead faces a high-stakes architectural decision — migrate a service, deprecate a legacy module, extract a microservice — instead of relying on tribal knowledge and gut feel, they convene a Council of 7 specialized AI agents. Each agent analyzes the repository from a distinct perspective, citing specific file references and commit hashes. The Council debates for 3 rounds, then The Judge synthesizes the evidence into a Decision Confidence Score (0–100) and a committable Architecture Decision Record (ADR).

Quorum solves a real and expensive problem: architecture decisions made without evidence cost teams $50K–$500K per incident in failed migrations, partial rollbacks, and accumulated technical debt. Quorum makes every significant decision auditable, evidence-based, and reproducible.

This project is built for the **IBM Bob Hackathon (May 2026)** using Bob IDE as the primary runtime environment. Bob's full-repo context, custom modes, slash commands, skills, and MCP server integration are what make Quorum possible — no other IDE could host this system.

---

## The Council Protocol

Quorum sessions follow a strict 3-round protocol. Do not skip rounds.

### Round 1 — Opening Statements
All 6 non-Judge agents analyze the decision question independently and produce their opening report. Agents do NOT read each other's output in Round 1. Each must produce a minimum of 2 cited pieces of evidence (`file:line` or `commit hash`).

Agent order: Conservative → Reformer → Historian → Economist → Risk Officer → Engineer

Draft outputs saved to: `docs/decisions/draft/[agent]-round1.md`

### Round 2 — Cross-Examination
Agents are paired with their logical opponent and must directly engage with the opponent's strongest argument from Round 1:
- **Conservative ↔ Reformer** (stability vs. change)
- **Historian ↔ Engineer** (past failures vs. current capability)
- **Economist ↔ Risk Officer** (break-even math vs. failure cost)

Round 2 outputs saved to: `docs/decisions/draft/[agent]-round2.md`

### Round 3 — Verdict
The Judge reads all 12 draft files (or however many exist), calculates the Decision Confidence Score, flags inadmissible evidence, and produces the final ADR. Saved to `docs/decisions/ADR-YYYY-NNN-slug.md`.

---

## The 7 Council Agents

| # | Name | Role | Primary Tool | Output |
|---|------|------|-------------|--------|
| 1 | The Conservative | Defends status quo with stability evidence | `cite_evidence` | Status Quo Defense |
| 2 | The Reformer | Argues for change with problem evidence | `cite_evidence` | Case for Change |
| 3 | The Historian | Git archaeology — precedents and patterns | `git_archaeology` | Historical Precedent Report |
| 4 | The Economist | Quantifies costs, ROI, break-even | `module_economics` | Economic Analysis |
| 5 | The Risk Officer | Maps blast radius and critical paths | `dependency_blast_radius` | Blast Radius Assessment |
| 6 | The Engineer | Assesses technical feasibility | `cite_evidence` | Technical Feasibility Report |
| 7 | The Judge | Synthesizes all evidence, emits verdict | `score_dimension` | Verdict + ADR |

Custom modes for each agent are in `.bob/modes/`. Activate via Bob IDE mode selector.

---

## Evidence Citation Rule (SACRED)

**Every factual claim must cite a specific, verifiable source.**

Valid citation formats:
- `path/to/file.py:42` — file and line number
- `path/to/file.py:42-58` — file and line range
- `commit a3b8c91` — git commit hash (minimum 7 chars)
- `branch: feature/name` — branch reference with state and date
- `module_economics("src/dir")` → [metric] — MCP tool output

**If an agent cannot cite evidence, they MUST write:** `No evidence found for this point.`

Speculation without citation is **inadmissible**. The Judge flags inadmissible arguments and reduces their weight in the Decision Confidence Score. An agent with 3+ uncited arguments may have their entire position discounted.

---

## Decision Confidence Score

The DCS is a weighted aggregate of 6 dimensions, each scored 0–100:

| Dimension | Weight | Scoring Agent | Note |
|-----------|--------|---------------|------|
| Evidence Strength | 20% | The Judge (aggregated) | Quality of citations across all agents |
| Historical Precedent | 15% | The Historian | How much relevant history exists |
| Economic Viability | 20% | The Economist | Break-even and ROI |
| Risk Assessment | 20% | The Risk Officer | **INVERTED**: 100 = low risk |
| Technical Feasibility | 15% | The Engineer | Stack compatibility, migration path |
| Council Consensus | 10% | The Judge | Agreement across the 6 agents |

**Verdict thresholds:**
- 80–100 → **PROCEED**
- 60–79 → **PROCEED WITH CONDITIONS**
- 40–59 → **DEFER** (gather more evidence)
- 0–39 → **DO NOT PROCEED**

---

## ADR Output Format

Every Quorum session produces an ADR with these sections:

```
# ADR-YYYY-NNN: [Short Decision Title]
Status: Accepted | Rejected | Deferred
Date: YYYY-MM-DD
Confidence Score: X/100

## Context      — observable facts, cited
## Decision     — one clear sentence + elaboration
## Consequences — Positive / Negative / Neutral
## Evidence Summary — table: Agent | Finding | Source
## Decision Confidence Score Breakdown — the 6 dimensions
## Council Composition — session metadata
```

Filename format: `ADR-YYYY-NNN-kebab-case-title.md`
Save location: `docs/decisions/`

---

## File Map

```
.bob/
├── modes/          7 custom agent modes (conservative, reformer, historian, economist, risk-officer, engineer, judge)
├── commands/       Slash commands: /council, /ask-historian, /verdict, /export-session
├── skills/         council-debate, generate-adr, cite-evidence, score-decision
├── rules/          evidence-first, bobcoin-frugal
└── mcp.json        MCP server configuration

mcp-server/         TypeScript MCP server (quorum-tools)
  src/tools/        git_archaeology, dependency_blast_radius, module_economics, cite_evidence, score_dimension

demo-repo/          Target repository for analysis (galaxium-travels)
docs/
  decisions/        Final ADRs (committed)
  decisions/draft/  Work-in-progress agent outputs (not committed)
  architecture.md   System architecture diagram
  council-protocol.md  Full protocol documentation

bob_sessions/       Required hackathon submission artifacts
  screenshots/      PNG exports from Bob IDE
  exports/          Markdown exports from Bob IDE

scripts/
  verify-setup.ps1      Environment verification
  clone-demo-repo.ps1   Clone galaxium-travels
  bobcoin-log.md        Manual Bobcoin budget tracker
```

---

## Bob Usage Strategy

**Total budget: 40 Bobcoins for ~48 hours.**

| Operation | Estimated Cost | When to Use |
|-----------|---------------|-------------|
| `/council` (full 7-agent debate) | 1–2 Bobcoins | Major architectural decisions |
| `/ask-historian [keyword]` | 0.2 Bobcoins | Quick precedent check |
| `/verdict` (Judge only, drafts exist) | 0.3 Bobcoins | Re-running verdict after edits |
| Single file read + analysis | 0.05 Bobcoins | Research, debugging |
| Multi-file analysis (>10 files) | 0.3–0.5 Bobcoins | Use targeted reads instead |

**Frugality rules:**
1. Use `/ask-historian` before `/council` to pre-validate relevance
2. Use `/verdict` when Round 1+2 drafts already exist — don't re-run all 6 agents
3. Never do a full repo scan when a targeted file read will do
4. After each significant operation, run `/export-session` and update `scripts/bobcoin-log.md`

**Target allocation:**
- Hours 0–12: Setup + first demo council session (8–10 Bobcoins)
- Hours 12–24: 2–3 additional council sessions on galaxium-travels (10–15 Bobcoins)
- Hours 24–36: Polish, README, submission prep (5–8 Bobcoins)

---

## Technical Implementation Details (Non-Obvious)

### MCP Server Architecture

**Build Requirement (Critical):**
- MCP server MUST be compiled before use: `cd mcp-server && npm run build`
- Bob IDE calls `node ./mcp-server/dist/index.js` via stdio transport (`.bob/mcp.json:4-5`)
- If dist/ doesn't exist, all MCP tools will fail silently

**Default Repository Path:**
- All MCP tools default to `demo-repo/galaxium-travels` relative to project root
- Run `scripts/clone-demo-repo.ps1` to populate this directory
- Tools return error JSON with hint if repo not found: `{ error: "...", hint: "Run scripts/clone-demo-repo.ps1" }`

**Tool Return Format:**
- All tools return JSON **strings**, not objects (`mcp-server/src/index.ts:167-201`)
- Error responses must set `isError: true` and include `{ error: string }` structure
- Success responses are JSON strings that must be parsed by the calling agent

### Economic Calculation Formulas (Hardcoded)

The Economist's `module_economics` tool uses these non-configurable formulas:

```
Refactor hours = LOC / 50
Testing hours = Refactor hours × 0.3
Integration hours = Refactor hours × 0.2
Total change cost = (Refactor + Testing + Integration) × hourly_rate

Annual maintenance = commits_last_90_days × 2 hours
Annual bug tax = commits_last_90_days × 1.5 hours
Annual onboarding = (LOC × 0.5) / 100 hours
Break-even months = Total change cost / (Annual status quo cost / 12)
```

Source: `mcp-server/src/tools/module_economics.ts:110-127`

### Blast Radius Criticality Patterns

The Risk Officer's `dependency_blast_radius` tool classifies files by regex patterns:

**HIGH criticality** (15 points per consumer):
- `/auth|payment|billing|security|login|checkout|transaction|order|account|wallet/i`

**LOW criticality** (1 point per consumer):
- `/test|spec|mock|fixture|\.stories\.|storybook|example|demo|playground/i`

**MED criticality** (5 points per consumer):
- Everything else

**Criticality Score formula:**
```
score = max(0, 100 - HIGH_count×15 - MED_count×5 - LOW_count×1)
```

Source: `mcp-server/src/tools/dependency_blast_radius.ts:20-125`

### The Judge's Edit Restrictions

The Judge mode has a fileRegex constraint that prevents it from editing source code:

```yaml
groups:
  - read
  - mcp
  - - edit
    - fileRegex: "docs/decisions/.*\\.md$"
      description: Only ADRs in docs/decisions/
```

Source: `.bob/custom_modes.yaml:400-404`

This ensures The Judge can only write ADRs, never modify the codebase being analyzed.

### Risk Assessment Dimension Is Inverted

**CRITICAL:** The Risk Assessment dimension in the Decision Confidence Score uses inverted scoring:
- 100 = low risk (safe to proceed)
- 0 = extreme risk (do not proceed)

All other dimensions use standard scoring (100 = favorable). The Judge must account for this when calculating the final DCS.

Source: `AGENTS.md:113` and `.bob/custom_modes.yaml:248`

### Git Archaeology Search Limits

The Historian's `git_archaeology` tool has these constraints:
- Returns maximum 50 commits (`.git_archaeology.ts:45`)
- Shows maximum 10 files changed per commit (`.git_archaeology.ts:55`)
- Defaults to 2 years of history if `since_date` not specified (`.git_archaeology.ts:23`)
- Commit hashes truncated to 7 characters (`.git_archaeology.ts:61`)

### Round 1 Independence Rule

In Round 1, agents operate **completely independently**:
- They do NOT read each other's draft files
- They analyze the same decision question from their unique perspective
- Cross-contamination of arguments only happens in Round 2 cross-examination

This is enforced by the `council-debate` skill workflow, not by technical restrictions.

Source: `.bob/skills/council-debate/SKILL.md:20-38`

### TypeScript Configuration (MCP Server)

The MCP server uses ESNext modules with bundler resolution:
```json
{
  "module": "ESNext",
  "moduleResolution": "bundler",
  "target": "ES2022"
}
```

This means:
- All imports must use `.js` extensions even for `.ts` files
- Cannot use CommonJS `require()` — must use ES6 `import`
- Node.js 20+ required (specified in `package.json:23`)

Source: `mcp-server/tsconfig.json:4-5`

### File Naming Conventions (Strict)

**ADR filenames:**
- Format: `ADR-YYYY-NNN-kebab-case-title.md`
- Example: `ADR-2026-001-migrate-auth-to-jwt.md`
- Sequential numbering within each year

**Draft report filenames:**
- Format: `[agent-name]-round[1|2].md`
- Agent names: `conservative`, `reformer`, `historian`, `economist`, `risk-officer`, `engineer`
- Example: `conservative-round1.md`, `economist-round2.md`

**Custom mode slugs:**
- Format: lowercase with hyphens
- Example: `the-conservative`, `the-risk-officer`
- NOT: `TheConservative`, `the_risk_officer`

Source: `.bob/custom_modes.yaml:2,44,86,140,201,253,305` and `.bob/skills/council-debate/SKILL.md:94-111`

---

## Build & Test Commands

### MCP Server
```bash
cd mcp-server
npm install              # Install dependencies
npm run build            # Compile TypeScript → dist/
npm run dev              # Watch mode for development
npm run clean            # Remove dist/ directory
npm start                # Run compiled server (for testing)
```

### Web Dashboard (Next.js)
```bash
cd web
npm install              # Install dependencies
npm run dev              # Development server (port 3000)
npm run build            # Production build
npm run start            # Serve production build
npm run lint             # Run Next.js linter
```

### Setup & Verification
```powershell
.\scripts\verify-setup.ps1          # Check Node.js, npm, git, Bob IDE
.\scripts\verify-bob-config.ps1     # Validate .bob/ directory structure
.\scripts\clone-demo-repo.ps1       # Clone galaxium-travels demo repo
```

### Bobcoin Budget Tracking
After each significant operation, update the manual log:
```powershell
# Edit scripts/bobcoin-log.md with actual consumption from Bob IDE
```

---

## Code Style Guidelines

### TypeScript (MCP Server)

**Imports:**
- Use `.js` extensions for local imports even though files are `.ts`
- Example: `import { tool } from "./tools/tool.js";`

**Error Handling:**
- All tool functions must return JSON strings
- Errors: `JSON.stringify({ error: message, hint?: string })`
- Success: `JSON.stringify({ ...data }, null, 2)` (pretty-printed)

**Zod Schemas:**
- Export input schemas from each tool file
- Example: `export const ToolInputSchema = z.object({ ... });`
- Use `.parse()` for validation, not `.safeParse()`

**Async/Await:**
- All tool functions are async
- Use try-catch for git operations (may fail if repo doesn't exist)
- Return error JSON instead of throwing

### Markdown (ADRs & Reports)

**Evidence Citations:**
- Always use backticks: `` `path/to/file.py:42` ``
- Commit hashes: `` `commit a3b8c91` `` (minimum 7 chars)
- MCP tool output: `` `module_economics("src/dir")` → [metric] ``

**Tables:**
- Use GitHub-flavored Markdown table syntax
- Always include header separator row
- Align columns for readability in source

**Headings:**
- Use `##` for major sections in ADRs
- Use `###` for subsections
- Never skip heading levels

---
- Hours 36–48: Reserve for demo fixes (remaining budget)
