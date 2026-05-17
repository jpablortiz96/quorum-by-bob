import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    dcs: 69.0,
    verdict: "PROCEED WITH CONDITIONS",
    adrId: "ADR-2026-001",
    adrTitle: "Consolidation of Inventory Hold Service into Python Backend",
    judgeText: "The Council accepts the consolidation of inventory hold functionality into the Python backend, conditional upon implementing the missing hold/quote workflow capabilities that the Java service was originally designed to provide. The 13-day lifecycle of the Java service demonstrates architectural friction that outweighs the theoretical benefits of domain boundary isolation. However, the consolidation must not be treated as complete until the Python service implements proper inventory hold mechanisms with expiry timers and quote generation.",
    breakdown: [
      { dimension: "Evidence Strength", score: 82, weight: 20, contribution: 16.4 },
      { dimension: "Historical Precedent", score: 85, weight: 15, contribution: 12.75 },
      { dimension: "Economic Viability", score: 35, weight: 20, contribution: 7.0 },
      { dimension: "Risk Assessment", score: 85, weight: 20, contribution: 17.0 },
      { dimension: "Technical Feasibility", score: 50, weight: 15, contribution: 7.5 },
      { dimension: "Council Consensus", score: 83, weight: 10, contribution: 8.3 },
    ],
    bindingConditions: [
      "Implement inventory hold mechanism with expiry timers in booking_system_backend/services/booking.py",
      "Add hold state fields to models.py: hold_expiry, quote_id, status enum",
      "Extend BookingOut schema in schemas.py to expose hold/quote states to frontend",
      "Document race condition handling for concurrent booking attempts during hold period",
      "Quantify avoided dual-service operational costs to validate economic case",
    ],
    councilComposition: {
      support: ["reformer", "historian", "risk-officer"],
      oppose: ["conservative"],
      defer: ["economist"],
      caveats: ["engineer"],
    },
  });
}
