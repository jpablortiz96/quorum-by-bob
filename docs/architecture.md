# Quorum — System Architecture

## Full Flow Diagram

```mermaid
flowchart TD
    A[User opens Bob IDE\nFile → Open Folder → quorum-by-bob] --> B[User types /council in chat\nwith decision question]

    B --> C[council-start.md\nSlash Command Handler]
    C --> D[council-debate skill\nOrchestrates 3-round protocol]

    D --> E[Round 1: Opening Statements\nAll 6 agents — independent analysis]

    E --> E1[conservative mode\nStatus Quo Defense]
    E --> E2[reformer mode\nCase for Change]
    E --> E3[historian mode\nHistorical Precedent Report]
    E --> E4[economist mode\nEconomic Analysis]
    E --> E5[risk-officer mode\nBlast Radius Assessment]
    E --> E6[engineer mode\nTechnical Feasibility Report]

    E1 & E2 & E3 & E4 & E5 & E6 --> MCP[quorum-tools MCP Server\nTypeScript · STDIO transport]

    MCP --> T1[git_archaeology\nSearch commit history by keyword]
    MCP --> T2[dependency_blast_radius\nMap who imports this module]
    MCP --> T3[module_economics\nLOC, churn, cost estimates]
    MCP --> T4[cite_evidence\nValidate file:line references]
    MCP --> T5[score_dimension\nRegister DCS dimension scores]

    T1 & T2 & T3 & T4 & T5 --> REPO[(demo-repo/galaxium-travels\ngithub.com/IBM/galaxium-travels\nbranch: bob-learning-path-branch)]

    E1 & E2 & E3 & E4 & E5 & E6 --> DRAFT[docs/decisions/draft/\n12 agent report files]

    DRAFT --> F[Round 2: Cross-Examination\nPaired opponent debates]

    F --> F1[Conservative ↔ Reformer\nstability vs. change evidence]
    F --> F2[Historian ↔ Engineer\npast failures vs. current capability]
    F --> F3[Economist ↔ Risk Officer\nbreak-even math vs. failure cost]

    F1 & F2 & F3 --> DRAFT2[Updated draft files\nround2 responses]

    DRAFT2 --> G[Round 3: Verdict\njudge mode activated]

    G --> H[Decision Confidence Score\n6 dimensions × weighted average]
    G --> I[Architecture Decision Record\nADR-YYYY-NNN-slug.md]

    H --> J[Verdict: PROCEED /\nPROCEED WITH CONDITIONS /\nDEFER / DO NOT PROCEED]

    I --> K[docs/decisions/ADR-YYYY-NNN-slug.md\nReady to git commit]

    K --> L[Optional: /export-session\nCapture to bob_sessions/]
    K --> M[Optional: Web Dashboard\nweb/ — Next.js 15\nADR viewer + DCS history]
```

## Component Map

### Bob IDE Extension Layer

| Component | Location | Purpose |
|-----------|----------|---------|
| Custom Modes (×7) | `.bob/modes/` | Agent role definitions, output formats, evidence rules |
| Slash Commands (×4) | `.bob/commands/` | `/council`, `/ask-historian`, `/verdict`, `/export-session` |
| Skills (×4) | `.bob/skills/` | `council-debate`, `generate-adr`, `cite-evidence`, `score-decision` |
| Rules (×2) | `.bob/rules/` | `evidence-first`, `bobcoin-frugal` |
| MCP Config | `.bob/mcp.json` | Points to `mcp-server/dist/index.js` via STDIO |

### MCP Server (quorum-tools)

| Tool | Input | Output |
|------|-------|--------|
| `git_archaeology` | keyword, since_date | Commit list with hashes, dates, files changed |
| `dependency_blast_radius` | file_path | Consumer list with criticality scores |
| `module_economics` | directory_path | LOC, churn, cost/ROI estimates |
| `cite_evidence` | claim, file, lines | Validated snippet + formatted citation |
| `score_dimension` | dimension, agent, value, rationale | Running DCS total |

### Document Layer

| Path | Contents |
|------|---------|
| `docs/decisions/draft/` | Work-in-progress agent reports (12 files per session) |
| `docs/decisions/` | Final ADRs (committed, permanent record) |
| `bob_sessions/` | Hackathon submission artifacts (screenshots + markdown exports) |
| `AGENTS.md` | Bob reads this at session start — full council context |

## Data Flow: Evidence Chain

```
Repository file (galaxium-travels)
    → cite_evidence MCP tool (validates file:line exists)
    → Agent report (includes formatted citation)
    → Judge synthesizes citations
    → ADR Evidence Summary table
    → Git commit in quorum-by-bob repo
```

Every piece of evidence in a Quorum ADR traces back to a specific, verifiable line of code or commit hash in the target repository.

## Bobcoin Budget Allocation

```
Total budget: 40 Bobcoins

Setup + /init session:          ~2 Bobcoins
First /council demo:            ~2 Bobcoins
Additional council sessions:    ~6 Bobcoins (3 × 2)
Research + iteration:           ~8 Bobcoins
Submission polish:              ~5 Bobcoins
Reserve:                       ~17 Bobcoins
```
