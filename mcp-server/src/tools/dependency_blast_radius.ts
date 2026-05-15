import { z } from "zod";
import fs from "fs";
import path from "path";

export const DependencyBlastRadiusInputSchema = z.object({
  file_path: z.string().describe("Path to the file or module to analyze (relative to repo root)"),
  repo_path: z.string().optional().describe("Path to the git repository. Defaults to demo-repo/galaxium-travels"),
});

export type DependencyBlastRadiusInput = z.infer<typeof DependencyBlastRadiusInputSchema>;

interface Consumer {
  file: string;
  import_line: number;
  import_statement: string;
  criticality: "HIGH" | "MED" | "LOW";
  criticality_reason: string;
}

const CRITICAL_PATH_PATTERNS = [
  /auth/i, /payment/i, /billing/i, /security/i, /login/i,
  /checkout/i, /transaction/i, /order/i, /account/i, /wallet/i,
];

const LOW_PRIORITY_PATTERNS = [
  /test/i, /spec/i, /mock/i, /fixture/i, /\.stories\./i,
  /storybook/i, /example/i, /demo/i, /playground/i,
];

function classifyCriticality(filePath: string): { criticality: "HIGH" | "MED" | "LOW"; reason: string } {
  const normalized = filePath.toLowerCase();

  if (LOW_PRIORITY_PATTERNS.some((p) => p.test(normalized))) {
    return { criticality: "LOW", reason: "Test/mock/example file" };
  }

  if (CRITICAL_PATH_PATTERNS.some((p) => p.test(normalized))) {
    return { criticality: "HIGH", reason: "Critical business path (auth/payment/security)" };
  }

  return { criticality: "MED", reason: "Application code, non-critical path" };
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!["node_modules", ".git", "dist", "build", "__pycache__", ".next"].includes(entry.name)) {
        results.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function dependency_blast_radius(input: DependencyBlastRadiusInput): Promise<string> {
  const repoPath = input.repo_path ?? path.join(process.cwd(), "..", "demo-repo", "galaxium-travels");

  if (!fs.existsSync(repoPath)) {
    return JSON.stringify({
      error: `Repository not found: ${repoPath}`,
      hint: "Run scripts/clone-demo-repo.ps1 to populate demo-repo/galaxium-travels",
    });
  }

  const targetModule = input.file_path;
  const targetBasename = path.basename(targetModule, path.extname(targetModule));

  const extensions = [".py", ".ts", ".tsx", ".js", ".jsx", ".java", ".go"];
  const allFiles = getAllFiles(repoPath, extensions);

  const consumers: Consumer[] = [];

  const importPatterns = [
    new RegExp(`import.*['"].*${escapeRegex(targetBasename)}['"]`, "i"),
    new RegExp(`from\\s+['"].*${escapeRegex(targetBasename)}['"]`, "i"),
    new RegExp(`require\\(['"].*${escapeRegex(targetBasename)}['"]\\)`, "i"),
    new RegExp(`import\\s+.*${escapeRegex(targetBasename)}`, "i"),
    new RegExp(`from\\s+\\.{0,2}\\/.*${escapeRegex(targetBasename)}`, "i"),
  ];

  for (const file of allFiles) {
    if (file.includes(targetModule.replace("/", path.sep))) continue;

    try {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (importPatterns.some((p) => p.test(line))) {
          const relPath = path.relative(repoPath, file).replace(/\\/g, "/");
          const { criticality, reason } = classifyCriticality(relPath);

          consumers.push({
            file: relPath,
            import_line: i + 1,
            import_statement: line.trim().substring(0, 120),
            criticality,
            criticality_reason: reason,
          });
          break;
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  const highCount = consumers.filter((c) => c.criticality === "HIGH").length;
  const medCount = consumers.filter((c) => c.criticality === "MED").length;
  const lowCount = consumers.filter((c) => c.criticality === "LOW").length;

  const criticalityScore = consumers.length === 0
    ? 100
    : Math.max(0, 100 - highCount * 15 - medCount * 5 - lowCount * 1);

  return JSON.stringify(
    {
      module: targetModule,
      repo_path: repoPath,
      total_consumers: consumers.length,
      breakdown: { HIGH: highCount, MED: medCount, LOW: lowCount },
      criticality_score: criticalityScore,
      criticality_score_note: "100 = low blast radius (safe). 0 = extreme blast radius (dangerous).",
      consumers: consumers.sort((a, b) => {
        const order = { HIGH: 0, MED: 1, LOW: 2 };
        return order[a.criticality] - order[b.criticality];
      }),
      summary: `Module "${targetModule}" has ${consumers.length} direct consumers: ${highCount} HIGH criticality, ${medCount} MED, ${lowCount} LOW. Blast radius score: ${criticalityScore}/100.`,
    },
    null,
    2
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
