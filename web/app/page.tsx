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

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  context,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  context?: string;
  accent?: string;
}) {
  const fg = accent ?? "#f4f4f4";
  return (
    <div className="rounded-xl border border-[#393939] bg-[#161616] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#8d8d8d]" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8d8d8d]">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-bold tabular-nums leading-none" style={{ color: fg }}>
          {value}
        </span>
        {unit && <span className="text-base text-[#8d8d8d]">{unit}</span>}
      </div>
      {context && (
        <p className="text-xs text-[#8d8d8d] leading-relaxed border-t border-[#262626] pt-2">
          {context}
        </p>
      )}
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
      <div className="border-b border-[#262626] bg-[#161616]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-wider text-[#f4f4f4]">&#9878;&#65039; QUORUM</span>
          <span className="text-sm text-[#8d8d8d] font-mono">Architectural Health Monitor</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-16">
        {/* Hero */}
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={FADE_UP} className="flex items-center gap-2 text-sm text-[#8d8d8d] font-mono uppercase tracking-widest">
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

          <motion.p variants={FADE_UP} className="text-3xl font-semibold text-[#c6c6c6] max-w-2xl">
            Stop making architecture decisions alone.
          </motion.p>

          <motion.p variants={FADE_UP} className="text-base text-[#8d8d8d] max-w-2xl leading-relaxed">
            Multi-agent tribunal for technical governance. 7 specialized AI agents debate your architecture
            decisions using real repository evidence, producing committable ADRs with a Decision Confidence Score.
            Built on IBM Bob.
          </motion.p>
        </motion.div>

        {/* Health Score */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-semibold text-[#f4f4f4] mb-2">Repository Health</h2>
          <p className="text-sm text-[#8d8d8d] mb-6">Galaxium Travels - live assessment</p>
          <div className="rounded-xl border border-[#393939] bg-[#262626] p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Gauge */}
              <div className="flex justify-center pt-4">
                {health ? (
                  <HealthGauge score={health.overallScore} label="QUORUM Health Score" size={220} />
                ) : (
                  <div className="w-[220px] h-[160px] bg-[#393939] rounded-xl animate-pulse" />
                )}
              </div>

              {/* KPI cards 2x2 */}
              {health ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard
                    icon={GitCommit}
                    label="Commits"
                    value={health.stats.totalCommits}
                    accent="#78a9ff"
                    context="Analyzed across all branches"
                  />
                  <StatCard
                    icon={FileText}
                    label="ADRs"
                    value={health.stats.documentedDecisions}
                    accent="#42be65"
                    context="Formally documented decisions"
                  />
                  <StatCard
                    icon={RotateCcw}
                    label="Reverts"
                    value={health.stats.revertedPatterns}
                    accent="#fa4d56"
                    context="Changes later undone - unstable decisions"
                  />
                  <StatCard
                    icon={Shield}
                    label="Coverage"
                    value={health.stats.tribunalCoverage}
                    unit="%"
                    accent="#f1c21b"
                    context="Major changes with a council decision"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-[#393939] rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* Radar chart */}
              <div>
                <div className="text-sm font-semibold text-[#c6c6c6] mb-4 uppercase tracking-wider">
                  Health Dimensions
                </div>
                {health ? (
                  <HealthRadar dimensions={health.dimensions} />
                ) : (
                  <div className="h-[300px] bg-[#393939] rounded-xl animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ADR List */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.45 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#f4f4f4]">Architecture Decision Records</h2>
              <p className="text-sm text-[#8d8d8d] mt-1">Committed decisions produced by the Quorum Council</p>
            </div>
            <span className="text-sm font-mono text-[#8d8d8d] bg-[#262626] border border-[#393939] px-4 py-2 rounded-lg">
              {adrs.filter((a) => a.status !== "SUPERSEDED").length} active ADR{adrs.filter((a) => a.status !== "SUPERSEDED").length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="rounded-xl border border-[#393939] bg-[#262626] p-6">
            <ADRList adrs={adrs} />
          </div>
        </motion.div>

        {/* DCS Breakdown */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.55 }}>
          <h2 className="text-2xl font-semibold text-[#f4f4f4] mb-2">Latest DCS Breakdown</h2>
          <p className="text-sm text-[#8d8d8d] mb-6">ADR-2026-001 - Java Service Consolidation</p>
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
                  <div key={d.label} className="bg-[#161616] rounded-xl p-5 border border-[#262626]">
                    <div className="text-sm text-[#8d8d8d] mb-3 font-medium">{d.label}</div>
                    <div className="text-4xl font-bold tabular-nums mb-2" style={{ color }}>
                      {d.score}
                    </div>
                    <div className="w-full h-1.5 bg-[#393939] rounded-full mb-2">
                      <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: color }} />
                    </div>
                    <div className="text-xs text-[#8d8d8d]">Weight: {d.weight}%</div>
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
          className="rounded-xl border border-[#0f62fe30] bg-[#0f62fe08] p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-[#f4f4f4] mb-3">
              Convene the Council on a New Decision
            </h2>
            <p className="text-base text-[#c6c6c6] max-w-lg leading-relaxed">
              Let 6 specialized agents debate the evidence from your repository and produce
              a committable ADR with a Decision Confidence Score.
            </p>
          </div>
          <button
            onClick={() => router.push("/council")}
            className="flex items-center gap-2.5 px-7 py-4 rounded-xl font-bold text-base whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#0f62fe", color: "#ffffff" }}
          >
            Open Council Chamber
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#262626] mt-24">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-sm text-[#8d8d8d]">QUORUM - Multi-Agent Architecture Tribunal</span>
          <span className="text-sm text-[#c6c6c6] font-mono tracking-wider">
            Powered by <span style={{ color: "#0f62fe" }}>IBM Bob</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
