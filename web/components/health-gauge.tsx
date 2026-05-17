"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface HealthGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

function getColor(score: number): string {
  if (score >= 70) return "#42be65";
  if (score >= 40) return "#f1c21b";
  return "#fa4d56";
}

function getStatusLabel(score: number): string {
  if (score >= 70) return "HEALTHY";
  if (score >= 40) return "AT RISK";
  return "CRITICAL";
}

export function HealthGauge({ score, size = 180, label = "Health Score" }: HealthGaugeProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeW = 14;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const svgH = size / 2 + strokeW / 2 + 6;

  // Counterclockwise sweep (0 0 0) draws arc going UP — correct for a gauge
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
  const circumference = Math.PI * r;
  const pct = displayed / 100;
  const strokeDashoffset = circumference * (1 - pct);
  const color = getColor(score);
  const statusLabel = getStatusLabel(score);

  return (
    <div className="flex flex-col items-center gap-0">
      <svg width={size} height={svgH} viewBox={`0 0 ${size} ${svgH}`}>
        {/* Track arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="#393939"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      <div className="flex flex-col items-center -mt-1">
        <motion.span
          className="font-bold tabular-nums leading-none"
          style={{ color, fontSize: Math.round(size * 0.28) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round(displayed)}
        </motion.span>
        <span className="text-sm text-[#8d8d8d] mt-0.5">/ 100</span>
        <motion.span
          className="text-xs font-semibold uppercase tracking-widest mt-2 px-3 py-1 rounded-full"
          style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {statusLabel}
        </motion.span>
      </div>

      <span className="text-xs font-medium text-[#c6c6c6] uppercase tracking-widest mt-3">{label}</span>
    </div>
  );
}
