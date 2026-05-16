"use client";

import type { AgentSlug, AgentStatus } from "@/types/quorum";
import { cn } from "@/lib/utils";

const AGENT_COLORS: Record<AgentSlug, string> = {
  conservative: "#3b82f6",
  reformer: "#ef4444",
  historian: "#a78bfa",
  economist: "#10b981",
  "risk-officer": "#f59e0b",
  engineer: "#06b6d4",
  judge: "#d4af37",
};

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6L10 16v16c0 13 9.6 25.1 22 28 12.4-2.9 22-15 22-28V16L32 6z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
      <path d="M24 32l6 6 10-12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8c0 0-14 12-14 24a14 14 0 0028 0C46 20 32 8 32 8z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
      <path d="M32 28c0 0-6 5-6 10a6 6 0 0012 0C38 33 32 28 32 28z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

function ScrollIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="36" height="36" rx="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
      <path d="M22 24h20M22 32h20M22 40h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14c0-2.2 1.8-4 4-4s4 1.8 4 4v36c0 2.2-1.8 4-4 4s-4-1.8-4-4V14z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
    </svg>
  );
}

function ScalesIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="12" x2="32" y2="52" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="20" x2="50" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 20l-6 12h12z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <path d="M50 20l-6 12h12z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <rect x="24" y="50" width="16" height="3" rx="1.5" fill={color} />
    </svg>
  );
}

function WarningIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 10L6 54h52L32 10z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" strokeLinejoin="round" />
      <line x1="32" y1="28" x2="32" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="47" r="2" fill={color} />
    </svg>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="8" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
      <path d="M32 8v6M32 50v6M8 32h6M50 32h6M16 16l4 4M44 44l4 4M16 48l4-4M44 20l4-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="14" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  );
}

function GavelIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="8" width="22" height="14" rx="3" transform="rotate(45 28 8)" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
      <line x1="22" y1="42" x2="42" y2="22" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="52" x2="26" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="56" x2="28" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<AgentSlug, React.ComponentType<{ color: string }>> = {
  conservative: ShieldIcon,
  reformer: FlameIcon,
  historian: ScrollIcon,
  economist: ScalesIcon,
  "risk-officer": WarningIcon,
  engineer: GearIcon,
  judge: GavelIcon,
};

interface AgentAvatarProps {
  slug: AgentSlug;
  status?: AgentStatus;
  size?: number;
}

export function AgentAvatar({ slug, status = "idle", size = 64 }: AgentAvatarProps) {
  const color = AGENT_COLORS[slug];
  const Icon = ICONS[slug];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0",
        status === "thinking" && "animate-pulse",
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}15`,
        border: status === "speaking" ? `2px solid ${color}` : `1px solid ${color}40`,
        boxShadow: status === "speaking" ? `0 0 24px ${color}60, 0 0 8px ${color}40` : "none",
        outline: "none",
      }}
    >
      <div style={{ width: size * 0.65, height: size * 0.65 }}>
        <Icon color={color} />
      </div>
    </div>
  );
}
