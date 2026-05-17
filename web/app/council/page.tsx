"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RotateCcw, FastForward } from "lucide-react";
import { Nav } from "@/components/nav";
import { AgentPanel } from "@/components/agent-panel";
import { EvidencePanel } from "@/components/evidence-panel";
import { DCSGauge } from "@/components/dcs-gauge";
import { AGENTS, DEBATE_ORDER, AGENT_MAP } from "@/lib/agents";
import type { AgentSlug, AgentStatus, Citation } from "@/types/quorum";

type Phase = "idle" | "round1" | "round2" | "verdict" | "done";

const AGENT_STANCES: Record<AgentSlug, string> = {
  conservative: "OPPOSE - Java separation was architecturally sound",
  reformer: "SUPPORT - Zero maintenance burden post-consolidation ($400/year)",
  historian: "SUPPORT - 5-commit timeline shows introduction -> failure -> abandonment",
  economist: "DEFER - Cannot calculate avoided dual-service cost; -44.4% ROI",
  "risk-officer": "SUPPORT - Consolidation eliminated cross-service communication failures",
  engineer: "SUPPORT WITH CAVEATS - Python capable but missing hold mechanism",
  judge: "VERDICT: PROCEED WITH CONDITIONS - DCS 69.0/100",
};

const AGENT_SUMMARIES: Record<AgentSlug, string> = {
  conservative: "No evidence found for inventory hold domain logic in current codebase. The booking service handles immediate seat decrements without hold/quote workflows. Java's strong typing and enterprise transaction patterns suit inventory hold state machines better than Python's dynamic typing. A separate Java service would have isolated hold logic from the 8 MED-criticality consumers. The 13-day lifecycle suggests implementation issues, not architectural flaws.",
  reformer: "The Java inventory_hold_service was never deployed to production. It exists only as merged code (PR #9, commit 8f7ad7f) with no directory presence in the repository. Zero maintenance burden post-consolidation at $400/year. Commit 10d8576 proves the Python backend already integrates the hold workflow. Dual-language architecture produced zero documented integration benefits.",
  historian: "5-commit timeline: aba26aa (Apr 10) introduced but immediately non-functional; 10d8576 (Apr 13) Python modified to bridge Java - workaround architecture; 8f7ad7f (Apr 16) merged despite integration issues; 59f9b46 (Apr 20) directory renamed amid organizational confusion; 4156ec0 (Apr 23) subsequent development bypasses Java entirely. 13 days. Vocabulary: 'not visible', 'renaming' - language of failure.",
  economist: "Java service directory does not exist in repository - never deployed. Python Service Annual Maintenance: $400/year. Consolidation Cost: $2,160. Break-Even: 64.8 months. 3-Year ROI: -44.4%. Economic verdict: DEFER - insufficient data. The avoided dual-service cost cannot be calculated because the Java service was never deployed to production.",
  "risk-officer": "Consolidation eliminated: (1) cross-service HTTP failures between Python and Java, (2) deployment coordination across two runtimes, (3) dual-stack maintenance burden. Current risk: booking.py has 10 consumers, criticality 58/100. Residual risk: missing hold mechanism creates UX debt requiring Python-side implementation.",
  engineer: "Python/FastAPI is technically capable of implementing inventory hold workflows. However: booking.py:7-54 handles immediate seat decrements only - no hold/quote/expiry state machine. models.py lacks hold_expiry and quote_id fields. schemas.py BookingOut has only final booking states. Architecturally correct but technically incomplete - the Python service must implement what the Java service was designed to provide.",
  judge: "The Council accepts consolidation into the Python backend, conditional upon implementing the missing hold/quote workflow capabilities. The 13-day lifecycle demonstrates architectural friction that outweighs theoretical benefits of domain boundary isolation. Consolidation must not be treated as complete until the Python service implements proper inventory hold mechanisms with expiry timers and quote generation. Decision Confidence Score: 69.0/100. Verdict: PROCEED WITH CONDITIONS.",
};

const AGENT_CITATIONS: Record<AgentSlug, string[]> = {
  conservative: ["aba26aa", "8f7ad7f"],
  reformer: ["8f7ad7f", "10d8576"],
  historian: ["aba26aa", "10d8576", "8f7ad7f", "59f9b46", "4156ec0"],
  economist: ["8f7ad7f"],
  "risk-officer": ["10d8576"],
  engineer: [],
  judge: ["aba26aa", "10d8576", "8f7ad7f"],
};

