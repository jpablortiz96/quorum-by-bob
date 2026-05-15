# Quorum Internal Design Decisions

This document records architectural decisions made during the development of Quorum itself — not decisions about target repositories, but decisions about how Quorum is built.

---

## ADR-0001: Slash Commands Status in Bob IDE

**Status:** Deferred — using Custom Modes + Skills as primary interface
**Date:** 2026-05-15

### Context

During setup, four slash command files were created in `.bob/commands/`:
- `council-start.md` (`/council`)
- `ask-historian.md` (`/ask-historian`)
- `verdict-only.md` (`/verdict`)
- `export-session.md` (`/export-session`)

These were written with frontmatter (`name`, `description`, `slash_command`, `usage`) based on the expected convention. However, Bob IDE's official documentation for custom slash command registration could not be confirmed during the hackathon without spending Bobcoins on a test session.

### Decision

**Keep the `.bob/commands/*.md` files as documentation artifacts.** Do not rely on them as the primary invocation mechanism during the demo.

**Use Custom Modes + Skills as the proven invocation path:**

| Intended slash command | Equivalent Bob IDE approach |
|----------------------|---------------------------|
| `/council [question]` | Switch to any Council mode → ask the question → Bob applies the `council-debate` skill |
| `/ask-historian [keyword]` | Switch to `📜 The Historian` mode → ask about the keyword |
| `/verdict` | Switch to `⚖️ The Judge` mode → ask to synthesize draft files |
| `/export-session` | Manual process per `bob_sessions/README.md` |

### Consequences

**Positive:**
- Custom Modes and Skills are confirmed to work (verified format per Bob IDE spec)
- No Bobcoins wasted testing an unconfirmed feature
- The `.md` files remain useful as documentation for judges reviewing the repo

**Negative:**
- No one-shot `/council` invocation — users must switch modes manually or prompt for the skill
- Slightly higher cognitive load for first-time users

**Neutral:**
- If Bob IDE does support custom slash commands via `.bob/commands/*.md`, they will activate automatically — no rework needed

### Follow-up

If time permits before submission, test `/council` in Bob IDE with 1 spare Bobcoin to confirm registration. If it works, update this ADR to "Accepted."

---

## ADR-0002: Single Workspace Strategy

**Status:** Accepted
**Date:** 2026-05-15

### Context

Initially considered opening `demo-repo/galaxium-travels/` as a separate Bob IDE workspace to get direct Bob custom mode support for that repo. Rejected because:

1. Bob IDE custom modes in `.bob/custom_modes.yaml` are workspace-scoped — opening galaxium-travels as the workspace would lose all Quorum council modes
2. The Quorum council modes need to be active while analyzing galaxium-travels
3. Managing two separate Bob IDE windows increases complexity and Bobcoin consumption

### Decision

**Single workspace: `D:\quorum-by-bob`.**

The demo repo lives at `demo-repo/galaxium-travels/` as a subdirectory. All MCP tool calls pass `repo_path` pointing to this subdirectory. Council agents reference galaxium files via relative paths from the workspace root.

Non-obvious context about galaxium-travels is captured in `docs/galaxium-context.md` so Council agents have the architectural knowledge without needing to perform expensive full-repo scans.

### Consequences

**Positive:**
- All 7 Council modes always available
- MCP server always active (single server config)
- Context about galaxium-travels preserved in `docs/galaxium-context.md`

**Negative:**
- Bob IDE's file tree shows both Quorum infrastructure and the demo repo together — slightly noisier
- File paths in council debates must include `demo-repo/galaxium-travels/` prefix

---

## ADR-0003: MCP Server Logging Strategy

**Status:** Accepted
**Date:** 2026-05-15

### Context

The MCP server initially logged `"Quorum Tools MCP server running on stdio"` unconditionally to `process.stderr`. Bob IDE interprets any stderr output from an MCP server as an error condition, causing a false alarm in the Bob IDE MCP status panel.

### Decision

Remove unconditional stderr logging. Add a conditional log gated by `QUORUM_DEBUG` environment variable:

```typescript
if (process.env.QUORUM_DEBUG) {
  process.stderr.write("[quorum-tools] MCP server connected via stdio\n");
}
```

For debugging during development: `$env:QUORUM_DEBUG=1; node mcp-server/dist/index.js`

### Consequences

**Positive:** Bob IDE shows quorum-tools as a clean, error-free MCP server
**Negative:** No startup confirmation in normal operation (expected for production MCP servers)
