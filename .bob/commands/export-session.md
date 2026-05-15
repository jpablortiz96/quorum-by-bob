---
name: export-session
description: Reminds and guides the user through exporting the current Bob IDE task to bob_sessions/ for hackathon submission compliance.
slash_command: /export-session
usage: /export-session [session_name]
estimated_cost: 0 Bobcoins (local operation)
---

# /export-session — Export Task for Submission

## Usage

```
/export-session
/export-session session-01-init
/export-session session-02-council-galaxium
```

## What This Command Does

Guides the user through the required Bob IDE export steps for hackathon submission. The `bob_sessions/` folder is a **required submission artifact** — every significant Bob IDE session must be captured there.

## Instructions for Bob

When this command is invoked:

Display the following step-by-step instructions to the user:

---

### Step 1 — Screenshot the Task Summary

1. In Bob IDE, locate the current task in the left sidebar or task history panel
2. Click the **"..."** (Views and More Actions) button next to the task
3. Open the **History** or **Consumption Summary** view
4. Take a screenshot (Windows: `Win + Shift + S`, then save)
5. Save as: `bob_sessions/screenshots/[session_name].png`

### Step 2 — Export the Task Markdown

1. In the task history panel, find the **Export task history** icon (arrow pointing down or document icon)
2. Click to export the task as a `.md` file
3. Save as: `bob_sessions/exports/[session_name].md`

### Step 3 — Commit the Session Artifacts

```powershell
git add bob_sessions/
git commit -m "docs(sessions): add [session_name] export"
git push
```

### Step 4 — Update Bobcoin Log

Open `scripts/bobcoin-log.md` and add a row:
```
| [date] | [task description] | [mode used] | [estimated] | [actual from UI] | [notes] |
```

---

**Session folder structure:**
```
bob_sessions/
├── screenshots/
│   └── [session_name].png
└── exports/
    └── [session_name].md
```

## Cost Note

Zero Bobcoins. This is a local file operation and reminder workflow.
