"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DCSGaugeProps {
  target: number;
  animate?: boolean;
  size?: number;
}

function getColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#ef4444";
  return "#737373";
}

function getVerdict(score: number): string {
  if (score >= 80) return "PROCEED";
  if (score >= 60) return "PROCEED WITH CONDITIONS";
  if (score >= 40) return "DEFER";
  return "DO NOT PROCEED";
}

export function DCSGauge({ target, animate = false, size = 240 }: DCSGaugeProps) {
  const [current, setCurrent] = useState(animate ? 0 : target);

  useEffect(() => {
    if (!animate) { setCurrent(target); return; }
    let start = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(interval); return; }
      setCurrent(Math.round(start * 10) / 10);
    }, 33);
    return () => clearInterval(interval);
  }, [animate, target]);

  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius;
  const pct = current / 100;
  const strokeDashoffset = circumference * (1 - pct);
  const color = getColor(target);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
          <path
            d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <motion.path
            d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span className="font-bold tabular-nums" style={{ color, fontSize: size * 0.22 }}>
            {animate ? current.toFixed(1) : target.toFixed(1)}
          </span>
          <span className="text-sm text-[#737373]">/ 100 DCS</span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {getVerdict(target)}
      </div>
    </div>
  );
}
