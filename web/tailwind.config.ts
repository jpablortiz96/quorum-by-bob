import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        elevated: "#141414",
        border: "#262626",
        "border-subtle": "#1f1f1f",
        primary: "#fafafa",
        secondary: "#a3a3a3",
        muted: "#737373",
        gold: "#d4af37",
        conservative: "#3b82f6",
        reformer: "#ef4444",
        historian: "#a78bfa",
        economist: "#10b981",
        "risk-officer": "#f59e0b",
        engineer: "#06b6d4",
        judge: "#d4af37",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-blue": "glowBlue 2s ease-in-out infinite alternate",
        "ticker": "ticker 1.2s ease-out forwards",
      },
      keyframes: {
        glowBlue: {
          "0%": { boxShadow: "0 0 5px rgba(59,130,246,0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(59,130,246,0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
