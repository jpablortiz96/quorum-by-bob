"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface HealthGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

function getColor(score: number): string {
  if (score >= 70) return "#42be65"; // Carbon green-50
  if (score >= 50) return "#f1c21b"; // Carbon yellow-30
  return "#fa4d56";                  // Carbon red-50
}

export function HealthGauge({ score, size = 180, label = "Health Score" }: HealthGaugeProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const pct = displayed / 100;
  const strokeDashoffset = circumference * (1 - pct);
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background arc */}
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="#262626"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Animated fill arc */}
          <motion.path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
          <motion.span
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {Math.round(displayed)}
          </motion.span>
          <span className="text-xs text-[#8d8d8d] mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-[#c6c6c6] uppercase tracking-widest">{label}</span>
    </div>
  );
}
