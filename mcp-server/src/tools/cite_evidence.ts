import { z } from "zod";
import fs from "fs";
import path from "path";

export const CiteEvidenceInputSchema = z.object({
  claim: z.string().describe("The factual claim being cited (e.g. 'Session tokens stored in plaintext')"),
  file: z.string().describe("File path relative to repo root (e.g. 'src/auth/session.py')"),
  lines: z.string().describe("Line number or range (e.g. '42' or '42-58')"),
  repo_path: z.string().optional().describe("Path to the git repository. Defaults to demo-repo/galaxium-travels"),
});

export type CiteEvidenceInput = z.infer<typeof CiteEvidenceInputSchema>;

interface CiteEvidenceResult {
  valid: boolean;
  claim: string;
  citation: string;
  file: string;
  lines: string;
  snippet: string | null;
  formatted_citation: string;
  error?: string;
}

function parseLineRange(lines: string): { start: number; end: number } | null {
  const rangeMatch = lines.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return { start: parseInt(rangeMatch[1], 10), end: parseInt(rangeMatch[2], 10) };
  }

  const singleMatch = lines.match(/^(\d+)$/);
  if (singleMatch) {
    const n = parseInt(singleMatch[1], 10);
    return { start: Math.max(1, n - 2), end: n + 2 };
  }

  return null;
}

export async function cite_evidence(input: CiteEvidenceInput): Promise<string> {
  const repoPath = input.repo_path ?? path.join(process.cwd(), "..", "demo-repo", "galaxium-travels");
  const absoluteFile = path.join(repoPath, input.file);

  const result: CiteEvidenceResult = {
    valid: false,
    claim: input.claim,
    citation: `\`${input.file}:${input.lines}\``,
    file: input.file,
    lines: input.lines,
    snippet: null,
    formatted_citation: "",
  };

  if (!fs.existsSync(absoluteFile)) {
    result.error = `File not found: ${absoluteFile}`;
    result.formatted_citation = `INVALID CITATION: ${input.file} does not exist in the repository.`;
    return JSON.stringify(result, null, 2);
  }

  const lineRange = parseLineRange(input.lines);
  if (!lineRange) {
    result.error = `Invalid line format: "${input.lines}". Use "42" or "42-58".`;
    result.formatted_citation = `INVALID CITATION: Line format "${input.lines}" is not parseable.`;
    return JSON.stringify(result, null, 2);
  }

  try {
    const content = fs.readFileSync(absoluteFile, "utf8");
    const allLines = content.split("\n");

    if (lineRange.start > allLines.length) {
      result.error = `Line ${lineRange.start} does not exist. File has ${allLines.length} lines.`;
      result.formatted_citation = `INVALID CITATION: ${input.file} only has ${allLines.length} lines, cannot cite line ${lineRange.start}.`;
      return JSON.stringify(result, null, 2);
    }

    const end = Math.min(lineRange.end, allLines.length);
    const snippetLines = allLines.slice(lineRange.start - 1, end);
    const snippet = snippetLines
      .map((line, i) => `${lineRange.start + i}: ${line}`)
      .join("\n");

    result.valid = true;
    result.snippet = snippet;
    result.formatted_citation = `\`${input.file}:${input.lines}\` — "${input.claim}"\n\`\`\`\n${snippet}\n\`\`\``;

    return JSON.stringify(result, null, 2);
  } catch (err) {
    result.error = `Failed to read file: ${err instanceof Error ? err.message : String(err)}`;
    result.formatted_citation = `INVALID CITATION: Could not read ${input.file}.`;
    return JSON.stringify(result, null, 2);
  }
}
