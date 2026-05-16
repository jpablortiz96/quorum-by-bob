"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { AgentPanel } from "@/components/agent-panel";
import { EvidencePanel } from "@/components/evidence-panel";
import { DCSGauge } from "@/components/dcs-gauge";
import { AGENTS, DEBATE_ORDER, AGENT_MAP } from "@/lib/agents";
import type { AgentSlug, AgentStatus, CouncilData, AgentReport, Citation } from "@/types/quorum";

type DebateState = "idle" | "simulating" | "done";

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
  conservative: "No evidence found for inventory hold domain logic in current codebase. The booking service handles immediate seat decrements without hold/quote workflows, suggesting the Java service addressed a missing capability. Java's strong typing and enterprise transaction patterns suit inventory hold state machines better than Python's dynamic typing. A separate Java service would have isolated hold logic from the 8 MED-criticality consumers - a textbook microservice boundary. The consolidation after 13 days suggests implementation issues, not architectural flaws.",
  reformer: "The Java inventory_hold_service was never deployed to production. It exists only as merged code (PR #9, April 16, 2026) with no directory presence in the repository. Zero maintenance burden post-consolidation at $400/year with no documented integration benefits from dual-language architecture. The Python backend is already handling all booking workflows with no service interruptions since consolidation.",
  historian: "5-commit timeline: aba26aa (Apr 10) service introduced but immediately non-functional; 10d8576 (Apr 13) Python modified to bridge Java service - workaround architecture; 8f7ad7f (Apr 16) merged despite integration issues; 59f9b46 (Apr 20) directory renamed - namespace collision or organizational regret; 4156ec0 (Apr 23) subsequent development bypasses Java service entirely. Lifecycle: 13 days. Vocabulary: 'not visible', 'integrate', 'renaming' - language of failure and remediation.",
  economist: "Java service directory does not exist in repository - never deployed to production. Python Service Annual Maintenance: $400/year (5 hours). Consolidation Cost: $2,160 (27 hours). Break-Even Time: 64.8 months. 3-Year ROI: -44.4%. The weak ROI stems from inability to calculate the avoided dual-service cost. Economic verdict: DEFER - insufficient data for confident ROI calculation, but status quo ($400/year Python-only) is economically stable.",
  "risk-officer": "Consolidation eliminated: (1) cross-service HTTP communication failures between Python and Java layers, (2) deployment coordination complexity across two runtimes, (3) dual-stack maintenance burden on a solo contributor. Current risk: booking.py has 10 consumers with criticality score 58/100 - any modification to the hold implementation has broad blast radius. Residual risk: missing hold mechanism means frontend cannot display hold states, creating a UX debt that will require Python-side implementation.",
  engineer: "Python/FastAPI is technically capable of implementing inventory hold workflows. However: booking_system_backend/services/booking.py:7-54 currently handles immediate seat decrements only - no hold/quote/expiry state machine. models.py:22-28 Booking model lacks hold_expiry or quote_id fields. schemas.py:24-32 BookingOut schema contains only final booking states. The consolidation is architecturally correct but technically incomplete - the Python service must implement what the Java service was designed to provide before this ADR can be considered fully executed.",
  judge: "The Council accepts consolidation of inventory hold functionality into the Python backend, conditional upon implementing the missing hold/quote workflow capabilities. The 13-day lifecycle of the Java service demonstrates architectural friction that outweighs theoretical benefits of domain boundary isolation. However, consolidation must not be treated as complete until the Python service implements proper inventory hold mechanisms with expiry timers and quote generation. Decision Confidence Score: 69.0/100. Verdict: PROCEED WITH CONDITIONS.",
};

const AGENT_CITATIONS: Record<AgentSlug, string[]> = {
  conservative: ["aba26aa", "8f7ad7f"],
  reformer: ["8f7ad7f", "10d8576"],
  historian: ["aba26aa", "10d8576", "8f7ad7f", "59f9b46", "4156ec0"],
  economist: [],
  "risk-officer": ["10d8576"],
  engineer: [],
  judge: ["aba26aa", "10d8576", "8f7ad7f"],
};

function useTypewriter(text: string, active: boolean, charsPerTick = 4) {
  const [typed, setTyped] = useState("");
  const posRef = useRef(0);

  useEffect(() => {
    if (!active) { setTyped(""); posRef.current = 0; return; }
    posRef.current = 0;
    setTyped("");

    const interval = setInterval(() => {
      posRef.current = Math.min(posRef.current + charsPerTick, text.length);
      setTyped(text.slice(0, posRef.current));
      if (posRef.current >= text.length) clearInterval(interval);
    }, 33);

    return () => clearInterval(interval);
  }, [text, active, charsPerTick]);

  return typed;
}

