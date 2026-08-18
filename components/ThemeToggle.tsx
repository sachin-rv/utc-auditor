"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "utc-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const preferred =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(preferred);
    applyTheme(preferred);
    setMounted(true);
  }, []);

  function handleToggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-2.5 py-1.5 text-[11px] font-medium text-chalk shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-signal-pass/40"
    >
      <span className="relative flex h-6 w-11 items-center rounded-full bg-panel2/90 p-1 transition-colors duration-300">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-signal-pass text-[9px] shadow-md transition-all duration-300 ${
            theme === "dark" ? "translate-x-0" : "translate-x-5"
          }`}
        >
          {mounted && (theme === "dark" ? "☀" : "☾")}
        </span>
      </span>
      <span className="min-w-12 text-left">{mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}</span>
    </button>
  );
}
