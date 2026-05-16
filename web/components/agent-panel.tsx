"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AgentAvatar } from "./agent-avatar";
import { AGENT_MAP } from "@/lib/agents";
import type { AgentSlug, AgentStatus } from "@/types/quorum";
import { cn } from "@/lib/utils";

interface AgentPanelProps {
  slug: AgentSlug;
  status: AgentStatus;
  content: string;
  typedContent: string;
  stance?: string;
  isJudge?: boolean;
}

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Standing by",
  thinking: "Analyzing evidence...",
  speaking: "Presenting argument",
  done: "Argument complete",
};

export function AgentPanel({
  slug,
  status,
  content,
  typedContent,
  stance,
  isJudge = false,
}: AgentPanelProps) {
  const agent = AGENT_MAP[slug];
  if (!agent) return null;

  const color = agent.color;
  const isActive = status === "thinking" || status === "speaking";

  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border p-4 flex flex-col gap-3 transition-all duration-500 overflow-hidden",
        isJudge ? "min-h-[200px]" : "min-h-[160px]",
        status === "done" && "opacity-60",
      )}
      style={{
        backgroundColor: isActive ? `${color}08` : "#262626",
        borderColor: isActive ? `${color}60` : "#262626",
        boxShadow: isActive ? `0 0 20px ${color}25` : "none",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <AgentAvatar slug={slug} status={status} size={isJudge ? 52 : 40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#f4f4f4] truncate">{agent.name}</span>
            <StatusBadge status={status} color={color} />
          </div>
          <span className="text-xs text-[#8d8d8d]">{agent.role}</span>
          {stance && status !== "idle" && (
            <div
              className="mt-1 text-xs px-2 py-0.5 rounded inline-block font-mono truncate max-w-full"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {stance.length > 60 ? stance.slice(0, 57) + "..." : stance}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {(status === "speaking" || status === "done") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-[#c6c6c6] leading-relaxed overflow-hidden"
            style={{ maxHeight: isJudge ? "none" : "120px" }}
          >
            <TypewriterText text={typedContent || content} isTyping={status === "speaking"} />
          </motion.div>
        )}
        {status === "thinking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-[#8d8d8d]"
          >
            <ThinkingDots color={color} />
            <span>{STATUS_LABELS.thinking}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusBadge({ status, color }: { status: AgentStatus; color: string }) {
  const styles: Record<AgentStatus, string> = {
    idle: "bg-[#262626] text-[#8d8d8d]",
    thinking: "text-white",
    speaking: "text-white",
    done: "bg-[#262626] text-[#8d8d8d]",
  };
  return (
    <span
      className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider", styles[status])}
      style={
        status === "thinking" || status === "speaking"
          ? { backgroundColor: `${color}30`, color }
          : undefined
      }
    >
      {status}
    </span>
  );
}

function ThinkingDots({ color }: { color: string }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function TypewriterText({ text, isTyping }: { text: string; isTyping: boolean }) {
  const displayText = text.slice(0, 400);
  return (
    <span>
      {displayText}
      {text.length > 400 && !isTyping && "..."}
      {isTyping && (
        <motion.span
          className="inline-block w-0.5 h-3 bg-current ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  );
}
