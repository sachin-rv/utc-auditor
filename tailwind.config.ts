import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        panel2: "rgb(var(--c-panel2) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        mist: "rgb(var(--c-mist) / <alpha-value>)",
        chalk: "rgb(var(--c-chalk) / <alpha-value>)",
        onaccent: "rgb(var(--c-onaccent) / <alpha-value>)",
        signal: {
          pass: "rgb(var(--c-pass) / <alpha-value>)",
          fail: "rgb(var(--c-fail) / <alpha-value>)",
          warn: "rgb(var(--c-warn) / <alpha-value>)",
          info: "rgb(var(--c-info) / <alpha-value>)",
          high: "rgb(var(--c-high) / <alpha-value>)"
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
