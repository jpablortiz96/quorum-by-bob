import { z } from "zod";
import fs from "fs";
import path from "path";
import simpleGit from "simple-git";

export const ScanDecisionsInputSchema = z.object({
  repo_path: z.string().optional().describe("Absolute path to the git repository. Defaults to demo-repo/galaxium-travels"),
});

export type ScanDecisionsInput = z.infer<typeof ScanDecisionsInputSchema>;

// ── Types ────────────────────────────────────────────────────────────────────

type PressureType =
  | "POLYGLOT_FRICTION"
  | "HIGH_CHURN_LOW_TEST"
  | "STALE_MODULE"
  | "LARGE_FILE"
  | "DEPENDENCY_HEAVY";

interface PressurePoint {
  id: string;
  type: PressureType;
  location: string;
  urgency_score: number;
  suggested_decision: string;
  evidence: string[];
  affected_files_count: number;
}

// ── File utilities ────────────────────────────────────────────────────────────

const CODE_EXTENSIONS = [".py", ".ts", ".tsx", ".js", ".jsx", ".java", ".go", ".rb", ".cs"];
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "__pycache__", ".next", ".venv", "venv"]);
const DEPENDENCY_FILES = ["package.json", "requirements.txt", "pom.xml", "build.gradle", "Pipfile", "go.mod"];

function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkDir(full));
    else results.push(full);
  }
  return results;
}

function countLines(filePath: string): number {
  try {
    return fs.readFileSync(filePath, "utf8").split("\n").length;
  } catch {
    return 0;
  }
}

function isTestFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return (
    lower.includes("test") ||
    lower.includes("spec") ||
    lower.includes("__tests__") ||
    lower.endsWith(".test.ts") ||
    lower.endsWith(".test.py") ||
    lower.endsWith("_test.py")
  );
}

function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

function isCodeFile(filePath: string): boolean {
  return CODE_EXTENSIONS.includes(getExtension(filePath));
}

function detectLanguage(filePath: string): string | null {
  const ext = getExtension(filePath);
  const langMap: Record<string, string> = {
    ".py": "Python", ".ts": "TypeScript", ".tsx": "TypeScript",
    ".js": "JavaScript", ".jsx": "JavaScript",
    ".java": "Java", ".go": "Go", ".rb": "Ruby",
    ".cs": "C#", ".cpp": "C++", ".c": "C",
  };
  return langMap[ext] ?? null;
}

// ── Urgency scoring ──────────────────────────────────────────────────────────
//
// urgency_score = clamp(
//   churnWeight * churn
//   + ageWeight * (1 - age_normalized)   [stale → low urgency from this]
//   + sizeWeight * size_normalized
//   + criticality * 20
//   + noTestPenalty
// , 0, 100)
//
// Each detector adds its own formula documented inline.

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ── Detector 1: High Churn, Low Test ─────────────────────────────────────────

interface DirChurnMap {
  [dir: string]: { commits: number; hasTests: boolean; fileCount: number };
}

async function detectHighChurnLowTest(
  repoPath: string,
  allFiles: string[],
  git: ReturnType<typeof simpleGit>
): Promise<PressurePoint[]> {
  const points: PressurePoint[] = [];

  // Collect commits per top-level directory over last 90 days
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  let logLines: string[] = [];
  try {
    const raw = await git.raw(["log", "--all", `--since=${since90}`, "--name-only", "--format="]);
    logLines = raw.split("\n").filter((l) => l.trim() && !l.startsWith("commit"));
  } catch {
    return points;
  }

  const dirChurn: DirChurnMap = {};

  for (const line of logLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Get top-level directory
    const parts = trimmed.split("/");
    const topDir = parts.length > 1 ? parts[0] : "";
    if (!topDir) continue;
    if (!dirChurn[topDir]) {
      dirChurn[topDir] = { commits: 0, hasTests: false, fileCount: 0 };
    }
    dirChurn[topDir].commits++;
    if (isTestFile(trimmed)) {
      dirChurn[topDir].hasTests = true;
    }
  }

  // Count actual code files per dir
  for (const file of allFiles) {
    const rel = path.relative(repoPath, file).replace(/\\/g, "/");
    const topDir = rel.split("/")[0];
    if (topDir && dirChurn[topDir]) {
      dirChurn[topDir].fileCount++;
    }
  }

  let ppIdx = 1;
  for (const [dir, stats] of Object.entries(dirChurn)) {
    if (stats.commits < 3) continue; // not enough churn to be interesting
    if (stats.hasTests) continue;    // already has tests

    // urgency = churn weight (60%) + no-test penalty (40%)
    // normalized: 10 commits = 60 points from churn; capped at 10 commits
    const churnScore = clamp((stats.commits / 10) * 60, 0, 60);
    const noTestScore = 40; // flat penalty for zero test coverage
    const urgency = Math.round(clamp(churnScore + noTestScore, 0, 100));

    points.push({
      id: `pp-${String(ppIdx++).padStart(3, "0")}`,
      type: "HIGH_CHURN_LOW_TEST",
      location: dir,
      urgency_score: urgency,
      suggested_decision: `Should we add a test suite to "${dir}" before it becomes unmaintainable?`,
      evidence: [
        `${stats.commits} commits in the last 90 days`,
        `${stats.fileCount} code files detected`,
        "No test files found (no *test*, *spec*, *__tests__* pattern)",
      ],
      affected_files_count: stats.fileCount,
    });
  }

  return points;
}

