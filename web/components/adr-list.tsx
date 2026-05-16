"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ChevronRight } from "lucide-react";
import type { ADR } from "@/types/quorum";

interface ADRListProps {
  adrs: ADR[];
}

function DCSBar({ score }: { score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#262626] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "PROCEED": "#10b981",
    "PROCEED WITH CONDITIONS": "#f59e0b",
    "Accepted with Conditions": "#f59e0b",
    "DEFER": "#ef4444",
    "DO NOT PROCEED": "#ef4444",
  };
  const color = colors[status] ?? "#8d8d8d";
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ backgroundColor: `${color}20`, color }}
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
        className="relative bg-[#262626] border border-[#262626] rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col z-10"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div>
            <h3 className="text-lg font-semibold text-[#f4f4f4]">{adr.id}</h3>
            <p className="text-sm text-[#c6c6c6]">{adr.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/download/${adr.id}`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0f62fe20] text-[#78a9ff] hover:bg-[#0f62fe30] transition-colors"
            >
              <Download className="w-3 h-3" />
              Download ADR
            </a>
            <button
              onClick={onClose}
              className="text-[#8d8d8d] hover:text-[#f4f4f4] transition-colors px-2"
            >
              âœ•
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

export function ADRList({ adrs }: ADRListProps) {
  const [selectedADR, setSelectedADR] = useState<ADR | null>(null);

  if (adrs.length === 0) {
    return (
      <div className="text-center py-12 text-[#8d8d8d] text-sm">
        No ADRs found in docs/decisions/
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[#262626]">
              {["ID", "Title", "Status", "DCS", "Date", "Actions"].map((h) => (
                <th key={h} className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#8d8d8d]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {adrs.map((adr) => (
              <tr key={adr.id} className="group hover:bg-[#262626] transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-mono text-xs text-[#78a9ff]">{adr.id}</span>
                </td>
                <td className="py-3 pr-4 max-w-xs">
                  <span className="text-[#f4f4f4] text-sm">{adr.title}</span>
                </td>
                <td className="py-3 pr-4">
                  <StatusChip status={adr.status} />
                </td>
                <td className="py-3 pr-4">
                  <DCSBar score={adr.dcs} />
                </td>
                <td className="py-3 pr-4 text-[#8d8d8d] text-xs font-mono whitespace-nowrap">
                  {adr.date}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => setSelectedADR(adr)}
                    className="flex items-center gap-1 text-xs text-[#c6c6c6] hover:text-[#f4f4f4] transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Review
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedADR && (
        <ADRModal adr={selectedADR} onClose={() => setSelectedADR(null)} />
      )}
    </>
  );
}