const CONFRONTATIONS = [
  {
    id: "status-quo-vs-change",
    title: "Status Quo vs Change",
    left: { slug: "conservative" as AgentSlug, stance: "OPPOSE" },
    right: { slug: "reformer" as AgentSlug, stance: "SUPPORT" },
    outcome: "Split - both MAINTAIN",
    outcomeColor: "#f1c21b",
    summary: "Reformer's core argument holds: commit 10d8576 proves hold workflow exists in Python. Conservative's secondary point on stability is valid. Net: consolidation justified, technical debt acknowledged.",
    citation: "10d8576",
  },
  {
    id: "precedent-vs-feasibility",
    title: "Precedent vs Feasibility",
    left: { slug: "historian" as AgentSlug, stance: "SUPPORT" },
    right: { slug: "engineer" as AgentSlug, stance: "SUPPORT WITH CAVEATS" },
    outcome: "Historian holds",
    outcomeColor: "#be95ff",
    summary: "Engineer's evidence strengthens Historian's case. 'Architecturally correct but technically incomplete' is exactly the pattern that produced the 13-day failure cycle. History records what ships.",
    citation: "aba26aa",
  },
  {
    id: "cost-vs-risk",
    title: "Cost vs Risk",
    left: { slug: "economist" as AgentSlug, stance: "DEFER" },
    right: { slug: "risk-officer" as AgentSlug, stance: "SUPPORT" },
    outcome: "Both MAINTAIN",
    outcomeColor: "#f1c21b",
    summary: "Economist prevails on evidence (Java never deployed - phantom risks). Risk Officer holds on reasoning (10 consumers, criticality 58/100 is a live risk today). Positions incompatible; no concession.",
    citation: "8f7ad7f",
  },
];

