import fs from "fs";
import path from "path";
import type { ADR } from "@/types/quorum";

function getDecisionsDir(): string {
  return path.join(process.cwd(), "..", "docs", "decisions");
}

export function getAllADRs(): ADR[] {
  const dir = getDecisionsDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(
    (f) => f.startsWith("ADR-") && f.endsWith(".md")
  );

  return files
    .map((filename): ADR | null => {
      try {
        const filePath = path.join(dir, filename);
        const raw = fs.readFileSync(filePath, "utf8");

        const idMatch = filename.match(/^(ADR-[\d-]+)/);
        const id = idMatch ? idMatch[1] : filename.replace(".md", "");

        // Match titles with optional parenthetical: "# ADR-XXXX: Title" or "# ADR-XXXX (TAG): Title"
        const titleMatch = raw.match(/^#\s+ADR-[\d-]+(?:\s+\([^)]+\))?:\s+(.+)$/m);
        let title = titleMatch ? titleMatch[1].trim() : id;

        const statusMatch = raw.match(/\*\*Status:\*\*\s+(.+)/);
        const analysisTypeMatch = raw.match(/\*\*Analysis Type:\*\*\s+(.+)/);
        let status = statusMatch ? statusMatch[1].trim() : (analysisTypeMatch ? "Time Machine" : "Unknown");

        const dateMatch = raw.match(/\*\*Date:\*\*\s+(.+)/);
        const date = dateMatch ? dateMatch[1].trim() : "";

        const dcsMatch = raw.match(/Decision Confidence Score[:\*\s]*(\d+(?:\.\d+)?)\s*\/\s*100/i)
          ?? raw.match(/Predicted DCS[:\*\s]*(\d+(?:\.\d+)?)\s*\/\s*100/i);
        const dcs = dcsMatch ? parseFloat(dcsMatch[1]) : 0;

        // Mark draft / superseded files
        const isDraft = filename.includes("draft") || filename.includes("3agents");
        if (isDraft) {
          title = "Java Consolidation (Draft - 3-agent council)";
          status = "SUPERSEDED";
        }

        return { id, title, status, dcs, date, file: filename, content: raw };
      } catch {
        return null;
      }
    })
    .filter((a): a is ADR => a !== null)
    .sort((a, b) => {
      // Time Machine and non-SUPERSEDED first, then alphabetical
      if (a.status === "SUPERSEDED" && b.status !== "SUPERSEDED") return 1;
      if (a.status !== "SUPERSEDED" && b.status === "SUPERSEDED") return -1;
      return a.id.localeCompare(b.id);
    });
}

export function getADRById(id: string): ADR | null {
  const adrs = getAllADRs();
  return adrs.find((a) => a.id === id) ?? null;
}
