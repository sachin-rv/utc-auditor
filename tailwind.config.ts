import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        panel: "var(--color-panel)",
        panel2: "var(--color-panel-2)",
        line: "var(--color-line)",
        mist: "var(--color-mist)",
        chalk: "var(--color-chalk)",
        signal: {
          pass: "#3ED598",
          fail: "#FF6B5E",
          warn: "#F5B942",
          info: "#5FA8FF"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      }
    }
  },
  plugins: []
};
export default config;
