# Quorum Dashboard

Live web dashboard for the QUORUM Multi-Agent Architecture Tribunal.

## Quick Start

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

## Stack

- Next.js 14.2 App Router (TypeScript)
- Tailwind CSS
- Framer Motion (animations)
- Recharts (radar chart, gauges)
- Lucide React (icons)
- gray-matter (ADR frontmatter parsing)

## Structure

```
app/
  page.tsx              # Vista A: Health Dashboard
  council/page.tsx      # Vista B: Live Council Debate
  api/
    adrs/route.ts       # Lists all ADR-*.md from docs/decisions/
    council/route.ts    # Reads agent drafts + final ADR
    health/route.ts     # Hardcoded health score (34/100)
    download/[id]/      # Serves ADR markdown as download
components/
  health-gauge.tsx      # Animated semicircle gauge
  health-radar.tsx      # 4-dimension radar chart
  dcs-gauge.tsx         # Decision Confidence Score gauge
  agent-panel.tsx       # Individual agent debate card
  agent-avatar.tsx      # SVG avatars for each agent
  evidence-panel.tsx    # Sidebar showing cited commits
  adr-list.tsx          # Table of existing ADRs
lib/
  agents.ts             # Agent definitions and colors
  adr-parser.ts         # Reads docs/decisions/ADR-*.md
  council-parser.ts     # Reads docs/decisions/draft/*.md
  utils.ts              # cn() helper
types/
  quorum.ts             # Shared TypeScript interfaces
```

## Production Build

```bash
cd web
NODE_OPTIONS="--max-old-space-size=4096" npm run build
npm start
```

> Note: Requires Node.js 18-22. Node.js 24 has a known SWC/Babel
> incompatibility with static worker memory allocation on Windows.

## Deploy to Vercel

```bash
vercel --cwd web
```

> Note: The API routes read files from `../docs/decisions/` relative to
> the web/ directory. For Vercel deployment, copy the docs/ directory into
> web/docs/ and update the paths in lib/adr-parser.ts and lib/council-parser.ts.

## File Reading

All API routes read from the parent directory:
- `../docs/decisions/ADR-*.md` — Architecture Decision Records
- `../docs/decisions/draft/the-*-round1.md` — Agent debate reports
