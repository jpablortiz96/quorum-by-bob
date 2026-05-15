import { z } from "zod";
import simpleGit from "simple-git";
import path from "path";

export const GitArchaeologyInputSchema = z.object({
  keyword: z.string().describe("Keyword or pattern to search in commit messages (e.g. 'migration', 'refactor', 'revert')"),
  since_date: z.string().optional().describe("ISO date string to search from (e.g. '2022-01-01'). Defaults to 2 years ago."),
  repo_path: z.string().optional().describe("Path to the git repository. Defaults to demo-repo/galaxium-travels"),
});

export type GitArchaeologyInput = z.infer<typeof GitArchaeologyInputSchema>;

interface CommitEntry {
  hash: string;
  date: string;
  author: string;
  message: string;
  files_changed: string[];
}

export async function git_archaeology(input: GitArchaeologyInput): Promise<string> {
  const repoPath = input.repo_path ?? path.join(process.cwd(), "..", "demo-repo", "galaxium-travels");
  const sinceDate = input.since_date ?? new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const git = simpleGit(repoPath);

  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    return JSON.stringify({
      error: `Not a git repository: ${repoPath}`,
      hint: "Run scripts/clone-demo-repo.ps1 to populate demo-repo/galaxium-travels",
    });
  }

  const logResult = await git.log({
    "--grep": input.keyword,
    "-i": null,
    "--since": sinceDate,
    "--format": "%H|%ad|%an|%s",
    "--date": "short",
  });

  const commits: CommitEntry[] = [];

  for (const entry of logResult.all.slice(0, 50)) {
    const parts = entry.hash.split("|");
    if (parts.length < 4) continue;

    const [hash, date, author, ...msgParts] = parts;
    const message = msgParts.join("|");

    let filesChanged: string[] = [];
    try {
      const show = await git.show(["--name-only", "--format=", hash]);
      filesChanged = show.split("\n").filter((f) => f.trim().length > 0).slice(0, 10);
    } catch {
      filesChanged = [];
    }

    commits.push({
      hash: hash.substring(0, 7),
      date,
      author,
      message,
      files_changed: filesChanged,
    });
  }

  const branchResult = await git.branch(["-a"]).catch(() => ({ all: [] }));
  const relevantBranches = branchResult.all.filter((b) =>
    b.toLowerCase().includes(input.keyword.toLowerCase())
  );

  return JSON.stringify(
    {
      keyword: input.keyword,
      since_date: sinceDate,
      repo_path: repoPath,
      commits_found: commits.length,
      commits,
      relevant_branches: relevantBranches,
      summary: `Found ${commits.length} commits matching "${input.keyword}" since ${sinceDate}. ${relevantBranches.length} relevant branches found.`,
    },
    null,
    2
  );
}
