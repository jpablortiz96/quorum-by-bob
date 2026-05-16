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

        const titleMatch = raw.match(/^#\s+ADR-[\d-]+:\s+(.+)$/m);
        let title = titleMatch ? titleMatch[1].trim() : id;

        const statusMatch = raw.match(/\*\*Status:\*\*\s+(.+)/);
        let status = statusMatch ? statusMatch[1].trim() : "Unknown";

        const dateMatch = raw.match(/\*\*Date:\*\*\s+(.+)/);
        const date = dateMatch ? dateMatch[1].trim() : "";

        const dcsMatch = raw.match(/Decision Confidence Score[:\*]*\s+([\d.]+)/i);
        const dcs = dcsMatch ? parseFloat(dcsMatch[1]) : 0;

        // Mark draft / superseded files distinctly so the ADR list can separate them
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
      // Non-draft first, then by id
      const aSuperseded = a.status === "SUPERSEDED" ? 1 : 0;
      const bSuperseded = b.status === "SUPERSEDED" ? 1 : 0;
      if (aSuperseded !== bSuperseded) return aSuperseded - bSuperseded;
      return a.id.localeCompare(b.id);
    });
}

export function getADRById(id: string): ADR | null {
  const adrs = getAllADRs();
  return adrs.find((a) => a.id === id) ?? null;
}
