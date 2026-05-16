import { NextRequest, NextResponse } from "next/server";
import { getADRById } from "@/lib/adr-parser";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adr = getADRById(params.id);
  if (!adr || !adr.content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(adr.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${adr.file}"`,
    },
  });
}
