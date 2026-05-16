export type AgentSlug =
  | "conservative"
  | "reformer"
  | "historian"
  | "economist"
  | "risk-officer"
  | "engineer"
  | "judge";

export type AgentStatus = "idle" | "thinking" | "speaking" | "done";

export type Verdict =
  | "PROCEED"
  | "PROCEED WITH CONDITIONS"
  | "DEFER"
  | "DO NOT PROCEED"
  | "Accepted with Conditions";

export interface AgentDefinition {
  slug: AgentSlug;
  name: string;
  emoji: string;
  role: string;
  color: string;
}

export interface AgentReport {
  slug: AgentSlug;
  stance: string;
  content: string;
  citations: Citation[];
}

export interface Citation {
  hash: string;
  file?: string;
  line?: string;
  message?: string;
  author?: string;
  date?: string;
}

export interface ADR {
  id: string;
  title: string;
  status: Verdict | string;
  dcs: number;
  date: string;
  file: string;
  content?: string;
}

export interface HealthData {
  overallScore: number;
  dimensions: {
    decisionQuality: number;
    tribalKnowledgeRisk: number;
    revertedDecisions: number;
    tribunalCoverage: number;
  };
  stats: {
    totalCommits: number;
    documentedDecisions: number;
    revertedPatterns: number;
    tribunalCoverage: number;
  };
}

export interface CouncilData {
  agents: AgentReport[];
  judge: {
    content: string;
    verdict: Verdict | string;
  };
  dcs: number;
  verdict: Verdict | string;
}

export interface DCSBreakdown {
  dimension: string;
  score: number;
  weight: number;
  contribution: number;
}
