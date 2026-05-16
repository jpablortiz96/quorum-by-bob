"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HealthRadarProps {
  dimensions: {
    decisionQuality: number;
    tribalKnowledgeRisk: number;
    revertedDecisions: number;
    tribunalCoverage: number;
  };
}

const DESCRIPTIONS: Record<string, string> = {
  "Decision Quality": "Ratio of accepted decisions to total decisions made",
  "Tribal Risk": "Critical knowledge trapped only in commit history",
  "Reverted": "Percentage of decisions later reversed",
  "Coverage": "Major changes with a formal council decision",
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; value: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#161616] border border-[#393939] rounded-lg p-3 text-xs max-w-[180px] shadow-lg">
      <p className="font-semibold text-[#f4f4f4] mb-1">{d.subject}</p>
      <p className="text-[#78a9ff] font-mono text-base font-bold">{d.value}<span className="text-[#8d8d8d] text-xs">/100</span></p>
      <p className="text-[#8d8d8d] mt-1.5 leading-relaxed">{DESCRIPTIONS[d.subject] ?? ""}</p>
    </div>
  );
}

export function HealthRadar({ dimensions }: HealthRadarProps) {
  const data = [
    { subject: "Decision Quality", value: dimensions.decisionQuality, fullMark: 100 },
    { subject: "Tribal Risk", value: dimensions.tribalKnowledgeRisk, fullMark: 100 },
    { subject: "Reverted", value: dimensions.revertedDecisions, fullMark: 100 },
    { subject: "Coverage", value: dimensions.tribunalCoverage, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 24, right: 48, bottom: 24, left: 48 }}>
        <PolarGrid stroke="#393939" strokeWidth={1} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#f4f4f4", fontSize: 13, fontWeight: 500 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#0f62fe"
          fill="#0f62fe"
          fillOpacity={0.25}
          strokeWidth={2}
          label={{ fill: "#78a9ff", fontSize: 12, fontWeight: "bold" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
