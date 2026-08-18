"use client";

import { useEffect, useState } from "react";
import type { ThemeName } from "./theme-colors";

export function useTheme(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.classList.contains("dark") ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
