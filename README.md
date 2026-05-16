# QUORUM

**Stop making architecture decisions alone. Convene the Council.**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![IBM Bob Hackathon](https://img.shields.io/badge/IBM%20Bob%20Hackathon-May%202026-orange)

---

## The Problem

Architecture decisions are the most expensive decisions in software engineering — and the least documented.

The average failed migration costs between $50,000 and $500,000 in engineering hours, rollback operations, and downstream incidents. Teams routinely migrate to microservices without analyzing blast radius, deprecate services that have 34 undocumented consumers, or reject refactors that would have paid back in 8 months — because nobody ran the numbers. The decision gets made in a Slack thread, survives in tribal knowledge, and vanishes when the decision-maker leaves the company.

The Architecture Decision Record was invented to fix this. The problem: nobody writes ADRs because they require the kind of deep, multi-perspective analysis that no single engineer has time to do. So decisions go undocumented. Mistakes repeat. The same failed migration gets attempted three times in five years because the git history is unread.

Quorum changes this. Not by asking engineers to write more documents — but by automating the adversarial analysis process that produces those documents.

---

## The Solution

Quorum is a **Multi-Agent Tribunal for Architectural Decisions** running inside Bob IDE.

When you face a high-stakes architectural decision, you type one command:

```
/council Should we migrate the auth service from session tokens to JWT?
```

Quorum convenes a Council of 7 specialized agents. Each agent reads the actual repository — the real code, the real git history, the real dependency graph. They debate across 3 structured rounds, citing specific file references and commit hashes. Then The Judge synthesizes the evidence into a **Decision Confidence Score** (0–100) and a **committable Architecture Decision Record**.

The whole session runs in Bob IDE. The ADR goes directly into your repository. The decision is documented, reproducible, and auditable.

**What you get:**
- Evidence-based verdict in under 20 minutes
- Decision Confidence Score across 6 measurable dimensions
- Committable ADR with cited evidence, not opinions
- Permanent record that survives team turnover

---

## The Council

Seven agents. Each one reads the repository from a distinct lens. Each one cites evidence or stays silent.

| Agent | Role | What They Cite |
|-------|------|----------------|
| **The Conservative** | Defends the status quo | Test coverage, low churn, absence of bugs, stable dependencies |
| **The Reformer** | Argues for change | TODOs, recurring bugs, build times, deprecation warnings, technical debt |
| **The Historian** | Git archaeology | Commit history, abandoned branches, past migration attempts, reverts |
| **The Economist** | Quantifies cost/benefit | LOC, dev hours, $80/h rate, break-even timeline, 3-year ROI |
| **The Risk Officer** | Maps blast radius | Direct consumers, critical paths, rollback complexity, failure scenarios |
| **The Engineer** | Technical feasibility | Stack versions, breaking changes, migration patterns, dependency compatibility |
| **The Judge** | Synthesizes and decides | All of the above — produces DCS + ADR |

**The Evidence Rule:** Every factual claim must cite `file:line` or `commit hash`. If an agent cannot cite evidence, they must declare "No evidence found." The Judge flags uncited arguments as inadmissible and reduces their weight.

---

## How Bob Powers Quorum

Bob IDE is not just a code editor in this project — it is the runtime infrastructure for the entire multi-agent system. Four Bob extension mechanisms work together:

**1. Custom Modes** — Each of the 7 council agents is a Custom Mode in `.bob/modes/`. Bob activates the agent's full role definition, output format, and evidence rules automatically when the mode is selected.

**2. Slash Commands** — `/council`, `/ask-historian`, `/verdict`, and `/export-session` are Bob slash commands in `.bob/commands/`. They orchestrate multi-agent sessions with a single typed command.

**3. Skills** — `council-debate`, `generate-adr`, `cite-evidence`, and `score-decision` are reusable Bob Skills in `.bob/skills/`. They encode the council protocol, ADR format, citation standards, and scoring algorithm as recipes Bob follows.

**4. MCP Server** — `quorum-tools` is a TypeScript MCP server that gives Bob five specialized tools: `git_archaeology`, `dependency_blast_radius`, `module_economics`, `cite_evidence`, and `score_dimension`. These tools access the actual repository data — real commit history, real import graphs, real line counts — that make cited evidence possible.

Without Bob's full-repository context, MCP integration, and multi-mode orchestration, the evidence-based debate protocol is not possible.

---

## Quickstart

```powershell
# 1. Clone Quorum
git clone https://github.com/jpablortiz96/quorum-by-bob.git
cd quorum-by-bob

# 2. Clone the demo repository
powershell -ExecutionPolicy Bypass -File scripts/clone-demo-repo.ps1

# 3. Build the MCP server
cd mcp-server
npm install
npm run build
cd ..

# 4. Verify setup
powershell -ExecutionPolicy Bypass -File scripts/verify-setup.ps1

# 5. Open in Bob IDE
# File → Open Folder → quorum-by-bob

# 6. Start your first council session
# In Bob IDE chat: /council [your architectural question]
```

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full Mermaid diagram.

**High-level flow:**

```
User types /council in Bob IDE chat
    ↓
council-start slash command triggers council-debate skill
    ↓
Skill activates 7 custom modes in sequence (3 rounds)
    ↓
Each mode calls quorum-tools MCP for repository evidence
    ↓
The Judge synthesizes → Decision Confidence Score → ADR
    ↓
ADR saved to docs/decisions/ → ready to commit
```

---

## The Decision Confidence Score

Every Quorum verdict includes a DCS — a weighted aggregate of 6 dimensions, each scored 0–100.

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Evidence Strength | 20% | Quality and quantity of cited evidence across all agents |
| Historical Precedent | 15% | How much relevant git history exists and what it shows |
| Economic Viability | 20% | Break-even timeline, 3-year ROI, cost of status quo |
| Risk Assessment | 20% | Blast radius of the change (inverted: 100 = low risk) |
| Technical Feasibility | 15% | Stack compatibility, breaking changes, migration complexity |
| Council Consensus | 10% | Alignment across the 6 agent positions |

**Verdict thresholds:**
- 80–100 → PROCEED
- 60–79 → PROCEED WITH CONDITIONS
- 40–59 → DEFER
- 0–39 → DO NOT PROCEED

---

## Live Dashboard

The Quorum web dashboard visualizes repository health, council debates, and ADR history.

```
cd web && npm install && npm run dev
```

Open **http://localhost:3000**

**Vista A — Architectural Health Dashboard**
- QUORUM Health Score gauge (34/100 for Galaxium Travels)
- 4-dimension radar chart (Decision Quality, Tribal Knowledge Risk, Reverted Decisions, Tribunal Coverage)
- ADR list with DCS bars and markdown preview/download
- DCS breakdown across all 6 council dimensions

**Vista B — Live Council Debate**
- 7 agent panels with typewriter argument presentation
- Sequential debate animation: Conservative → Reformer → Historian → Economist → Risk Officer → Engineer → Judge
- The Judge activates with dramatic pause + gavel sound
- DCS gauge animates 0 → 69.0 at verdict
- Download ADR button serves the markdown file

See [web/README.md](web/README.md) for full documentation.

---

## Demo

Target repository: [IBM/galaxium-travels](https://github.com/IBM/galaxium-travels) (branch: `bob-learning-path-branch`)

Video walkthrough: *Coming soon*

---

## Roadmap

**Phase 1 — Hackathon POC (Current)**
- 7 custom modes for the full council
- 4 slash commands for workflow orchestration
- TypeScript MCP server with 5 evidence tools
- Full council session on galaxium-travels with ADR output

**Phase 2 — Beta**
- Web dashboard for ADR browsing and DCS history
- GitHub Actions integration (auto-trigger council on PR labels)
- Support for additional repository types (monorepos, polyglot stacks)
- Team mode: multiple humans can assign themselves agent roles

**Phase 3 — SaaS**
- Connect any GitHub/GitLab repository
- Persistent session history and decision database
- Slack/Teams integration for verdict notifications
- Custom agent configuration per organization

---

## License

MIT — see [LICENSE](LICENSE)

---

## Built With

IBM Bob Hackathon — May 2026

**Stack:** TypeScript · Node.js 20+ · Model Context Protocol · Next.js 14.2 · simple-git · Framer Motion · Recharts