export default function CouncilPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentSlug, AgentStatus>>(
    () => Object.fromEntries(AGENTS.map((a) => [a.slug, "idle"])) as Record<AgentSlug, AgentStatus>
  );
  const [activeAgent, setActiveAgent] = useState<AgentSlug | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [round2Revealed, setRound2Revealed] = useState(0);
  const [showDCS, setShowDCS] = useState(false);
  const [showADR, setShowADR] = useState(false);
  const abortRef = useRef(false);

  const setStatus = useCallback((slug: AgentSlug, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [slug]: status }));
  }, []);

  const runAgent = useCallback(async (slug: AgentSlug) => {
    if (abortRef.current) return;
    setActiveAgent(slug);
    setStatus(slug, "thinking");
    await new Promise((r) => setTimeout(r, slug === "judge" ? 2000 : 1000));
    if (abortRef.current) return;

    const cites = AGENT_CITATIONS[slug];
    if (cites.length > 0) setActiveCitation({ hash: cites[0] });

    setStatus(slug, "speaking");
    const textLen = AGENT_SUMMARIES[slug].length;
    const duration = Math.min((textLen / 20) * 33, 5000);
    await new Promise((r) => setTimeout(r, duration));
    if (abortRef.current) return;

    if (cites.length > 1) setActiveCitation({ hash: cites[1] });
    setStatus(slug, "done");
    await new Promise((r) => setTimeout(r, 300));
  }, [setStatus]);

  const runRound1 = useCallback(async () => {
    const nonJudge = DEBATE_ORDER.filter((s) => s !== "judge");
    for (const slug of nonJudge) {
      if (abortRef.current) return;
      await runAgent(slug);
    }
  }, [runAgent]);

  const runRound2 = useCallback(async () => {
    for (let i = 0; i < CONFRONTATIONS.length; i++) {
      if (abortRef.current) return;
      const conf = CONFRONTATIONS[i];
      setActiveCitation({ hash: conf.citation });
      setRound2Revealed(i + 1);
      await new Promise((r) => setTimeout(r, 1200));
    }
    await new Promise((r) => setTimeout(r, 800));
  }, []);

  const runVerdict = useCallback(async () => {
    if (abortRef.current) return;
    await runAgent("judge");
    if (abortRef.current) return;
    await new Promise((r) => setTimeout(r, 600));
    setShowDCS(true);
    await new Promise((r) => setTimeout(r, 2200));
    setShowADR(true);
  }, [runAgent]);

  const startDebate = useCallback(async () => {
    abortRef.current = false;
    setPhase("round1");
    setAgentStatuses(Object.fromEntries(AGENTS.map((a) => [a.slug, "idle"])) as Record<AgentSlug, AgentStatus>);
    setActiveCitation(null);
    setRound2Revealed(0);
    setShowDCS(false);
    setShowADR(false);

    await runRound1();
    if (abortRef.current) return;

    setPhase("round2");
    await runRound2();
    if (abortRef.current) return;

    setPhase("verdict");
    await runVerdict();
    if (abortRef.current) return;

    setPhase("done");
  }, [runRound1, runRound2, runVerdict]);

  const skipToVerdict = useCallback(() => {
    abortRef.current = true;
    // Mark all non-judge as done
    const statuses = Object.fromEntries(AGENTS.map((a) => [a.slug, a.slug === "judge" ? "idle" : "done"])) as Record<AgentSlug, AgentStatus>;
    setAgentStatuses(statuses);
    setRound2Revealed(CONFRONTATIONS.length);
    setPhase("verdict");
    abortRef.current = false;

    (async () => {
      await runAgent("judge");
      setShowDCS(true);
      await new Promise((r) => setTimeout(r, 2200));
      setShowADR(true);
      setPhase("done");
    })();
  }, [runAgent]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setTimeout(() => {
      abortRef.current = false;
      setPhase("idle");
      setShowDCS(false);
      setShowADR(false);
      setActiveAgent(null);
      setActiveCitation(null);
      setRound2Revealed(0);
      setAgentStatuses(Object.fromEntries(AGENTS.map((a) => [a.slug, "idle"])) as Record<AgentSlug, AgentStatus>);
    }, 100);
  }, []);

  const nonJudgeAgents = AGENTS.filter((a) => a.slug !== "judge");

  return (
    <div className="min-h-screen bg-[#161616]">
      <Nav />

      <div className="max-w-[1400px] mx-auto px-8 py-8 flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Decision question */}
          <div className="rounded-xl border border-[#262626] bg-[#262626] p-6">
            <div className="text-xs font-medium uppercase tracking-widest text-[#8d8d8d] mb-2">
              Decision Under Review
            </div>
            <h1 className="text-2xl font-bold text-[#f4f4f4] mb-2">
              Should we consolidate the{" "}
              <span className="font-mono text-[#78a9ff]">inventory_hold_service</span>?
            </h1>
            <p className="text-sm text-[#c6c6c6]">
              The Java inventory_hold_service was introduced on April 10, 2026 and abandoned 13 days later.
              Should the functionality be consolidated into the Python backend?
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Galaxium Travels", "Backend Architecture", "Java to Python", "Microservices"].map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-[#393939] text-[#8d8d8d] font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Start / controls */}
          {phase === "idle" && (
            <motion.div className="flex justify-center py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={startDebate}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#0f62fe", color: "#ffffff" }}
              >
                Start Council Debate
              </button>
            </motion.div>
          )}

          {phase !== "idle" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{
                    color: phase === "round1" ? "#0f62fe" : phase === "round2" ? "#be95ff" : "#42be65",
                    backgroundColor: phase === "round1" ? "#0f62fe15" : phase === "round2" ? "#be95ff15" : "#42be6515",
                    border: `1px solid ${phase === "round1" ? "#0f62fe40" : phase === "round2" ? "#be95ff40" : "#42be6540"}`,
                  }}
                >
                  {phase === "round1" && "Round 1 - Initial Stances"}
                  {phase === "round2" && "Round 2 - Cross Examination"}
                  {(phase === "verdict" || phase === "done") && "Verdict"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(phase === "round1" || phase === "round2") && (
                  <button
                    onClick={skipToVerdict}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#393939] text-[#8d8d8d] hover:text-[#f4f4f4] text-xs transition-colors"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Skip to Verdict
                  </button>
                )}
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#393939] text-[#8d8d8d] hover:text-[#f4f4f4] text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Round 1: Agent Grid */}
          {phase !== "idle" && (
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-[#8d8d8d] mb-4">
                Round 1 - Council Members
              </div>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              >
                {nonJudgeAgents.map((agent) => (
                  <AgentPanel
                    key={agent.slug}
                    slug={agent.slug}
                    status={agentStatuses[agent.slug]}
                    content={AGENT_SUMMARIES[agent.slug]}
                    typedContent={activeAgent === agent.slug ? AGENT_SUMMARIES[agent.slug] : ""}
                    stance={AGENT_STANCES[agent.slug]}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {/* Round 2: Cross-Examination */}
          {(phase === "round2" || phase === "verdict" || phase === "done") && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xs font-medium uppercase tracking-widest text-[#be95ff]">
                  Round 2 - Cross-Examination
                </div>
                <div className="flex-1 h-px bg-[#be95ff20]" />
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {CONFRONTATIONS.slice(0, round2Revealed).map((conf, i) => {
                    const leftAgent = AGENT_MAP[conf.left.slug];
                    const rightAgent = AGENT_MAP[conf.right.slug];
                    return (
                      <motion.div
                        key={conf.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-xl border p-5"
                        style={{ borderColor: `${conf.outcomeColor}30`, backgroundColor: `${conf.outcomeColor}06` }}
                      >
                        <div className="text-xs font-semibold text-[#8d8d8d] uppercase tracking-wider mb-3">
                          {conf.title}
                        </div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {/* Left agent */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: leftAgent.color }}>
                              {leftAgent.name}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ color: leftAgent.color, backgroundColor: `${leftAgent.color}20` }}
                            >
                              {conf.left.stance}
                            </span>
                          </div>
                          <span className="text-[#393939] font-bold">vs</span>
                          {/* Right agent */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: rightAgent.color }}>
                              {rightAgent.name}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ color: rightAgent.color, backgroundColor: `${rightAgent.color}20` }}
                            >
                              {conf.right.stance}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ color: conf.outcomeColor, backgroundColor: `${conf.outcomeColor}20`, border: `1px solid ${conf.outcomeColor}40` }}
                            >
                              {conf.outcome}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[#c6c6c6] leading-relaxed">{conf.summary}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {phase === "round2" && round2Revealed < CONFRONTATIONS.length && (
                  <div className="flex items-center gap-2 text-xs text-[#8d8d8d] py-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-[#be95ff]"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    Cross-examination in progress...
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Verdict: Judge + DCS */}
          {(phase === "verdict" || phase === "done") && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium uppercase tracking-widest text-[#d4af37]">
                  The Judge - Final Verdict
                </span>
                <div className="flex-1 h-px bg-[#d4af3720]" />
              </div>
              <AgentPanel
                slug="judge"
                status={agentStatuses.judge}
                content={AGENT_SUMMARIES.judge}
                typedContent={activeAgent === "judge" ? AGENT_SUMMARIES.judge : ""}
                stance={AGENT_STANCES.judge}
                isJudge
              />
            </motion.div>
          )}

          {/* DCS Gauge */}
          <AnimatePresence>
            {showDCS && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#0f62fe40] bg-[#0f62fe08] p-8"
              >
                <div className="text-xs font-medium uppercase tracking-widest text-[#78a9ff] mb-6 text-center">
                  Decision Confidence Score
                </div>
                <div className="flex justify-center">
                  <DCSGauge target={69.0} animate={true} size={260} />
                </div>

                <AnimatePresence>
                  {showADR && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 space-y-4"
                    >
                      <div className="h-px bg-[#262626]" />
                      <div className="text-center space-y-1">
                        <div className="text-sm font-semibold text-[#f4f4f4]">ADR-2026-001 Generated</div>
                        <div className="text-xs text-[#8d8d8d]">Java Service Consolidation - Accepted with Conditions</div>
                      </div>
                      <div className="flex justify-center gap-3 pt-2 flex-wrap">
                        <a
                          href="/api/download/ADR-2026-001"
                          download
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                          style={{ backgroundColor: "#0f62fe", color: "#ffffff" }}
                        >
                          <Download className="w-4 h-4" />
                          Download ADR
                        </a>
                        <button
                          onClick={reset}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-[#262626] text-[#c6c6c6] hover:text-[#f4f4f4] transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Run Another Council
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Evidence sidebar */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <EvidencePanel citation={activeCitation} />
        </div>
      </div>
    </div>
  );
}
