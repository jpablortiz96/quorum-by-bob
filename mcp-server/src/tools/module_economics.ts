import { z } from "zod";
import fs from "fs";
import path from "path";
import simpleGit from "simple-git";

export const ModuleEconomicsInputSchema = z.object({
  directory_path: z.string().describe("Path to the module directory to analyze (relative to repo root)"),
  repo_path: z.string().optional().describe("Path to the git repository. Defaults to demo-repo/galaxium-travels"),
  hourly_rate: z.number().optional().describe("Developer hourly rate in USD. Defaults to 80."),
});

export type ModuleEconomicsInput = z.infer<typeof ModuleEconomicsInputSchema>;

interface FileStats {
  path: string;
  loc: number;
  blank_lines: number;
  comment_lines: number;
}

const CODE_EXTENSIONS = [".py", ".ts", ".tsx", ".js", ".jsx", ".java", ".go", ".rb", ".cs", ".cpp", ".c", ".h"];

function countLines(filePath: string): { loc: number; blank: number; comment: number } {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let loc = 0, blank = 0, comment = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        blank++;
      } else if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
        comment++;
      } else {
        loc++;
      }
    }

    return { loc, blank, comment };
  } catch {
    return { loc: 0, blank: 0, comment: 0 };
  }
}

function getFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".git", "dist", "build", "__pycache__", ".next"].includes(entry.name)) {
        results.push(...getFiles(fullPath));
      }
    } else if (CODE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

export async function module_economics(input: ModuleEconomicsInput): Promise<string> {
  const repoPath = input.repo_path ?? path.join(process.cwd(), "..", "demo-repo", "galaxium-travels");
  const hourlyRate = input.hourly_rate ?? 80;
  const targetDir = path.join(repoPath, input.directory_path);

  if (!fs.existsSync(targetDir)) {
    return JSON.stringify({
      error: `Directory not found: ${targetDir}`,
      hint: "Check that the directory path is relative to repo root and the repo is cloned.",
    });
  }

  const files = getFiles(targetDir);
  const fileStats: FileStats[] = [];
  let totalLoc = 0, totalBlank = 0, totalComment = 0;

  for (const file of files) {
    const { loc, blank, comment } = countLines(file);
    const relPath = path.relative(repoPath, file).replace(/\\/g, "/");
    fileStats.push({ path: relPath, loc, blank_lines: blank, comment_lines: comment });
    totalLoc += loc;
    totalBlank += blank;
    totalComment += comment;
  }

  let churnCount = 0;
  let uniqueContributors = new Set<string>();

  try {
    const git = simpleGit(repoPath);
    const since90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const relTarget = path.relative(repoPath, targetDir).replace(/\\/g, "/");

    const logResult = await git.log({
      "--since": since90Days,
      "--": [relTarget],
    });

    churnCount = logResult.all.length;
    for (const entry of logResult.all) {
      if (entry.author_name) uniqueContributors.add(entry.author_name);
    }
  } catch {
    churnCount = 0;
  }

  const refactorHours = Math.ceil(totalLoc / 50);
  const testingHours = Math.ceil(refactorHours * 0.3);
  const integrationHours = Math.ceil(refactorHours * 0.2);
  const totalHours = refactorHours + testingHours + integrationHours;
  const totalCost = totalHours * hourlyRate;

  const maintenanceHoursPerYear = Math.ceil(churnCount * 2);
  const bugTaxHours = Math.ceil(churnCount * 1.5);
  const onboardingHours = Math.ceil(totalLoc * 0.5 / 100);
  const annualStatusQuoCost = (maintenanceHoursPerYear + bugTaxHours + onboardingHours) * hourlyRate;

  const breakEvenMonths = annualStatusQuoCost > 0
    ? parseFloat((totalCost / (annualStatusQuoCost / 12)).toFixed(1))
    : 999;

  const roi3Year = annualStatusQuoCost > 0
    ? parseFloat(((annualStatusQuoCost * 3 - totalCost) / totalCost * 100).toFixed(1))
    : 0;

  const topFiles = fileStats
    .sort((a, b) => b.loc - a.loc)
    .slice(0, 10);

  return JSON.stringify(
    {
      module: input.directory_path,
      repo_path: repoPath,
      file_count: files.length,
      lines: {
        total_loc: totalLoc,
        blank: totalBlank,
        comments: totalComment,
        total_lines: totalLoc + totalBlank + totalComment,
      },
      activity: {
        commits_last_90_days: churnCount,
        unique_contributors: uniqueContributors.size,
        contributors: Array.from(uniqueContributors),
      },
      cost_of_change: {
        refactor_hours: refactorHours,
        testing_hours: testingHours,
        integration_hours: integrationHours,
        total_hours: totalHours,
        total_cost_usd: totalCost,
        hourly_rate: hourlyRate,
      },
      cost_of_status_quo_annual: {
        maintenance_hours: maintenanceHoursPerYear,
        bug_tax_hours: bugTaxHours,
        onboarding_hours: onboardingHours,
        total_hours: maintenanceHoursPerYear + bugTaxHours + onboardingHours,
        total_cost_usd: annualStatusQuoCost,
      },
      roi: {
        break_even_months: breakEvenMonths,
        three_year_roi_percent: roi3Year,
        verdict: breakEvenMonths < 12 ? "Strong ROI" : breakEvenMonths < 24 ? "Moderate ROI" : "Weak ROI",
      },
      top_files_by_loc: topFiles,
      summary: `Module "${input.directory_path}": ${files.length} files, ${totalLoc} LOC, ${churnCount} commits in last 90 days. Change costs $${totalCost.toLocaleString()} (${totalHours}h). Status quo costs $${annualStatusQuoCost.toLocaleString()}/year. Break-even: ${breakEvenMonths} months.`,
    },
    null,
    2
  );
}
