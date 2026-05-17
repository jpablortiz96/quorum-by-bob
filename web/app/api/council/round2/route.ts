import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CONFRONTATIONS = [
  {
    id: "status-quo-vs-change",
    title: "Status Quo vs Change",
    left: {
      slug: "conservative",
      name: "The Conservative",
      color: "#4589ff",
      stance: "OPPOSE",
      argument: "Subsequent development (commit 4156ec0) shows continued work without hold-state implementation - the 'zero maintenance burden' claim is premature. Java separation addressed a real domain boundary.",
    },
    right: {
      slug: "reformer",
      name: "The Reformer",
      color: "#fa4d56",
      stance: "SUPPORT",
      argument: "Commit 10d8576 proves hold workflow was integrated into Python backend, contradicting the 'abandoned capability' claim. The Python proxy itself demonstrates the Java service was the redundant layer.",
    },
    outcome: "Split — both MAINTAIN",
    outcomeColor: "#f1c21b",
    summary: "Reformer's core argument holds: hold workflow exists in Python. Conservative's secondary point on stability is valid. Net effect: consolidation justified, but technical debt acknowledged.",
    citations: ["10d8576", "4156ec0"],
  },
  {
    id: "precedent-vs-feasibility",
    title: "Precedent vs Feasibility",
    left: {
      slug: "historian",
      name: "The Historian",
      color: "#be95ff",
      stance: "SUPPORT",
      argument: "'Architecturally correct but technically incomplete' is exactly the pattern documented by the 5-commit record. aba26aa was technically incomplete. 8f7ad7f merged it anyway. The pattern repeats.",
    },
    right: {
      slug: "engineer",
      name: "The Engineer",
      color: "#08bdba",
      stance: "SUPPORT WITH CAVEATS",
      argument: "The Java service failed due to organizational dysfunction, not architectural unsoundness. Python is technically capable of the consolidation if hold mechanism is implemented properly.",
    },
    outcome: "Historian holds",
    outcomeColor: "#be95ff",
    summary: "Engineer's evidence strengthens, not weakens, Historian's case. Organizational dysfunction produced the 13-day failure cycle. History records what actually ships, not what is architecturally sound in theory.",
    citations: ["aba26aa", "8f7ad7f"],
  },
  {
    id: "cost-vs-risk",
    title: "Cost vs Risk",
    left: {
      slug: "economist",
      name: "The Economist",
      color: "#42be65",
      stance: "DEFER",
      argument: "Zero .java files in repository: Risk Officer's 'cross-service communication failures eliminated' quantifies phantom risks. The Java service was never deployed. We cannot avoid costs that were never incurred.",
    },
    right: {
      slug: "risk-officer",
      name: "The Risk Officer",
      color: "#f1c21b",
      stance: "SUPPORT",
      argument: "Economic deferral does not defer the risk. dependency_blast_radius shows 10 consumers, criticality 58/100. This is a live, measurable risk regardless of whether the Java service was deployed.",
    },
    outcome: "Both MAINTAIN",
    outcomeColor: "#f1c21b",
    summary: "Economist prevails on evidence (phantom risks). Risk Officer holds on reasoning (blast radius is real today). Economic case remains the weakest link. Positions incompatible; no concession.",
    citations: ["8f7ad7f"],
  },
];

export async function GET() {
  return NextResponse.json(CONFRONTATIONS);
}
