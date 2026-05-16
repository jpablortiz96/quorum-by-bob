import { NextResponse } from "next/server";
import { getAllADRs } from "@/lib/adr-parser";

export async function GET() {
  try {
    const adrs = getAllADRs().map(({ content: _, ...a }) => a);
    return NextResponse.json(adrs);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
