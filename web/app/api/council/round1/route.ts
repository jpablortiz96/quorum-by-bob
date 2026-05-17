import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ROUND1_AGENTS = [
  {
    slug: "conservative",
    name: "The Conservative",
    emoji: "shield",
    color: "#4589ff",
    stance: "OPPOSE",
    stanceLabel: "Java separation was architecturally sound; 13-day failure suggests implementation issues, not design flaws",
    content: "No evidence found for inventory hold domain logic in current codebase. The booking service handles immediate seat decrements without hold/quote workflows, suggesting the Java service addressed a missing capability. Java's strong typing and enterprise transaction patterns suit inventory hold state machines better than Python's dynamic typing. A separate Java service would have isolated hold logic from the 8 MED-criticality consumers - a textbook microservice boundary. The consolidation after 13 days suggests implementation issues, not architectural flaws.",
    citations: ["aba26aa", "8f7ad7f"],
  },
  {
    slug: "reformer",
    name: "The Reformer",
    emoji: "fire",
    color: "#fa4d56",
    stance: "SUPPORT",
    stanceLabel: "Zero maintenance burden post-consolidation ($400/year) with no documented integration benefits from dual-language architecture",
    content: "The Java inventory_hold_service was never deployed to production. It exists only as merged code (PR #9, April 16, 2026) with no directory presence in the repository. Zero maintenance burden post-consolidation at $400/year with no documented integration benefits from dual-language architecture. The Python backend is already handling all booking workflows with no service interruptions since consolidation.",
    citations: ["8f7ad7f", "10d8576"],
  },
  {
    slug: "historian",
    name: "The Historian",
    emoji: "scroll",
    color: "#be95ff",
    stance: "SUPPORT",
    stanceLabel: "5-commit timeline shows introduction to failure to workaround to renaming to abandonment",
    content: "5-commit timeline: aba26aa (Apr 10) service introduced but immediately non-functional; 10d8576 (Apr 13) Python modified to bridge Java service - workaround architecture; 8f7ad7f (Apr 16) merged despite integration issues; 59f9b46 (Apr 20) directory renamed - namespace collision or organizational regret; 4156ec0 (Apr 23) subsequent development bypasses Java service entirely. Lifecycle: 13 days. Vocabulary: 'not visible', 'integrate', 'renaming' - language of failure and remediation.",
    citations: ["aba26aa", "10d8576", "8f7ad7f", "59f9b46", "4156ec0"],
  },
  {
    slug: "economist",
    name: "The Economist",
    emoji: "coin",
    color: "#42be65",
    stance: "DEFER",
    stanceLabel: "Java service never deployed; cannot calculate avoided dual-service cost; -44.4% ROI on Python consolidation alone is weak",
    content: "Java service directory does not exist in repository - never deployed to production. Python Service Annual Maintenance: $400/year (5 hours). Consolidation Cost: $2,160 (27 hours). Break-Even Time: 64.8 months. 3-Year ROI: -44.4%. The weak ROI stems from inability to calculate the avoided dual-service cost. Economic verdict: DEFER - insufficient data for confident ROI calculation, but status quo ($400/year Python-only) is economically stable.",
    citations: ["8f7ad7f"],
  },
  {
    slug: "risk-officer",
    name: "The Risk Officer",
    emoji: "warning",
    color: "#f1c21b",
    stance: "SUPPORT",
    stanceLabel: "Consolidation eliminated cross-service communication failures, deployment coordination complexity, and dual-stack maintenance burden",
    content: "Consolidation eliminated: (1) cross-service HTTP communication failures between Python and Java layers, (2) deployment coordination complexity across two runtimes, (3) dual-stack maintenance burden on a solo contributor. Current risk: booking.py has 10 consumers with criticality score 58/100 - any modification to the hold implementation has broad blast radius. Residual risk: missing hold mechanism means frontend cannot display hold states, creating a UX debt that will require Python-side implementation.",
    citations: ["10d8576"],
  },
  {
    slug: "engineer",
    name: "The Engineer",
    emoji: "wrench",
    color: "#08bdba",
    stance: "SUPPORT WITH CAVEATS",
    stanceLabel: "Python/FastAPI technically capable, but current implementation missing hold mechanism, quote generation, and reservation expiry",
    content: "Python/FastAPI is technically capable of implementing inventory hold workflows. However: booking_system_backend/services/booking.py:7-54 currently handles immediate seat decrements only - no hold/quote/expiry state machine. models.py:22-28 Booking model lacks hold_expiry or quote_id fields. schemas.py:24-32 BookingOut schema contains only final booking states. The consolidation is architecturally correct but technically incomplete - the Python service must implement what the Java service was designed to provide before this ADR can be considered fully executed.",
    citations: [],
  },
];

export async function GET() {
  return NextResponse.json(ROUND1_AGENTS);
}
