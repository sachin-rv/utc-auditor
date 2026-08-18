"use client";

import type { CoverageMetrics } from "@/lib/types";
import { useTheme } from "@/lib/useTheme";
import { THEME_COLORS, type ThemeName } from "@/lib/theme-colors";

type ThemePalette = (typeof THEME_COLORS)[ThemeName];

function bandColor(v: number, c: ThemePalette) {
  if (v < 60) return c.fail;
  if (v < 80) return c.warn;
  if (v < 90) return c.info;
  return c.pass;
}

const LABELS: { key: keyof CoverageMetrics; label: string }[] = [
  { key: "statements", label: "Statements" },
  { key: "branches", label: "Branches" },
  { key: "functions", label: "Functions" },
  { key: "lines", label: "Lines" },
];

export default function CoverageBars({ coverage }: { coverage: CoverageMetrics }) {
  const theme = useTheme();
  const c = THEME_COLORS[theme];

  return (
    <div className="space-y-3">
      {LABELS.map(({ key, label }) => {
        const v = coverage[key];
        const color = bandColor(v, c);
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-mist uppercase tracking-wider">{label}</span>
              <span className="font-mono tabular-nums" style={{ color }}>
                {v}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${v}%`, backgroundColor: color, transition: "width 500ms ease" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
