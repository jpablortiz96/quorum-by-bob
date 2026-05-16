import type { AgentDefinition } from "@/types/quorum";

export const AGENTS: AgentDefinition[] = [
  {
    slug: "conservative",
    name: "The Conservative",
    emoji: "🛡️",
    role: "Status Quo Defense",
    color: "#3b82f6",
  },
  {
    slug: "reformer",
    name: "The Reformer",
    emoji: "🔥",
    role: "Change Advocate",
    color: "#ef4444",
  },
  {
    slug: "historian",
    name: "The Historian",
    emoji: "📜",
    role: "Historical Precedent",
    color: "#a78bfa",
  },
  {
    slug: "economist",
    name: "The Economist",
    emoji: "💰",
    role: "Economic Viability",
    color: "#10b981",
  },
  {
    slug: "risk-officer",
    name: "The Risk Officer",
    emoji: "⚠️",
    role: "Risk Assessment",
    color: "#f59e0b",
  },
  {
    slug: "engineer",
    name: "The Engineer",
    emoji: "🔧",
    role: "Technical Feasibility",
    color: "#06b6d4",
  },
  {
    slug: "judge",
    name: "The Judge",
    emoji: "⚖️",
    role: "Final Verdict",
    color: "#d4af37",
  },
];

export const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.slug, a]));

export const DEBATE_ORDER: AgentDefinition["slug"][] = [
  "conservative",
  "reformer",
  "historian",
  "economist",
  "risk-officer",
  "engineer",
  "judge",
];
