import { NextResponse } from "next/server";
import { getCouncilData } from "@/lib/council-parser";

export async function GET() {
  try {
    const data = getCouncilData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { agents: [], judge: { content: "", verdict: "DEFER" }, dcs: 69, verdict: "PROCEED WITH CONDITIONS" },
      { status: 200 }
    );
  }
}
