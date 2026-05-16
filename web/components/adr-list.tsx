"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, ChevronRight, ChevronDown, Clock } from "lucide-react";
import type { ADR } from "@/types/quorum";

interface ADRListProps {
  adrs: ADR[];
}

function DCSBar({ score }: { score: number }) {
  const color = score >= 70 ? "#42be65" : score >= 60 ? "#f1c21b" : "#fa4d56";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#393939] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const STATUS_MAP: Record<string, { bg: string; fg: string }> = {
    "PROCEED": { bg: "#42be6520", fg: "#42be65" },
    "PROCEED WITH CONDITIONS": { bg: "#f1c21b20", fg: "#f1c21b" },
    "Accepted with Conditions": { bg: "#f1c21b20", fg: "#f1c21b" },
    "DEFER": { bg: "#fa4d5620", fg: "#fa4d56" },
    "DO NOT PROCEED": { bg: "#fa4d5620", fg: "#fa4d56" },
    "SUPERSEDED": { bg: "#8d8d8d20", fg: "#8d8d8d" },
    "Accepted (Retrospective)": { bg: "#be95ff20", fg: "#be95ff" },
  };
  const s = STATUS_MAP[status] ?? { bg: "#8d8d8d20", fg: "#8d8d8d" };
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.fg, border: `1px solid ${s.fg}40` }}
    >
      {status}
    </span>
  );
}

function ADRModal({ adr, onClose }: { adr: ADR; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        className="relative bg-[#262626] border border-[#393939] rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col z-10"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#393939]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-[#78a9ff]">{adr.id}</span>
              <StatusChip status={adr.status} />
            </div>
            <p className="text-base font-semibold text-[#f4f4f4]">{adr.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/download/${adr.id}`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0f62fe20] text-[#78a9ff] hover:bg-[#0f62fe30] transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
            <button
              onClick={onClose}
              className="text-[#8d8d8d] hover:text-[#f4f4f4] transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#393939]"
            >
              X
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-6">
          <pre className="text-xs text-[#c6c6c6] font-mono whitespace-pre-wrap leading-relaxed">
            {adr.content}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ADRRow({ adr, onSelect }: { adr: ADR; onSelect: (a: ADR) => void }) {
  return (
    <tr className="group hover:bg-[#393939]/40 transition-colors cursor-pointer" onClick={() => onSelect(adr)}>
      <td className="py-4 pr-4">
        <span className="font-mono text-sm font-semibold text-[#78a9ff]">{adr.id}</span>
      </td>
      <td className="py-4 pr-4 max-w-xs">
        <span className="text-sm font-medium text-[#f4f4f4]">{adr.title}</span>
      </td>
      <td className="py-4 pr-4">
        <StatusChip status={adr.status} />
      </td>
      <td className="py-4 pr-4">
        <DCSBar score={adr.dcs} />
      </td>
      <td className="py-4 pr-4 text-[#8d8d8d] text-xs font-mono whitespace-nowrap">
        {adr.date}
      </td>
      <td className="py-4">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(adr); }}
          className="flex items-center gap-1 text-xs text-[#c6c6c6] hover:text-[#f4f4f4] transition-colors"
        >
          <FileText className="w-3 h-3" />
          Review
          <ChevronRight className="w-3 h-3" />
        </button>
      </td>
    </tr>
  );
}

const TABLE_HEADERS = ["ID", "Title", "Status", "DCS", "Date", ""];

export function ADRList({ adrs }: ADRListProps) {
  const [selectedADR, setSelectedADR] = useState<ADR | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const activeADRs = adrs.filter((a) => a.status !== "SUPERSEDED");
  const supersededADRs = adrs.filter((a) => a.status === "SUPERSEDED");

  if (adrs.length === 0) {
    return (
      <div className="text-center py-12 text-[#8d8d8d] text-sm">
        No ADRs found in docs/decisions/
      </div>
    );
  }

  return (
    <>
      {/* Active ADRs */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#393939]">
              {TABLE_HEADERS.map((h, i) => (
                <th key={i} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-[#8d8d8d]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#393939]">
            {activeADRs.map((adr) => (
              <ADRRow key={adr.file} adr={adr} onSelect={setSelectedADR} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Version history (collapsed by default) */}
      {supersededADRs.length > 0 && (
        <div className="mt-4 border-t border-[#393939] pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs text-[#8d8d8d] hover:text-[#c6c6c6] transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            Version History ({supersededADRs.length} superseded)
            {showHistory ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 overflow-x-auto opacity-60">
                  <table className="w-full">
                    <tbody className="divide-y divide-[#393939]">
                      {supersededADRs.map((adr) => (
                        <ADRRow key={adr.file} adr={adr} onSelect={setSelectedADR} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedADR && (
          <ADRModal adr={selectedADR} onClose={() => setSelectedADR(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
