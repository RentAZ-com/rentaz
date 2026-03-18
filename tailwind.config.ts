import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0F172A", light: "#1E293B", dark: "#020617" },
        accent: { DEFAULT: "#F97316", light: "#FB923C", dark: "#EA580C" },
        surface: { DEFAULT: "#F8FAFC", muted: "#F1F5F9", border: "#E2E8F0" },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
