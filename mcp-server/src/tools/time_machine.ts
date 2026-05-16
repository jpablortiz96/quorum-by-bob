import { z } from "zod";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs";

export const TimeMachineInputSchema = z.object({
  repo_path: z.string().optional().describe("Absolute path to the git repository. Defaults to demo-repo/galaxium-travels"),
  target_commit: z.string().describe("The commit hash to inspect. The tool captures the repo state JUST BEFORE this commit."),
});

export type TimeMachineInput = z.infer<typeof TimeMachineInputSchema>;

const CODE_EXTENSIONS = new Set([".py", ".java", ".js", ".ts", ".go", ".rb", ".rs", ".kt", ".scala", ".cs", ".cpp", ".c", ".h"]);
const TEST_PATTERN = /test|spec|__tests__|_test\./i;
const SERVICE_PATTERN = /service|backend|server|api/i;

function walkDir(dirPath: string, testCount: { n: number }): { loc: number; files: number; languages: string[] } {
  let loc = 0;
  let files = 0;
  const langSet = new Set<string>();

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith(".")) continue;
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        const sub = walkDir(fullPath, testCount);
        loc += sub.loc;
        files += sub.files;
        sub.languages.forEach((l) => langSet.add(l));
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (CODE_EXTENSIONS.has(ext)) {
          files++;
          langSet.add(ext.slice(1));
          if (TEST_PATTERN.test(item.name)) testCount.n++;
          try {
            loc += fs.readFileSync(fullPath, "utf8").split("\n").length;
          } catch {
            // skip unreadable
          }
        }
      }
    }
  } catch {
    // skip unreadable directory
  }

  return { loc, files, languages: Array.from(langSet) };
}

function captureSnapshot(repoPath: string) {
  let totalLoc = 0;
  const testCount = { n: 0 };
  const servicesPresent: string[] = [];
  const modules: Array<{ name: string; loc: number; files: number; languages: string[] }> = [];

  try {
    const entries = fs.readdirSync(repoPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const dirPath = path.join(repoPath, entry.name);
      const stats = walkDir(dirPath, testCount);
      if (stats.files > 0) {
        modules.push({ name: entry.name, ...stats });
        totalLoc += stats.loc;
        if (SERVICE_PATTERN.test(entry.name)) servicesPresent.push(entry.name);
      }
    }
  } catch {
    // skip
  }

  return {
    services_present: servicesPresent,
    total_loc: totalLoc,
    test_files_count: testCount.n,
    modules: modules.sort((a, b) => b.loc - a.loc).slice(0, 10),
  };
}

export async function time_machine(input: TimeMachineInput): Promise<string> {
  const repoPath = input.repo_path ?? path.join(process.cwd(), "demo-repo", "galaxium-travels");
  const git = simpleGit(repoPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    return JSON.stringify({ error: `Not a git repository: ${repoPath}` });
  }

  let originalRef = "";
  let stashed = false;

  try {
    // Save current position
    const branchInfo = await git.branch();
    if (branchInfo.current) {
      originalRef = branchInfo.current;
    } else {
      originalRef = (await git.raw(["rev-parse", "HEAD"])).trim();
    }

    // Stash dirty working tree
    const statusInfo = await git.status();
    if (statusInfo.files.length > 0) {
      await git.stash(["push", "-m", "time_machine_auto_stash"]);
      stashed = true;
    }

    // Get target commit details
    const targetRaw = await git.raw([
      "log", "--max-count=1", "--format=%H%n%ai%n%an%n%s", input.target_commit,
    ]);
    const [targetHash, targetDate, targetAuthor, targetMessage] = targetRaw.trim().split("\n");
    if (!targetHash) {
      throw new Error(`Commit ${input.target_commit} not found in repository`);
    }

    // Get parent hash (state JUST BEFORE target commit)
    let parentHash = "";
    try {
      parentHash = (await git.raw(["rev-parse", `${input.target_commit}~1`])).trim();
    } catch {
      parentHash = "";
    }

    // Get parent date/message
    let snapshotDate = "";
    let snapshotMessage = "(first commit in repo)";
    if (parentHash) {
      const parentRaw = await git.raw(["log", "--max-count=1", "--format=%ai%n%s", parentHash]);
      const parts = parentRaw.trim().split("\n");
      snapshotDate = parts[0] ?? "";
      snapshotMessage = parts[1] ?? "";
    }

    // What changed in the target commit
    const diffRaw = await git.raw([
      "diff-tree", "--no-commit-id", "-r", "--name-status", input.target_commit,
    ]);
    const changedFiles = diffRaw.trim().split("\n").filter(Boolean).map((line) => {
      const parts = line.split("\t");
      return { status: parts[0] ?? "M", file: parts[1] ?? "" };
    });

    // Checkout parent (detached HEAD)
    const checkoutRef = parentHash || `${input.target_commit}^`;
    await git.checkout([checkoutRef]);

    // Snapshot at past state
    const snapshot = captureSnapshot(repoPath);

    return JSON.stringify(
      {
        target_commit: targetHash.slice(0, 7),
        target_commit_full: targetHash,
        target_commit_message: targetMessage,
        target_commit_date: targetDate,
        target_commit_author: targetAuthor,
        snapshot_date: snapshotDate,
        snapshot_commit: parentHash ? parentHash.slice(0, 7) : "(root)",
        snapshot_label: `Repo state BEFORE "${targetMessage}" (${targetHash.slice(0, 7)})`,
        state_before: snapshot,
        what_changed_in_target: {
          files_added: changedFiles.filter((f) => f.status === "A").map((f) => f.file),
          files_modified: changedFiles.filter((f) => f.status === "M").map((f) => f.file),
          files_deleted: changedFiles.filter((f) => f.status === "D").map((f) => f.file),
          commit_message: targetMessage,
        },
      },
      null,
      2
    );
  } finally {
    // ALWAYS restore — even if an error was thrown above
    try {
      await git.checkout([originalRef]);
    } catch {
      try {
        await git.raw(["checkout", originalRef]);
      } catch {
        // Cannot restore — leave as-is, user must fix manually
      }
    }
    if (stashed) {
      try {
        await git.stash(["pop"]);
      } catch {
        // Stash pop failed — stash entry survives, user can pop manually
      }
    }
  }
}
