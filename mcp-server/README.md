# quorum-tools — MCP Server

TypeScript MCP server that gives Bob IDE five specialized tools for evidence-based architectural analysis. Connects to Bob via STDIO transport as configured in `.bob/mcp.json`.

## Tools

### `git_archaeology`
Search git history for commits matching a keyword pattern. Used by The Historian to surface precedents, abandoned migrations, and recurring failure patterns.

**Input:**
- `keyword` (required) — Pattern to search in commit messages (e.g., `migration`, `refactor`, `revert`)
- `since_date` (optional) — ISO date string, defaults to 2 years ago
- `repo_path` (optional) — Absolute path to git repo, defaults to `demo-repo/galaxium-travels`

**Output:** Commits with hashes, dates, authors, messages, files changed. Relevant branches list.

---

### `dependency_blast_radius`
Analyze which files import or depend on a given module. Used by The Risk Officer to map the impact of a proposed change.

**Input:**
- `file_path` (required) — Path relative to repo root (e.g., `src/auth/session_manager.py`)
- `repo_path` (optional) — Absolute path to git repo

**Output:** Consumer list with criticality ratings (HIGH/MED/LOW) and overall blast radius score (100 = low risk, 0 = high risk).

---

### `module_economics`
Compute economic metrics for a module directory. Used by The Economist for cost/benefit analysis.

**Input:**
- `directory_path` (required) — Path relative to repo root (e.g., `src/legacy/etl`)
- `repo_path` (optional) — Absolute path to git repo
- `hourly_rate` (optional) — Developer rate in USD, defaults to 80

**Output:** LOC, file count, git churn (last 90 days), cost of change estimate, cost of status quo per year, break-even timeline, 3-year ROI.

---

### `cite_evidence`
Validate that a `file:line` reference exists in the repository and return the actual code snippet. Used to verify citations before including them in council reports.

**Input:**
- `claim` (required) — The factual claim being cited
- `file` (required) — File path relative to repo root
- `lines` (required) — Line number or range (e.g., `42` or `42-58`)
- `repo_path` (optional) — Absolute path to git repo

**Output:** `{ valid: true/false, snippet: "...", formatted_citation: "..." }`

---

### `score_dimension`
Register a council agent's score for one of the 6 Decision Confidence Score dimensions. Automatically computes the running DCS total.

**Input:**
- `session_id` (required) — Session identifier (e.g., `ADR-2026-001`)
- `dimension` (required) — One of: `evidence_strength`, `historical_precedent`, `economic_viability`, `risk_assessment`, `technical_feasibility`, `council_consensus`
- `agent` (required) — One of: `conservative`, `reformer`, `historian`, `economist`, `risk_officer`, `engineer`, `judge`
- `value` (required) — Score 0–100
- `rationale` (required) — One sentence with evidence reference

**Output:** Running DCS total, current verdict, per-dimension breakdown.

---

## Setup

```powershell
cd mcp-server
npm install
npm run build
```

This compiles TypeScript to `dist/`. The `.bob/mcp.json` config points Bob to `./mcp-server/dist/index.js`.

## Development

```powershell
npm run dev   # watch mode — recompiles on file changes
npm start     # run compiled server directly
npm run build # one-time compile
```

## Configuration

Bob IDE reads `.bob/mcp.json`:

```json
{
  "mcpServers": {
    "quorum-tools": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "type": "stdio",
      "alwaysAllow": [
        "git_archaeology",
        "dependency_blast_radius",
        "module_economics",
        "cite_evidence",
        "score_dimension"
      ]
    }
  }
}
```

The `alwaysAllow` list means Bob can call these tools without asking for confirmation — critical for smooth council sessions.

## Repository Target

By default, all tools point to `demo-repo/galaxium-travels`. Clone it first:

```powershell
powershell -ExecutionPolicy Bypass -File ../scripts/clone-demo-repo.ps1
```

Override the target with the `repo_path` parameter on any tool call.

## Architecture

```
src/
├── index.ts                    MCP server entrypoint (STDIO transport)
└── tools/
    ├── git_archaeology.ts      simple-git: log search by keyword
    ├── dependency_blast_radius.ts  fs: regex import scanning
    ├── module_economics.ts     fs + simple-git: LOC + churn + cost math
    ├── cite_evidence.ts        fs: file:line validation + snippet extraction
    └── score_dimension.ts      fs: DCS registry in docs/decisions/draft/
```

## Requirements

- Node.js >= 20
- TypeScript >= 5.6
- Git available in PATH (for `git_archaeology` and `module_economics`)