// ── Detector 2: Stale Module ─────────────────────────────────────────────────

async function detectStaleModules(
  repoPath: string,
  git: ReturnType<typeof simpleGit>
): Promise<PressurePoint[]> {
  const points: PressurePoint[] = [];

  let topDirs: string[] = [];
  try {
    topDirs = fs.readdirSync(repoPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
      .map((e) => e.name);
  } catch {
    return points;
  }

  let ppIdx = 100;
  for (const dir of topDirs) {
    try {
      const logResult = await git.log({
        "--": [dir],
        "--max-count": "1",
      });
      if (!logResult.latest) continue;

      const lastDate = new Date(logResult.latest.date);
      const daysSince = Math.round((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince < 120) continue; // Not stale enough

      // urgency = decays with age: very stale modules may be abandoned (low urgency)
      // but recently-stale modules (120-200 days) need decision now
      // formula: urgency = clamp(70 - (daysSince - 120) * 0.2, 20, 70)
      const urgency = Math.round(clamp(70 - (daysSince - 120) * 0.2, 20, 70));

      const fileCount = walkDir(path.join(repoPath, dir)).filter(isCodeFile).length;
      if (fileCount === 0) continue; // empty or non-code dir

      points.push({
        id: `pp-${String(ppIdx++).padStart(3, "0")}`,
        type: "STALE_MODULE",
        location: dir,
        urgency_score: urgency,
        suggested_decision: `Should we deprecate or document "${dir}"? It has not been modified in ${daysSince} days.`,
        evidence: [
          `Last commit: ${logResult.latest.date.split("T")[0]} (${daysSince} days ago)`,
          `Author: ${logResult.latest.author_name}`,
          `Message: "${logResult.latest.message.slice(0, 80)}"`,
          `${fileCount} code files in directory`,
        ],
        affected_files_count: fileCount,
      });
    } catch {
      // skip
    }
  }

  return points;
}

// ── Detector 3: Polyglot Friction ────────────────────────────────────────────

function detectPolyglotFriction(
  repoPath: string,
  allFiles: string[]
): PressurePoint[] {
  const points: PressurePoint[] = [];

  // Map top-level directories to their dominant language
  const dirLangs: Record<string, Record<string, number>> = {};

  for (const file of allFiles) {
    const rel = path.relative(repoPath, file).replace(/\\/g, "/");
    const parts = rel.split("/");
    if (parts.length < 2) continue;
    const topDir = parts[0];
    const lang = detectLanguage(file);
    if (!lang) continue;

    if (!dirLangs[topDir]) dirLangs[topDir] = {};
    dirLangs[topDir][lang] = (dirLangs[topDir][lang] ?? 0) + 1;
  }

  // Find top-level dirs with a dominant language, and check for
  // sibling dirs with a DIFFERENT dominant language serving similar purpose
  const dirDominant: Record<string, { lang: string; count: number }> = {};
  for (const [dir, langs] of Object.entries(dirLangs)) {
    const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0 && sorted[0][1] >= 3) {
      dirDominant[dir] = { lang: sorted[0][0], count: sorted[0][1] };
    }
  }

  // Detect pairs of directories with different languages
  const dirs = Object.entries(dirDominant);
  const seenPairs = new Set<string>();
  let ppIdx = 200;

  for (let i = 0; i < dirs.length; i++) {
    for (let j = i + 1; j < dirs.length; j++) {
      const [dirA, infoA] = dirs[i];
      const [dirB, infoB] = dirs[j];
      if (infoA.lang === infoB.lang) continue;

      // Check if names suggest similar purpose (booking, service, backend, api, etc.)
      const purposeWords = ["backend", "service", "api", "server", "booking", "auth", "payment"];
      const aSimilar = purposeWords.some((w) => dirA.toLowerCase().includes(w));
      const bSimilar = purposeWords.some((w) => dirB.toLowerCase().includes(w));
      if (!aSimilar || !bSimilar) continue;

      const pairKey = [dirA, dirB].sort().join("|");
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      // Urgency: high because polyglot friction is a proven architectural smell
      // formula: 55 base + 15 if one language is Java (historically fraught) + 10 per extra service
      const javaBonus = infoA.lang === "Java" || infoB.lang === "Java" ? 15 : 0;
      const urgency = Math.round(clamp(55 + javaBonus, 0, 100));

      points.push({
        id: `pp-${String(ppIdx++).padStart(3, "0")}`,
        type: "POLYGLOT_FRICTION",
        location: `${dirA} ↔ ${dirB}`,
        urgency_score: urgency,
        suggested_decision: `Should we consolidate the ${infoA.lang} service ("${dirA}") into the ${infoB.lang} backend ("${dirB}")?`,
        evidence: [
          `"${dirA}": ${infoA.count} ${infoA.lang} files`,
          `"${dirB}": ${infoB.count} ${infoB.lang} files`,
          "Dual-language services create deployment coordination overhead and dual-stack maintenance burden",
        ],
        affected_files_count: infoA.count + infoB.count,
      });
    }
  }

  return points;
}

// ── Detector 4: Large File ────────────────────────────────────────────────────

const LARGE_FILE_THRESHOLD = 400;

function detectLargeFiles(
  repoPath: string,
  allFiles: string[]
): PressurePoint[] {
  const points: PressurePoint[] = [];
  let ppIdx = 300;

  const codeFiles = allFiles.filter(isCodeFile);
  // Sort by size descending, take top 5 worst offenders
  const withSizes = codeFiles
    .map((f) => ({ f, loc: countLines(f) }))
    .filter(({ loc }) => loc >= LARGE_FILE_THRESHOLD)
    .sort((a, b) => b.loc - a.loc)
    .slice(0, 5);

  for (const { f, loc } of withSizes) {
    const rel = path.relative(repoPath, f).replace(/\\/g, "/");

    // urgency = clamp((loc - 400) / 10 + 30, 30, 85)
    // 400 LOC = 30; 1000 LOC = 90; capped at 85
    const urgency = Math.round(clamp((loc - LARGE_FILE_THRESHOLD) / 10 + 30, 30, 85));

    points.push({
      id: `pp-${String(ppIdx++).padStart(3, "0")}`,
      type: "LARGE_FILE",
      location: rel,
      urgency_score: urgency,
      suggested_decision: `Should we split "${rel}" (${loc} LOC) into smaller, focused modules?`,
      evidence: [
        `${loc} lines of code — threshold is ${LARGE_FILE_THRESHOLD} LOC`,
        "Large files concentrate complexity, increase merge conflicts, and slow code review",
      ],
      affected_files_count: 1,
    });
  }

  return points;
}

// ── Detector 5: Dependency Heavy ─────────────────────────────────────────────

interface DepCheck {
  file: string;
  count: number;
  type: string;
}

function parseDependencyCount(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const filename = path.basename(filePath);

    if (filename === "package.json") {
      const json = JSON.parse(content);
      return Object.keys(json.dependencies ?? {}).length +
             Object.keys(json.devDependencies ?? {}).length;
    }
    if (filename === "requirements.txt" || filename === "Pipfile") {
      return content.split("\n").filter((l) => l.trim() && !l.startsWith("#")).length;
    }
    if (filename === "pom.xml") {
      return (content.match(/<dependency>/g) ?? []).length;
    }
    if (filename === "go.mod") {
      return (content.match(/^\s+\S+\s+v/gm) ?? []).length;
    }
    return 0;
  } catch {
    return 0;
  }
}

