import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ADR } from "@/types/quorum";

function getDecisionsDir(): string {
  // When Next.js runs from web/, cwd = D:\quorum-by-bob\web
  // ADRs live at D:\quorum-by-bob\docs\decisions\
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
        // Parse from the heading/content since files use heading-based frontmatter
        const idMatch = filename.match(/^(ADR-[\d-]+)/);
        const id = idMatch ? idMatch[1] : filename.replace(".md", "");

        // Extract title from first H1
        const titleMatch = raw.match(/^#\s+ADR-[\d-]+:\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : id;

        // Extract status
        const statusMatch = raw.match(/\*\*Status:\*\*\s+(.+)/);
        const status = statusMatch ? statusMatch[1].trim() : "Unknown";

        // Extract date
        const dateMatch = raw.match(/\*\*Date:\*\*\s+(.+)/);
        const date = dateMatch ? dateMatch[1].trim() : "";

        // Extract DCS
        const dcsMatch = raw.match(/Decision Confidence Score[:\*]*\s+([\d.]+)/i);
        const dcs = dcsMatch ? parseFloat(dcsMatch[1]) : 0;

        return { id, title, status, dcs, date, file: filename, content: raw };
      } catch {
        return null;
      }
    })
    .filter((a): a is ADR => a !== null)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getADRById(id: string): ADR | null {
  const adrs = getAllADRs();
  return adrs.find((a) => a.id === id) ?? null;
}
