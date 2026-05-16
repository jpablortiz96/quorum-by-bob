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
        // IBM Carbon Dark palette
        background:     "#161616",  // gray-100
        elevated:       "#262626",  // gray-90
        border:         "#393939",  // gray-80
        "border-subtle":"#262626",  // gray-90
        primary:        "#f4f4f4",  // gray-10
        secondary:      "#c6c6c6",  // gray-30
        muted:          "#8d8d8d",  // gray-50

        // IBM Blue
        "ibm-blue":     "#0f62fe",  // blue-60
        "ibm-blue-hover":"#0043ce", // blue-70
        "ibm-blue-light":"#78a9ff", // blue-40

        // Carbon support colors
        "carbon-error":   "#fa4d56",
        "carbon-warning": "#f1c21b",
        "carbon-success": "#42be65",

        // Agent colors — Carbon-spectrum
        conservative: "#4589ff",  // Carbon blue-50
        reformer:     "#fa4d56",  // Carbon red-50
        historian:    "#8a3ffc",  // Carbon purple-60
        economist:    "#42be65",  // Carbon green-50
        "risk-officer":"#f1c21b", // Carbon yellow-30
        engineer:     "#08bdba",  // Carbon teal-40
        judge:        "#d4bbff",  // Carbon purple-30

        // Oracle
        oracle:       "#be95ff",  // Carbon purple-40
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
