import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { git_archaeology, GitArchaeologyInputSchema } from "./tools/git_archaeology.js";
import { dependency_blast_radius, DependencyBlastRadiusInputSchema } from "./tools/dependency_blast_radius.js";
import { module_economics, ModuleEconomicsInputSchema } from "./tools/module_economics.js";
import { cite_evidence, CiteEvidenceInputSchema } from "./tools/cite_evidence.js";
import { score_dimension, ScoreDimensionInputSchema } from "./tools/score_dimension.js";

const TOOLS: Tool[] = [
  {
    name: "git_archaeology",
    description: "Search git history for commits matching a keyword pattern. Returns commits with hashes, dates, authors, messages, and files changed. Used by The Historian to surface precedents, abandoned migrations, and recurring patterns.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "Keyword to search in commit messages (e.g. 'migration', 'refactor', 'revert', 'authentication')",
        },
        since_date: {
          type: "string",
          description: "ISO date string to search from (e.g. '2022-01-01'). Defaults to 2 years ago.",
        },
        repo_path: {
          type: "string",
          description: "Absolute path to the git repository. Defaults to demo-repo/galaxium-travels",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "dependency_blast_radius",
    description: "Analyze which files import or depend on a given module/file. Returns a list of consumers with criticality ratings (HIGH/MED/LOW) and a blast radius score. Used by The Risk Officer to map the impact of a proposed change.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file or module to analyze, relative to repo root (e.g. 'src/auth/session_manager.py')",
        },
        repo_path: {
          type: "string",
          description: "Absolute path to the git repository. Defaults to demo-repo/galaxium-travels",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "module_economics",
    description: "Compute economic metrics for a module or directory: LOC, file count, git churn (commits last 90 days), cost of change estimate, cost of status quo per year, break-even timeline, and 3-year ROI. Used by The Economist.",
    inputSchema: {
      type: "object",
      properties: {
        directory_path: {
          type: "string",
          description: "Path to the module directory, relative to repo root (e.g. 'src/legacy/etl' or 'backend/auth')",
        },
        repo_path: {
          type: "string",
          description: "Absolute path to the git repository. Defaults to demo-repo/galaxium-travels",
        },
        hourly_rate: {
          type: "number",
          description: "Developer hourly rate in USD. Defaults to 80.",
        },
      },
      required: ["directory_path"],
    },
  },
  {
    name: "cite_evidence",
    description: "Validate that a file:line reference exists in the repository and return the actual code snippet. Used to verify citations before including them in council reports. Returns formatted citation text ready for ADR inclusion.",
    inputSchema: {
      type: "object",
      properties: {
        claim: {
          type: "string",
          description: "The factual claim being cited (e.g. 'Session tokens stored in plaintext cookie')",
        },
        file: {
          type: "string",
          description: "File path relative to repo root (e.g. 'src/auth/session.py')",
        },
        lines: {
          type: "string",
          description: "Line number or range (e.g. '42' or '42-58')",
        },
        repo_path: {
          type: "string",
          description: "Absolute path to the git repository. Defaults to demo-repo/galaxium-travels",
        },
      },
      required: ["claim", "file", "lines"],
    },
  },
  {
    name: "score_dimension",
    description: "Register a council agent's score for one of the 6 Decision Confidence Score dimensions. Automatically computes the running DCS total and current verdict. Used by all agents to contribute their scores, and by The Judge to track session progress.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
          description: "Unique identifier for the current council session (e.g. 'ADR-2026-001')",
        },
        dimension: {
          type: "string",
          enum: [
            "evidence_strength",
            "historical_precedent",
            "economic_viability",
            "risk_assessment",
            "technical_feasibility",
            "council_consensus",
          ],
          description: "The Decision Confidence Score dimension being registered",
        },
        agent: {
          type: "string",
          enum: ["conservative", "reformer", "historian", "economist", "risk_officer", "engineer", "judge"],
          description: "The council agent submitting this score",
        },
        value: {
          type: "number",
          description: "Score value 0-100",
          minimum: 0,
          maximum: 100,
        },
        rationale: {
          type: "string",
          description: "One sentence explaining the score, with evidence reference (e.g. 'Break-even at 14 months per module_economics(src/legacy/etl)')",
        },
      },
      required: ["session_id", "dimension", "agent", "value", "rationale"],
    },
  },
];

const server = new Server(
  {
    name: "quorum-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case "git_archaeology": {
        const parsed = GitArchaeologyInputSchema.parse(args);
        result = await git_archaeology(parsed);
        break;
      }
      case "dependency_blast_radius": {
        const parsed = DependencyBlastRadiusInputSchema.parse(args);
        result = await dependency_blast_radius(parsed);
        break;
      }
      case "module_economics": {
        const parsed = ModuleEconomicsInputSchema.parse(args);
        result = await module_economics(parsed);
        break;
      }
      case "cite_evidence": {
        const parsed = CiteEvidenceInputSchema.parse(args);
        result = await cite_evidence(parsed);
        break;
      }
      case "score_dimension": {
        const parsed = ScoreDimensionInputSchema.parse(args);
        result = await score_dimension(parsed);
        break;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: JSON.stringify({ error: message }) }],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  if (process.env.QUORUM_DEBUG) {
    process.stderr.write("[quorum-tools] MCP server connected via stdio\n");
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
