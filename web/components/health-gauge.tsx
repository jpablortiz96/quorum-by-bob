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

export function HealthGauge({ score, size = 200, label = "Health Score" }: HealthGaugeProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const sw = 20; // stroke width
  const r = (size - sw * 2) / 2; // radius (leaves room for stroke on both sides)
  const cx = size / 2;
  const cy = size / 2; // arc endpoints sit at this Y

  // sweep-flag=1: positive angle, θ goes 180°→270°→360°.
  // At θ=270°: y = cy + r·sin(270°) = cy − r  →  the TOP of the arc.
  // This is the correct upward-opening semicircle for a gauge.
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const circ = Math.PI * r;
  const offset = circ * (1 - displayed / 100);
  const color = getColor(score);

  // svgH covers from y=0 down to the arc endpoints (cy) plus half-stroke below
  const svgH = cy + sw / 2 + 2;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={svgH}
        viewBox={`0 0 ${size} ${svgH}`}
        style={{ overflow: "visible" }} // prevents stroke clipping at top
      >
        {/* Track — #393939 is visible against the #262626 card background */}
        <path d={arc} fill="none" stroke="#393939" strokeWidth={sw} strokeLinecap="round" />

        {/* Progress — animates from empty (offset=circ) to filled */}
        <motion.path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      {/* Score number — slightly overlaps the arc base for visual cohesion */}
      <div className="flex flex-col items-center -mt-2">
        <motion.span
          className="font-bold tabular-nums leading-none"
          style={{ color, fontSize: Math.round(size * 0.3) }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
        >
          {Math.round(displayed)}
        </motion.span>
        <span className="text-sm mt-1" style={{ color: "#6f6f6f" }}>/ 100</span>
      </div>

      {/* Status badge */}
      <motion.span
        className="text-xs font-bold uppercase px-3 py-1.5 rounded-full mt-3"
        style={{
          color,
          backgroundColor: `${color}1a`,
          border: `1px solid ${color}55`,
          letterSpacing: "0.12em",
        }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        {getStatusLabel(score)}
      </motion.span>

      <span
        className="text-xs font-medium uppercase mt-2"
        style={{ color: "#6f6f6f", letterSpacing: "0.1em" }}
      >
        {label}
      </span>
    </div>
  );
}
