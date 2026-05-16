import fs from "fs";
import path from "path";
import type { AgentReport, Citation, CouncilData } from "@/types/quorum";
import type { AgentSlug } from "@/types/quorum";

function getDraftDir(): string {
  return path.join(process.cwd(), "..", "docs", "decisions", "draft");
}

function getDecisionsDir(): string {
  return path.join(process.cwd(), "..", "docs", "decisions");
}

function extractStance(content: string): string {
  const positionMatch = content.match(/\*\*Position:\*\*\s*(.+)/);
  if (positionMatch) return positionMatch[1].trim();
  const stanceMatch = content.match(/Position:\s*(.+)/);
  if (stanceMatch) return stanceMatch[1].trim();
  const headerMatch = content.match(/##\s+(?:Position|Stance|Decision)[:\s]+(.+)/);
  if (headerMatch) return headerMatch[1].trim();
  return "See report";
}

function extractCitations(content: string): Citation[] {
  const citations: Citation[] = [];
  const commitRegex = /`([a-f0-9]{7})`/g;
  const seenHashes = new Set<string>();
  let match;
  while ((match = commitRegex.exec(content)) !== null) {
    const hash = match[1];
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      citations.push({ hash });
    }
  }
  return citations;
}

function slugFromFilename(filename: string): AgentSlug | null {
  const m = filename.match(/^the-(.+)-round\d+\.md$/);
  if (!m) return null;
  return m[1] as AgentSlug;
}

export function getCouncilData(): CouncilData {
  const draftDir = getDraftDir();
  const agents: AgentReport[] = [];

  if (fs.existsSync(draftDir)) {
    const files = fs.readdirSync(draftDir).filter(
      (f) => f.startsWith("the-") && f.endsWith(".md")
    );

    for (const filename of files) {
      const slug = slugFromFilename(filename);
      if (!slug) continue;
      try {
        const content = fs.readFileSync(path.join(draftDir, filename), "utf8");
        agents.push({
          slug,
          stance: extractStance(content),
          content,
          citations: extractCitations(content),
        });
      } catch {
        // skip unreadable
      }
    }
  }

  // Read the final ADR for judge content
  const decisionsDir = getDecisionsDir();
  let judgeContent = "";
  let dcs = 69.0;
  let verdict = "PROCEED WITH CONDITIONS";

  if (fs.existsSync(decisionsDir)) {
    const adrFiles = fs.readdirSync(decisionsDir).filter(
      (f) => f.startsWith("ADR-") && f.endsWith(".md")
    );
    if (adrFiles.length > 0) {
      try {
        const raw = fs.readFileSync(path.join(decisionsDir, adrFiles[0]), "utf8");
        judgeContent = raw;
        const dcsMatch = raw.match(/Decision Confidence Score[:\*]*\s+([\d.]+)/i);
        if (dcsMatch) dcs = parseFloat(dcsMatch[1]);
        const verdictMatch = raw.match(/\*\*Verdict:\*\*\s+(.+)/);
        if (verdictMatch) verdict = verdictMatch[1].trim();
      } catch {
        // ignore
      }
    }
  }

  return {
    agents,
    judge: { content: judgeContent, verdict },
    dcs,
    verdict,
  };
}
