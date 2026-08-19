"use client";

import { useTheme } from "@/lib/useTheme";
import { THEME_COLORS } from "@/lib/theme-colors";

function bandColor(v: number, c: typeof THEME_COLORS["dark"]) {
  if (v < 60) return c.fail;
  if (v < 80) return c.warn;
  if (v < 90) return c.info;
  return c.pass;
}

export default function ScoreBarList({ items }: { items: { label: string; value: number }[] }) {
  const theme = useTheme();
  const c = THEME_COLORS[theme];

  return (
    <div className="space-y-3">
      {items.map(({ label, value }) => {
        const color = bandColor(value, c);
        return (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-mist uppercase tracking-wider">{label}</span>
              <span className="font-mono tabular-nums" style={{ color }}>
                {value}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color, transition: "width 500ms ease" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
