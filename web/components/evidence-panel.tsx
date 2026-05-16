"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Citation } from "@/types/quorum";

const KNOWN_COMMITS: Record<string, { date: string; author: string; message: string }> = {
  aba26aa: { date: "2026-04-10", author: "Maximilian Jesch", message: "added java service. But it is not visibile in the frontend" },
  "10d8576": { date: "2026-04-13", author: "Maximilian Jesch", message: "feat(inventory_hold_service): integrate quote and hold workflow with frontend" },
  "8f7ad7f": { date: "2026-04-16", author: "MaxJ", message: "Merge pull request #9 from IBM/inventory_hold_service" },
  "59f9b46": { date: "2026-04-20", author: "Maximilian Jesch", message: "Renaming the holding service." },
  "4156ec0": { date: "2026-04-23", author: "Maximilian Jesch", message: "feat: Add checkout add-ons feature (Issue #33)" },
};

interface EvidencePanelProps {
  citation: Citation | null;
}

export function EvidencePanel({ citation }: EvidencePanelProps) {
  const commit = citation?.hash ? (KNOWN_COMMITS[citation.hash] ?? null) : null;

  return (
    <div className="sticky top-6 w-64 flex-shrink-0">
      <div className="text-xs font-semibold uppercase tracking-widest text-[#737373] mb-3">
        Evidence
      </div>
      <AnimatePresence mode="wait">
        {citation && commit ? (
          <motion.div
            key={citation.hash}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-lg border border-[#262626] bg-[#141414] p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#d4af37] bg-[#d4af3715] px-1.5 py-0.5 rounded">
                {citation.hash}
              </span>
            </div>
            <div className="text-xs text-[#737373]">{commit.date}</div>
            <div className="text-xs text-[#a3a3a3]">{commit.author}</div>
            <p className="text-xs text-[#fafafa] leading-relaxed italic">
              &ldquo;{commit.message}&rdquo;
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-dashed border-[#262626] bg-[#0a0a0a] p-4 text-xs text-[#737373] text-center"
          >
            Commit references will appear here as agents cite evidence
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
