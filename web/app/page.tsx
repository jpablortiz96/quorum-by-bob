"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, GitCommit, FileText, RotateCcw, Shield } from "lucide-react";
import { HealthGauge } from "@/components/health-gauge";
import { HealthRadar } from "@/components/health-radar";
import { ADRList } from "@/components/adr-list";
import type { HealthData, ADR } from "@/types/quorum";

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function StatCard({ icon: Icon, label, value, unit }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#262626] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#8d8d8d]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[#8d8d8d] truncate">{label}</div>
        <div className="text-xl font-bold text-[#f4f4f4] tabular-nums leading-tight">
          {value}
          {unit && <span className="text-sm font-normal text-[#8d8d8d] ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [adrs, setAdrs] = useState<ADR[]>([]);

  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(console.error);
    fetch("/api/adrs").then((r) => r.json()).then(setAdrs).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#161616]">
      {/* Top nav */}
      <div className="border-b border-[#262626] bg-[#161616]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <span className="font-bold tracking-wider text-[#f4f4f4]">&#9878;&#65039; QUORUM</span>
          <span className="text-xs text-[#8d8d8d] font-mono">Architectural Health Monitor</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-16">
        {/* Hero */}
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={FADE_UP} className="flex items-center gap-2 text-xs text-[#8d8d8d] font-mono uppercase tracking-widest">
            <span className="w-6 h-px bg-[#393939] inline-block" />
            Multi-Agent Architecture Tribunal
            <span className="w-6 h-px bg-[#393939] inline-block" />
          </motion.div>

          <motion.h1
            variants={FADE_UP}
            className="text-7xl font-bold text-[#f4f4f4]"
            style={{ letterSpacing: "-0.03em" }}
          >
            QUORUM
          </motion.h1>

          <motion.p variants={FADE_UP} className="text-2xl font-semibold text-[#c6c6c6] max-w-xl">
            Stop making architecture decisions alone.
          </motion.p>

          <motion.p variants={FADE_UP} className="text-sm text-[#8d8d8d] max-w-xl leading-relaxed">
            Multi-agent tribunal for technical governance. 7 specialized AI agents debate your architecture
            decisions using real repository evidence, producing committable ADRs with a Decision Confidence Score.
            Built on IBM Bob.
          </motion.p>
        </motion.div>

        {/* Health Score */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <div className="text-xs font-medium uppercase tracking-widest text-[#8d8d8d] mb-4">
            Repository Health Assessment - Galaxium Travels
          </div>
          <div className="rounded-xl border border-[#393939] bg-[#262626] p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="flex justify-center">
                {health ? (
                  <HealthGauge score={health.overallScore} label="QUORUM Health Score" size={200} />
                ) : (
                  <div className="w-[200px] h-[120px] bg-[#393939] rounded-lg animate-pulse" />
                )}
              </div>

              <div className="space-y-0">
                {health ? (
                  <>
                    <StatCard icon={GitCommit} label="Total Commits Analyzed" value={health.stats.totalCommits} />
                    <StatCard icon={FileText} label="Documented Decisions (ADRs)" value={health.stats.documentedDecisions} />
                    <StatCard icon={RotateCcw} label="Reverted Patterns Detected" value={health.stats.revertedPatterns} />
                    <StatCard icon={Shield} label="Tribunal Coverage" value={health.stats.tribunalCoverage} unit="%" />
                  </>
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-[#393939] rounded animate-pulse" />)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-[#8d8d8d] mb-3 font-medium uppercase tracking-wider">
                  Health Dimensions
                </div>
                {health ? (
                  <HealthRadar dimensions={health.dimensions} />
                ) : (
                  <div className="h-[220px] bg-[#393939] rounded-lg animate-pulse" />
                )}
                {health && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { label: "Decision Quality", value: health.dimensions.decisionQuality, color: "#42be65" },
                      { label: "Tribal Risk", value: health.dimensions.tribalKnowledgeRisk, color: "#fa4d56" },
                      { label: "Reverted", value: health.dimensions.revertedDecisions, color: "#f1c21b" },
                      { label: "Coverage", value: health.dimensions.tribunalCoverage, color: "#be95ff" },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] text-[#8d8d8d]">{d.label}</span>
                        <span className="text-[10px] font-mono text-[#c6c6c6] ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ADR List */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.45 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#f4f4f4]">Architecture Decision Records</h2>
              <p className="text-xs text-[#8d8d8d] mt-0.5">Committed decisions produced by the Quorum Council</p>
            </div>
            <span className="text-xs font-mono text-[#8d8d8d] bg-[#262626] border border-[#393939] px-3 py-1.5 rounded-lg">
              {adrs.length} ADR{adrs.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="rounded-xl border border-[#393939] bg-[#262626] p-6">
            <ADRList adrs={adrs} />
          </div>
        </motion.div>

        {/* DCS Breakdown */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.55 }}>
          <div className="text-xs font-medium uppercase tracking-widest text-[#8d8d8d] mb-4">
            Latest DCS Breakdown - ADR-2026-001
          </div>
          <div className="rounded-xl border border-[#393939] bg-[#262626] p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Evidence Strength", score: 82, weight: 20 },
                { label: "Historical Precedent", score: 85, weight: 15 },
                { label: "Economic Viability", score: 35, weight: 20 },
                { label: "Risk Assessment", score: 85, weight: 20 },
                { label: "Technical Feasibility", score: 50, weight: 15 },
                { label: "Council Consensus", score: 83, weight: 10 },
              ].map((d) => {
                const color = d.score >= 70 ? "#42be65" : d.score >= 50 ? "#f1c21b" : "#fa4d56";
                return (
                  <div key={d.label} className="bg-[#161616] rounded-lg p-4 border border-[#262626]">
                    <div className="text-xs text-[#8d8d8d] mb-2">{d.label}</div>
                    <div className="text-2xl font-bold tabular-nums mb-1" style={{ color }}>
                      {d.score}
                    </div>
                    <div className="w-full h-1 bg-[#393939] rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: color }} />
                    </div>
                    <div className="text-[10px] text-[#8d8d8d] mt-1.5">Weight: {d.weight}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.65 }}
          className="rounded-xl border border-[#0f62fe30] bg-[#0f62fe08] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-xl font-bold text-[#f4f4f4] mb-2">
              Convene the Council on a New Decision
            </h2>
            <p className="text-sm text-[#c6c6c6] max-w-lg">
              Have a technical decision to make? Let 6 specialized agents debate the evidence from your
              repository and produce a committable ADR with a Decision Confidence Score.
            </p>
          </div>
          <button
            onClick={() => router.push("/council")}
            className="flex items-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#0f62fe", color: "#ffffff" }}
          >
            Open Council Chamber
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#262626] mt-24">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-xs text-[#8d8d8d]">QUORUM - Multi-Agent Architecture Tribunal</span>
          <span className="text-xs text-[#c6c6c6] font-mono tracking-wider">Powered by <span style={{ color: "#0f62fe" }}>IBM Bob</span></span>
        </div>
      </footer>
    </div>
  );
}
