import { z } from "zod";
import fs from "fs";
import path from "path";

export const ScoreDimensionInputSchema = z.object({
  session_id: z.string().describe("Unique identifier for the current council session (e.g. 'ADR-2026-001')"),
  dimension: z.enum([
    "evidence_strength",
    "historical_precedent",
    "economic_viability",
    "risk_assessment",
    "technical_feasibility",
    "council_consensus",
  ]).describe("The Decision Confidence Score dimension being registered"),
  agent: z.enum([
    "conservative",
    "reformer",
    "historian",
    "economist",
    "risk_officer",
    "engineer",
    "judge",
  ]).describe("The council agent submitting this score"),
  value: z.number().min(0).max(100).describe("Score value 0-100"),
  rationale: z.string().describe("One sentence explaining the score with evidence reference"),
});

export type ScoreDimensionInput = z.infer<typeof ScoreDimensionInputSchema>;

const DIMENSION_WEIGHTS: Record<string, number> = {
  evidence_strength: 0.20,
  historical_precedent: 0.15,
  economic_viability: 0.20,
  risk_assessment: 0.20,
  technical_feasibility: 0.15,
  council_consensus: 0.10,
};

interface DimensionScore {
  agent: string;
  value: number;
  rationale: string;
  timestamp: string;
}

interface SessionScores {
  session_id: string;
  created_at: string;
  updated_at: string;
  scores: Record<string, DimensionScore[]>;
  computed_dcs: number | null;
  verdict: string | null;
}

function getSessionFilePath(sessionId: string): string {
  const sessionsDir = path.join(process.cwd(), "..", "docs", "decisions", "draft");
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  return path.join(sessionsDir, `scores-${sessionId}.json`);
}

function loadSession(sessionId: string): SessionScores {
  const filePath = getSessionFilePath(sessionId);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as SessionScores;
  }
  return {
    session_id: sessionId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    scores: {},
    computed_dcs: null,
    verdict: null,
  };
}

function saveSession(session: SessionScores): void {
  const filePath = getSessionFilePath(session.session_id);
  session.updated_at = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2), "utf8");
}

function computeDCS(scores: Record<string, DimensionScore[]>): { dcs: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;

  for (const [dimension, entries] of Object.entries(scores)) {
    if (entries.length === 0) continue;
    const avgValue = entries.reduce((sum, e) => sum + e.value, 0) / entries.length;
    const weight = DIMENSION_WEIGHTS[dimension] ?? 0;
    const weighted = avgValue * weight;
    breakdown[dimension] = parseFloat(avgValue.toFixed(1));
    total += weighted;
  }

  return { dcs: parseFloat(total.toFixed(1)), breakdown };
}

function getVerdict(dcs: number): string {
  if (dcs >= 80) return "PROCEED";
  if (dcs >= 60) return "PROCEED WITH CONDITIONS";
  if (dcs >= 40) return "DEFER";
  return "DO NOT PROCEED";
}

export async function score_dimension(input: ScoreDimensionInput): Promise<string> {
  const session = loadSession(input.session_id);

  if (!session.scores[input.dimension]) {
    session.scores[input.dimension] = [];
  }

  const existingIndex = session.scores[input.dimension].findIndex(
    (s) => s.agent === input.agent
  );

  const newEntry: DimensionScore = {
    agent: input.agent,
    value: input.value,
    rationale: input.rationale,
    timestamp: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    session.scores[input.dimension][existingIndex] = newEntry;
  } else {
    session.scores[input.dimension].push(newEntry);
  }

  const { dcs, breakdown } = computeDCS(session.scores);
  session.computed_dcs = dcs;
  session.verdict = getVerdict(dcs);

  saveSession(session);

  const dimensionsComplete = Object.keys(DIMENSION_WEIGHTS).filter(
    (d) => session.scores[d] && session.scores[d].length > 0
  ).length;

  return JSON.stringify(
    {
      registered: true,
      session_id: input.session_id,
      dimension: input.dimension,
      agent: input.agent,
      value: input.value,
      current_dcs: dcs,
      current_verdict: session.verdict,
      dimensions_complete: `${dimensionsComplete}/6`,
      breakdown,
      all_scores: session.scores,
      note: dimensionsComplete < 6
        ? `${6 - dimensionsComplete} dimension(s) still missing. Run more agents to complete the score.`
        : "All 6 dimensions have scores. The Judge can now emit a final verdict.",
    },
    null,
    2
  );
}