function detectDependencyHeavy(
  repoPath: string,
  allFiles: string[]
): PressurePoint[] {
  const points: PressurePoint[] = [];
  let ppIdx = 400;
  const HEAVY_THRESHOLD = 30;

  const depFiles: DepCheck[] = allFiles
    .filter((f) => DEPENDENCY_FILES.includes(path.basename(f)))
    .map((f) => ({
      file: path.relative(repoPath, f).replace(/\\/g, "/"),
      count: parseDependencyCount(f),
      type: path.basename(f),
    }))
    .filter(({ count }) => count >= HEAVY_THRESHOLD);

  for (const dep of depFiles) {
    // urgency = clamp((count - 30) * 1.5 + 40, 40, 80)
    const urgency = Math.round(clamp((dep.count - HEAVY_THRESHOLD) * 1.5 + 40, 40, 80));

    points.push({
      id: `pp-${String(ppIdx++).padStart(3, "0")}`,
      type: "DEPENDENCY_HEAVY",
      location: dep.file,
      urgency_score: urgency,
      suggested_decision: `Should we audit and prune the dependencies of "${dep.file}" (${dep.count} total)?`,
      evidence: [
        `${dep.count} declared dependencies in ${dep.type}`,
        `Threshold: ${HEAVY_THRESHOLD} dependencies`,
        "Excessive dependencies increase attack surface, build time, and maintenance burden",
      ],
      affected_files_count: dep.count,
    });
  }

  return points;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export async function scan_decisions(input: ScanDecisionsInput): Promise<string> {
  const repoPath = input.repo_path ?? path.join(process.cwd(), "demo-repo", "galaxium-travels");

  if (!fs.existsSync(repoPath)) {
    return JSON.stringify({
      error: `Repository not found: ${repoPath}`,
      hint: "Run scripts/clone-demo-repo.ps1 to populate demo-repo/galaxium-travels",
    });
  }

  const git = simpleGit(repoPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    return JSON.stringify({ error: `Not a git repository: ${repoPath}` });
  }

  const allFiles = walkDir(repoPath);

  // Run all detectors in parallel
  const [churnPoints, stalePoints] = await Promise.all([
    detectHighChurnLowTest(repoPath, allFiles, git),
    detectStaleModules(repoPath, git),
  ]);

  const polyglotPoints = detectPolyglotFriction(repoPath, allFiles);
  const largeFilePoints = detectLargeFiles(repoPath, allFiles);
  const depHeavyPoints = detectDependencyHeavy(repoPath, allFiles);

  const allPoints: PressurePoint[] = [
    ...churnPoints,
    ...stalePoints,
    ...polyglotPoints,
    ...largeFilePoints,
    ...depHeavyPoints,
  ].sort((a, b) => b.urgency_score - a.urgency_score);

  // Re-index IDs in urgency order
  const indexedPoints = allPoints.map((p, i) => ({
    ...p,
    id: `pp-${String(i + 1).padStart(3, "0")}`,
  }));

  const topUrgent = indexedPoints.filter((p) => p.urgency_score >= 70).length;
  const medium = indexedPoints.filter((p) => p.urgency_score >= 40 && p.urgency_score < 70).length;
  const low = indexedPoints.filter((p) => p.urgency_score < 40).length;

  return JSON.stringify(
    {
      scanned_at: new Date().toISOString(),
      repo_path: repoPath,
      pressure_points: indexedPoints,
      summary: `Found ${indexedPoints.length} architectural pressure points: ${topUrgent} high urgency (>=70), ${medium} medium (40-69), ${low} low (<40). Top decision: "${indexedPoints[0]?.suggested_decision ?? "none"}"`,
      by_type: {
        POLYGLOT_FRICTION: polyglotPoints.length,
        HIGH_CHURN_LOW_TEST: churnPoints.length,
        STALE_MODULE: stalePoints.length,
        LARGE_FILE: largeFilePoints.length,
        DEPENDENCY_HEAVY: depHeavyPoints.length,
      },
    },
    null,
    2
  );
}
