import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    overallScore: 34,
    dimensions: {
      decisionQuality: 25,
      tribalKnowledgeRisk: 60,
      revertedDecisions: 40,
      tribunalCoverage: 15,
    },
    stats: {
      totalCommits: 66,
      documentedDecisions: 1,
      revertedPatterns: 2,
      tribunalCoverage: 1.5,
    },
  });
}
