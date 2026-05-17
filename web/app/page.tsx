"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GitCommit, FileText, RotateCcw, Shield, ArrowRight, Clock } from "lucide-react";
import { Nav } from "@/components/nav";
import { HealthGauge } from "@/components/health-gauge";
import { HealthDimensions } from "@/components/health-dimensions";
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

const CAPABILITIES = [
  {
    icon: "tribunal",
    title: "7-Agent Tribunal",
    description: "Conservative, Reformer, Historian, Economist, Risk Officer, Engineer, and Judge debate your architecture decision with adversarial stances, producing a Decision Confidence Score.",
    href: "/council",
    label: "Open Council",
    color: "#0f62fe",
  },
  {
    icon: "xam",
    title: "Adversarial Cross-Examination",
    description: "After Round 1, opposing agents confront each other's arguments in Round 2, forced to maintain, revise, or concede their positions. No consensus by committee.",
    href: "/council",
    label: "See Round 2",
    color: "#be95ff",
  },
  {
    icon: "timemachine",
    title: "Time Machine",
    description: "Predict what Quorum would have advised before a decision was made. Validated against the actual git commit record - every predicted concern confirmed or denied.",
    href: "/time-machine",
    label: "Run Analysis",
    color: "#42be65",
  },
];

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
      <Nav />

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

        {/* Capability Cards */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="rounded-xl border p-6 flex flex-col gap-4"
                style={{ borderColor: `${cap.color}30`, backgroundColor: `${cap.color}06` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${cap.color}20`, color: cap.color }}
                >
                  {cap.icon === "tribunal" ? "7" : cap.icon === "xam" ? "X" : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f4f4f4] mb-1.5">{cap.title}</h3>
                  <p className="text-sm text-[#8d8d8d] leading-relaxed">{cap.description}</p>
                </div>
                <button
                  onClick={() => router.push(cap.href)}
                  className="flex items-center gap-1.5 text-sm font-semibold mt-auto transition-opacity hover:opacity-80"
                  style={{ color: cap.color }}
                >
                  {cap.label}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Health Score */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
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
                    context="Changes later undone"
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

              {/* Health Dimensions (replaces radar) */}
              <div>
                <div className="text-sm font-semibold text-[#c6c6c6] mb-5 uppercase tracking-wider">
                  Health Dimensions
                </div>
                {health ? (
                  <HealthDimensions dimensions={health.dimensions} />
                ) : (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-[#393939] rounded-lg animate-pulse" />
                    ))}
                  </div>
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
              <p className="text-sm text-[#8d8d8d] mt-1">Decisions produced by the Quorum Council</p>
            </div>
            <span className="text-sm font-mono text-[#8d8d8d] bg-[#262626] border border-[#393939] px-4 py-2 rounded-lg">
              {adrs.filter((a) => a.status !== "SUPERSEDED").length} active
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
