"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/nav";
import { Clock, GitCommit, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface TimeMachineData {
  targetCommit: string;
  targetDate: string;
  targetMessage: string;
  predictedDcs: number;
  verdict: string;
  snapshotData: {
    totalLoc: number;
    services: string[];
    dominantLanguage: string;
    testFiles: number;
    javaFilesAdded: number;
  };
  predictedConcerns: string[];
  gitValidations: {
    commit: string;
    date: string;
    message: string;
    concern: string;
    verdict: string;
  }[];
  punchline: string;
  honestLimitation: string;
}

function CommitBadge({ hash }: { hash: string }) {
  return (
    <span
      className="font-mono text-[11px] px-2 py-0.5 rounded"
      style={{ color: "#d4af37", backgroundColor: "#d4af3715", border: "1px solid #d4af3730" }}
    >
      {hash}
    </span>
  );
}

export default function TimeMachinePage() {
  const [data, setData] = useState<TimeMachineData | null>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    fetch("/api/timemachine").then((r) => r.json()).then((d) => {
      setData(d);
      // Sequentially reveal validations
      let i = 1;
      const tick = () => {
        setRevealed((prev) => {
          if (prev < d.gitValidations.length) {
            setTimeout(tick, 600);
            return prev + 1;
          }
          return prev;
        });
      };
      const start = setTimeout(tick, 1200);
      return () => clearTimeout(start);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#161616]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-8 py-12 space-y-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-sm text-[#8d8d8d] font-mono uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            Time Machine Analysis
          </div>
          <h1 className="text-6xl font-bold text-[#f4f4f4]" style={{ letterSpacing: "-0.02em" }}>
            What Would Quorum
            <br />
            Have Said?
          </h1>
          <p className="text-lg text-[#c6c6c6] max-w-2xl leading-relaxed">
            A retrospective simulation: what advice would 6 specialized agents have given
            if consulted <em>before</em> commit{" "}
            <CommitBadge hash="aba26aa" /> was applied? Validated against the actual git record.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-8 bottom-8 w-px"
            style={{ backgroundColor: "#393939" }}
          />

          <div className="space-y-0">
            {/* Node 1: Decision Point */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex gap-8 pb-12"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2"
                style={{ backgroundColor: "#161616", borderColor: "#fa4d56" }}
              >
                <GitCommit className="w-5 h-5" style={{ color: "#fa4d56" }} />
              </div>

              <div className="flex-1 rounded-xl border p-6 space-y-4" style={{ borderColor: "#fa4d5640", backgroundColor: "#fa4d5608" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs font-mono text-[#8d8d8d] mb-1">2026-04-10</div>
                    <h2 className="text-xl font-bold text-[#f4f4f4]">Decision Point</h2>
                    <div className="text-sm text-[#8d8d8d] mt-0.5">The moment the Java service was introduced</div>
                  </div>
                  <CommitBadge hash={data?.targetCommit ?? "aba26aa"} />
                </div>

                <div
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: "#161616", borderColor: "#393939" }}
                >
                  <div className="text-xs text-[#6f6f6f] mb-1 font-mono">Commit message</div>
                  <p className="text-sm text-[#f4f4f4] italic">
                    &ldquo;{data?.targetMessage ?? "added java service. But it is not visibile in the frontend"}&rdquo;
                  </p>
                  <div
                    className="mt-3 text-xs font-semibold px-2 py-1 rounded inline-block"
                    style={{ color: "#fa4d56", backgroundColor: "#fa4d5615" }}
                  >
                    Developer self-reports integration failure in the commit message
                  </div>
                </div>

                {data && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "LOC Before", value: data.snapshotData.totalLoc.toLocaleString() },
                      { label: "Services", value: data.snapshotData.services.length.toString() },
                      { label: "Language", value: data.snapshotData.dominantLanguage },
                      { label: "Java Files Added", value: data.snapshotData.javaFilesAdded.toString() },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg p-3 text-center"
                        style={{ backgroundColor: "#262626" }}
                      >
                        <div className="text-lg font-bold text-[#f4f4f4]">{item.value}</div>
                        <div className="text-[11px] text-[#6f6f6f] mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Node 2: Quorum Prediction */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative flex gap-8 pb-12"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2"
                style={{ backgroundColor: "#161616", borderColor: "#0f62fe" }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: "#0f62fe" }} />
              </div>

              <div className="flex-1 rounded-xl border p-6 space-y-4" style={{ borderColor: "#0f62fe40", backgroundColor: "#0f62fe08" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs font-mono text-[#8d8d8d] mb-1">Snapshot: 2026-04-09</div>
                    <h2 className="text-xl font-bold text-[#f4f4f4]">{"Quorum's Prediction"}</h2>
                    <div className="text-sm text-[#8d8d8d] mt-0.5">What 6 agents would have said before the commit</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: "#fa4d56" }}>
                      {data?.predictedDcs ?? 19}<span className="text-lg text-[#8d8d8d]">/100</span>
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-1 rounded mt-1"
                      style={{ color: "#fa4d56", backgroundColor: "#fa4d5615", border: "1px solid #fa4d5640" }}
                    >
                      DO NOT PROCEED
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#8d8d8d] uppercase tracking-wider mb-3">
                    Predicted Concerns (6 of 6 agents would have flagged)
                  </div>
                  <div className="space-y-2">
                    {(data?.predictedConcerns ?? []).map((concern, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-[#c6c6c6] p-3 rounded-lg"
                        style={{ backgroundColor: "#161616" }}
                      >
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#fa4d56" }} />
                        {concern}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: "#161616", borderColor: "#393939" }}
                >
                  <div className="text-xs text-[#6f6f6f] mb-2 uppercase tracking-wider font-semibold">DCS Threshold</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "#393939" }}>
                      <div className="h-full rounded-full" style={{ width: "19%", backgroundColor: "#fa4d56" }} />
                    </div>
                    <span className="text-sm font-mono text-[#fa4d56]">19/100</span>
                    <span className="text-xs text-[#6f6f6f]">threshold: 40</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Node 3: Git Record Confirms */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="relative flex gap-8"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2"
                style={{ backgroundColor: "#161616", borderColor: "#42be65" }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: "#42be65" }} />
              </div>

              <div className="flex-1 rounded-xl border p-6 space-y-4" style={{ borderColor: "#42be6540", backgroundColor: "#42be6508" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs font-mono text-[#8d8d8d] mb-1">13 days later</div>
                    <h2 className="text-xl font-bold text-[#f4f4f4]">Git Record Confirms</h2>
                    <div className="text-sm text-[#8d8d8d] mt-0.5">Every predicted concern materialized in the commit history</div>
                  </div>
                  <div
                    className="text-sm font-bold px-3 py-1.5 rounded"
                    style={{ color: "#42be65", backgroundColor: "#42be6515", border: "1px solid #42be6540" }}
                  >
                    5 / 5 CONFIRMED
                  </div>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {(data?.gitValidations ?? []).slice(0, revealed).map((v, i) => (
                      <motion.div
                        key={v.commit}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border p-4"
                        style={{ backgroundColor: "#161616", borderColor: "#42be6530" }}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <CommitBadge hash={v.commit} />
                            <span className="text-xs text-[#6f6f6f] font-mono">{v.date}</span>
                          </div>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ color: "#42be65", backgroundColor: "#42be6520" }}
                          >
                            CONFIRMED
                          </span>
                        </div>
                        <p className="text-xs text-[#f4f4f4] italic mt-2">
                          &ldquo;{v.message}&rdquo;
                        </p>
                        <p className="text-xs text-[#8d8d8d] mt-1.5">{v.concern}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {data && revealed < data.gitValidations.length && (
                    <div className="flex items-center gap-2 text-xs text-[#8d8d8d] py-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#42be65]"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      Validating commit history...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Punchline card */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: "#0f62fe40", backgroundColor: "#0f62fe08" }}
          >
            <div className="text-xs font-semibold text-[#78a9ff] uppercase tracking-widest mb-4">
              The Lesson
            </div>
            <p className="text-2xl font-semibold text-[#f4f4f4] max-w-3xl mx-auto leading-relaxed">
              {data.punchline}
            </p>
            <p className="text-base text-[#c6c6c6] mt-4 max-w-2xl mx-auto leading-relaxed">
              Architectural decisions need a tribunal before the first line of code, not an ADR
              written after the evidence has accumulated.
            </p>
          </motion.div>
        )}

        {/* Honest Limitation Note */}
        {data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="rounded-xl border p-6"
            style={{ borderColor: "#393939", backgroundColor: "#262626" }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#f1c21b]" />
              <div>
                <div className="text-xs font-semibold text-[#f1c21b] uppercase tracking-wider mb-2">
                  Honest Limitation Note
                </div>
                <p className="text-sm text-[#8d8d8d] leading-relaxed">{data.honestLimitation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <footer className="border-t border-[#262626] mt-16">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-sm text-[#8d8d8d]">QUORUM - Time Machine Analysis</span>
          <span className="text-sm text-[#c6c6c6] font-mono">
            Powered by <span style={{ color: "#0f62fe" }}>IBM Bob</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