export default function CouncilPage() {
  const router = useRouter();
  const [debateState, setDebateState] = useState<DebateState>("idle");
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentSlug, AgentStatus>>(
    () => Object.fromEntries(AGENTS.map((a) => [a.slug, "idle"])) as Record<AgentSlug, AgentStatus>
  );
  const [activeAgent, setActiveAgent] = useState<AgentSlug | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [dcsAnimating, setDcsAnimating] = useState(false);
  const [showADR, setShowADR] = useState(false);
  const [muted, setMuted] = useState(false);
  const [councilData, setCouncilData] = useState<CouncilData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/council").then((r) => r.json()).then(setCouncilData).catch(() => null);
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/gavel.mp3");
      audioRef.current.volume = 0.5;
    }
  }, []);

  const setStatus = useCallback((slug: AgentSlug, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [slug]: status }));
  }, []);

  const runAgent = useCallback(async (slug: AgentSlug, isJudge: boolean) => {
    setActiveAgent(slug);
    setStatus(slug, "thinking");

    await new Promise((r) => setTimeout(r, isJudge ? 2000 : 1200));

    const citations = AGENT_CITATIONS[slug];
    if (citations.length > 0) {
      setActiveCitation({ hash: citations[0] });
    }

    setStatus(slug, "speaking");

    const textLen = AGENT_SUMMARIES[slug].length;
    const duration = (textLen / 18) * 33;
    await new Promise((r) => setTimeout(r, Math.min(duration, 6000)));

    if (citations.length > 1) {
      setActiveCitation({ hash: citations[1] });
    }

    setStatus(slug, "done");
    await new Promise((r) => setTimeout(r, 400));
  }, [setStatus]);

  const startDebate = useCallback(async () => {
    setDebateState("simulating");
    setDcsAnimating(false);
    setShowADR(false);
    setAgentStatuses(
      Object.fromEntries(AGENTS.map((a) => [a.slug, "idle"])) as Record<AgentSlug, AgentStatus>
    );
    setActiveCitation(null);

    const nonJudge = DEBATE_ORDER.filter((s) => s !== "judge");
    for (const slug of nonJudge) {
      await runAgent(slug, false);
    }

    setActiveAgent("judge");
    setStatus("judge", "thinking");
    if (!muted && audioRef.current) {
      audioRef.current.play().catch(() => null);
    }
    await new Promise((r) => setTimeout(r, 2500));
    setActiveCitation({ hash: "8f7ad7f" });
    setStatus("judge", "speaking");

    const judgeDuration = Math.min((AGENT_SUMMARIES.judge.length / 18) * 33, 8000);
    await new Promise((r) => setTimeout(r, judgeDuration));
    setStatus("judge", "done");

    await new Promise((r) => setTimeout(r, 600));
    setDcsAnimating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setShowADR(true);
    setDebateState("done");
  }, [runAgent, setStatus, muted]);

  const reset = useCallback(() => {
    setDebateState("idle");
    setDcsAnimating(false);
    setShowADR(false);
    setActiveAgent(null);
    setActiveCitation(null);
    setAgentStatuses(
      Object.fromEntries(AGENTS.map((a) => [a.slug, "idle"])) as Record<AgentSlug, AgentStatus>
    );
  }, []);

  const nonJudgeAgents = AGENTS.filter((a) => a.slug !== "judge");

  return (
    <div className="min-h-screen bg-[#161616]">
      {/* Header */}
      <div className="border-b border-[#262626] bg-[#161616]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-[#8d8d8d] hover:text-[#f4f4f4] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <span className="text-[#262626]">|</span>
            <span className="font-bold tracking-wider text-[#f4f4f4]">&#9878;&#65039; Council Chamber</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg border border-[#262626] text-[#8d8d8d] hover:text-[#f4f4f4] transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {debateState !== "idle" && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#262626] text-[#8d8d8d] hover:text-[#f4f4f4] text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8 flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Decision question */}
          <div className="rounded-xl border border-[#262626] bg-[#262626] p-6">
            <div className="text-xs font-medium uppercase tracking-widest text-[#8d8d8d] mb-3">
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
              {["Galaxium Travels", "Backend Architecture", "Java -> Python", "Microservices"].map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-[#393939] text-[#8d8d8d] font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Agent grid - 6 in 3x2 */}
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-[#8d8d8d] mb-4">
              Council Members
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
                  typedContent={activeAgent === agent.slug ? AGENT_SUMMARIES[agent.slug].slice(0, 500) : ""}
                  stance={AGENT_STANCES[agent.slug]}
                />
              ))}
            </motion.div>
          </div>

          {/* The Judge - full width, larger */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-[#0f62fe]">
                &#9878;&#65039; The Judge - Final Verdict
              </span>
              <div className="flex-1 h-px bg-[#0f62fe30]" />
            </div>
            <AgentPanel
              slug="judge"
              status={agentStatuses.judge}
              content={AGENT_SUMMARIES.judge}
              typedContent={activeAgent === "judge" ? AGENT_SUMMARIES.judge.slice(0, 600) : ""}
              stance={AGENT_STANCES.judge}
              isJudge
            />
          </div>

          {/* Start button */}
          {debateState === "idle" && (
            <motion.div
              className="flex justify-center py-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={startDebate}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#0f62fe", color: "#ffffff" }}
              >
                &#127963;&#65039; Start Council Debate
              </button>
            </motion.div>
          )}

          {/* Simulating indicator */}
          {debateState === "simulating" && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-xs text-[#8d8d8d]">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#0f62fe]"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Council in session...
              </div>
            </div>
          )}

          {/* DCS result + ADR */}
          <AnimatePresence>
            {dcsAnimating && (
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
                      <div className="flex justify-center gap-3 pt-2">
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
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-[#262626] text-[#c6c6c6] hover:text-[#f4f4f4] hover:border-[#404040] transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Run Another Council
                        </button>
                        <button
                          onClick={() => router.push("/")}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-[#262626] text-[#c6c6c6] hover:text-[#f4f4f4] hover:border-[#404040] transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Dashboard
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
