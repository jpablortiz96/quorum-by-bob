# Bob Sessions — Hackathon Submission Artifacts

This folder contains the required submission artifacts for the IBM Bob Hackathon. Every significant Bob IDE session must be captured here as proof of Bob usage.

## Required Structure

```
bob_sessions/
├── screenshots/          PNG exports showing Bob IDE task summaries and Bobcoin consumption
├── exports/              Markdown exports of full Bob IDE task histories
└── README.md             This file
```

## How to Export a Bob IDE Session

### Step 1 — Screenshot the Task Summary

1. Complete your Bob IDE task (or reach a significant milestone)
2. In the Bob IDE sidebar, find your current task
3. Click **"..."** (Views and More Actions) next to the task name
4. Click **History** to open the task history panel
5. Look for the **Consumption Summary** or usage metrics view
6. Take a screenshot:
   - Windows: `Win + Shift + S` → drag to select → save as PNG
   - Or: `PrtScn` → paste into Paint → save
7. Name the file: `session-NN-task-name.png` (e.g., `session-01-init.png`)
8. Save to: `bob_sessions/screenshots/`

### Step 2 — Export the Task Markdown

1. In the task history panel, find the **Export task history** icon
   - This is usually a download arrow or document icon at the top of the history panel
2. Click it to export the full task conversation as a `.md` file
3. Name the file: `session-NN-task-name.md` (e.g., `session-01-init.md`)
4. Save to: `bob_sessions/exports/`

### Step 3 — Commit the Artifacts

```powershell
git add bob_sessions/screenshots/session-NN-task-name.png
git add bob_sessions/exports/session-NN-task-name.md
git commit -m "docs(sessions): add session-NN export"
git push
```

### Step 4 — Update the Bobcoin Log

Open `scripts/bobcoin-log.md` and add a row for this session:

```markdown
| 2026-05-15 | /init — AGENTS.md enrichment | historian mode | ~1 Bobcoin | 0.8 Bobcoins | Used targeted file reads |
```

---

## Session Naming Convention

| Session # | Suggested Name | Description |
|-----------|---------------|-------------|
| session-01 | `session-01-init` | First Bob IDE session — /init to enrich AGENTS.md |
| session-02 | `session-02-council-auth` | First /council session on galaxium-travels auth module |
| session-03 | `session-03-council-etl` | Second /council session on ETL pipeline |
| session-04 | `session-04-historian-revert` | /ask-historian to find revert patterns |
| session-05 | `session-05-verdict-adr` | /verdict to produce final ADR |

---

## Why This Folder Exists

The IBM Bob Hackathon requires evidence of Bob IDE usage as part of the submission. Screenshots prove Bobcoin consumption and task structure. Markdown exports prove the quality of Bob's outputs. Together they demonstrate:

1. Bob was used extensively (not just as a wrapper)
2. Bob's custom modes, slash commands, and skills worked as designed
3. The Bobcoin budget was managed frugally
4. Quorum produced real, meaningful outputs (not toy examples)

**Do not delete PNG files from this folder.** The `.gitignore` is configured to track `.md` files and ignore `.png` files by default — override this for submission by explicitly adding screenshots with `git add -f`.
