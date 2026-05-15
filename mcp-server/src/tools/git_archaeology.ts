import { z } from "zod";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs";

export const GitArchaeologyInputSchema = z.object({
  keyword: z.string().describe("Keyword to search in commit messages. Pass empty string '' to return the last 30 commits without filtering."),
  since_date: z.string().optional().describe("ISO date string to search from (e.g. '2022-01-01'). Defaults to 2 years ago."),
  branch: z.string().optional().describe("Branch to search. Defaults to '--all' (searches all branches)."),
  search_in_files: z.boolean().optional().describe("Also search commits that touched files matching the keyword (in addition to message grep). Default: false."),
  repo_path: z.string().optional().describe("Absolute path to the git repository. Defaults to demo-repo/galaxium-travels inside the workspace."),
});

export type GitArchaeologyInput = z.infer<typeof GitArchaeologyInputSchema>;

interface CommitEntry {
  hash: string;
  date: string;
  author: string;
  message: string;
  files_changed: string[];
}

function debugLog(message: string): void {
  if (!process.env.QUORUM_DEBUG) return;
  try {
    const logsDir = path.join(process.cwd(), "mcp-server", "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const logFile = path.join(logsDir, "server.log");
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, "utf8");
  } catch {
    // never write to stderr
  }
}

export async function git_archaeology(input: GitArchaeologyInput): Promise<string> {
  // cwd = workspace root (D:\quorum-by-bob) when launched by Bob IDE
  const repoPath = input.repo_path ?? path.join(process.cwd(), "demo-repo", "galaxium-travels");
  const sinceDate = input.since_date ?? new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const searchAllBranches = !input.branch;

  debugLog(`git_archaeology: keyword="${input.keyword}" repo="${repoPath}" since="${sinceDate}" branch="${input.branch ?? "--all"}" search_in_files=${input.search_in_files}`);

  const git = simpleGit(repoPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    return JSON.stringify({
      error: `Not a git repository: ${repoPath}`,
      hint: "Run scripts/clone-demo-repo.ps1 to populate demo-repo/galaxium-travels",
    });
  }

  // Check for shallow clone
  const isShallow = fs.existsSync(path.join(repoPath, ".git", "shallow"));
  if (isShallow) {
    return JSON.stringify({
      error: "Repository is a shallow clone — git_archaeology cannot surface historical patterns.",
      hint: "Run scripts/clone-demo-repo.ps1 to perform a full clone (no --depth).",
      shallow_detected: true,
    });
  }

  const commits: CommitEntry[] = [];
  const seenHashes = new Set<string>();

  // ── Search by commit message keyword ─────────────────────
  const logOptions: Record<string, string | null> = {
    "--format": "%H|%ad|%an|%s",
    "--date": "short",
    "--since": sinceDate,
  };

  if (input.keyword) {
    logOptions["--grep"] = input.keyword;
    logOptions["-i"] = null;
  }

  if (searchAllBranches) {
    logOptions["--all"] = null;
  }

  debugLog(`git log options: ${JSON.stringify(logOptions)}`);

  try {
    const branchArg = input.branch ? [input.branch] : [];
    const logResult = await git.log({ ...logOptions, ...(branchArg.length ? { [branchArg[0]]: null } : {}) });

    for (const entry of logResult.all.slice(0, 50)) {
      const parts = entry.hash.split("|");
      if (parts.length < 4) continue;
      const [hash, date, author, ...msgParts] = parts;
      if (seenHashes.has(hash)) continue;
      seenHashes.add(hash);

      let filesChanged: string[] = [];
      try {
        const show = await git.show(["--name-only", "--format=", hash]);
        filesChanged = show.split("\n").filter((f) => f.trim().length > 0).slice(0, 10);
      } catch { /* skip */ }

      commits.push({ hash: hash.substring(0, 7), date, author, message: msgParts.join("|"), files_changed: filesChanged });
    }
  } catch (err) {
    debugLog(`git log error: ${err}`);
  }

  // ── Search in touched files (if requested and keyword provided) ──
  if (input.search_in_files && input.keyword) {
    try {
      const fileLogArgs = [
        "log",
        "--all",
        `--since=${sinceDate}`,
        "--format=%H|%ad|%an|%s",
        "--date=short",
        "-i",
        `--diff-filter=ACMR`,
        "--",
        `*${input.keyword}*`,
      ];
      const rawOut = await git.raw(fileLogArgs);
      const lines = rawOut.split("\n").filter((l) => l.includes("|"));

      for (const line of lines.slice(0, 20)) {
        const parts = line.split("|");
        if (parts.length < 4) continue;
        const [hash, date, author, ...msgParts] = parts;
        const shortHash = hash.substring(0, 7);
        if (seenHashes.has(shortHash)) continue;
        seenHashes.add(shortHash);

        commits.push({
          hash: shortHash,
          date,
          author,
          message: `[file-match] ${msgParts.join("|")}`,
          files_changed: [],
        });
      }
    } catch (err) {
      debugLog(`file-search error: ${err}`);
    }
  }

  // ── Branch scan ──────────────────────────────────────────
  const branchResult = await git.branch(["-a"]).catch(() => ({ all: [] as string[] }));
  const relevantBranches = input.keyword
    ? branchResult.all.filter((b) => b.toLowerCase().includes(input.keyword.toLowerCase()))
    : branchResult.all.filter((b) => !b.includes("HEAD")).slice(0, 10);

  debugLog(`Found ${commits.length} commits, ${relevantBranches.length} relevant branches`);

  const summary = input.keyword
    ? `Found ${commits.length} commits matching "${input.keyword}" since ${sinceDate}${input.search_in_files ? " (including file-name matches)" : ""}. ${relevantBranches.length} relevant branches found.`
    : `Returned last ${commits.length} commits since ${sinceDate} (no keyword filter). ${branchResult.all.length} total branches.`;

  return JSON.stringify(
    {
      keyword: input.keyword || "(none — showing recent commits)",
      since_date: sinceDate,
      branch: input.branch ?? "--all",
      repo_path: repoPath,
      shallow_clone: false,
      commits_found: commits.length,
      commits,
      relevant_branches: relevantBranches,
      all_branches: branchResult.all,
      summary,
    },
    null,
    2
  );
}
