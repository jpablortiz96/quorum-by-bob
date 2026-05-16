"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
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

export function HealthRadar({ dimensions }: HealthRadarProps) {
  const data = [
    { subject: "Decision Quality", value: dimensions.decisionQuality, fullMark: 100 },
    { subject: "Tribal Knowledge Risk", value: dimensions.tribalKnowledgeRisk, fullMark: 100 },
    { subject: "Reverted Decisions", value: dimensions.revertedDecisions, fullMark: 100 },
    { subject: "Tribunal Coverage", value: dimensions.tribunalCoverage, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#262626" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#a3a3a3", fontSize: 11 }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#d4af37"
          fill="#d4af37"
          fillOpacity={0.15}
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
