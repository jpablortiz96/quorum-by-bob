"use client";

import { motion } from "framer-motion";

interface HealthDimensionsProps {
  dimensions: {
    decisionQuality: number;
    tribalKnowledgeRisk: number;
    revertedDecisions: number;
    tribunalCoverage: number;
  };
}

const DIMS = [
  {
    key: "decisionQuality" as const,
    label: "Decision Quality",
    type: "good",
    description: "higher = better",
  },
  {
    key: "tribalKnowledgeRisk" as const,
    label: "Tribal Knowledge Risk",
    type: "risk",
    description: "higher = worse",
  },
  {
    key: "revertedDecisions" as const,
    label: "Reverted Decisions",
    type: "risk",
    description: "higher = worse",
  },
  {
    key: "tribunalCoverage" as const,
    label: "Tribunal Coverage",
    type: "good",
    description: "higher = better",
  },
];

export function HealthDimensions({ dimensions }: HealthDimensionsProps) {
  return (
    <div className="space-y-5">
      {DIMS.map((dim, i) => {
        const value = dimensions[dim.key];
        const color = dim.type === "good" ? "#0f62fe" : "#fa4d56";
        return (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#c6c6c6] font-medium">{dim.label}</span>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#6f6f6f] font-mono">{dim.description}</span>
                <span
                  className="text-lg font-bold tabular-nums w-9 text-right"
                  style={{ color }}
                >
                  {value}
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#393939] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.9, delay: i * 0.1 + 0.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
