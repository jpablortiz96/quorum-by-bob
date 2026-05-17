import type { AgentDefinition } from "@/types/quorum";

export const AGENTS: AgentDefinition[] = [
  {
    slug: "conservative",
    name: "The Conservative",
    emoji: "🛡️",
    role: "Status Quo Defense",
    color: "#4589ff",
  },
  {
    slug: "reformer",
    name: "The Reformer",
    emoji: "🔥",
    role: "Change Advocate",
    color: "#fa4d56",
  },
  {
    slug: "historian",
    name: "The Historian",
    emoji: "📜",
    role: "Historical Precedent",
    color: "#be95ff",
  },
  {
    slug: "economist",
    name: "The Economist",
    emoji: "💰",
    role: "Economic Viability",
    color: "#42be65",
  },
  {
    slug: "risk-officer",
    name: "The Risk Officer",
    emoji: "⚠️",
    role: "Risk Assessment",
    color: "#f1c21b",
  },
  {
    slug: "engineer",
    name: "The Engineer",
    emoji: "🔧",
    role: "Technical Feasibility",
    color: "#08bdba",
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
