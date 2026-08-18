import type { CoverageMetrics } from "@/lib/types";

function bandColor(v: number) {
  if (v < 60) return "#FF6B5E";
  if (v < 80) return "#F5B942";
  if (v < 90) return "#5FA8FF";
  return "#3ED598";
}

const LABELS: { key: keyof CoverageMetrics; label: string }[] = [
  { key: "statements", label: "Statements" },
  { key: "branches", label: "Branches" },
  { key: "functions", label: "Functions" },
  { key: "lines", label: "Lines" },
];

export default function CoverageBars({ coverage }: { coverage: CoverageMetrics }) {
  return (
    <div className="space-y-3">
      {LABELS.map(({ key, label }) => {
        const v = coverage[key];
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-mist uppercase tracking-wider">{label}</span>
              <span className="font-mono tabular-nums" style={{ color: bandColor(v) }}>
                {v}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${v}%`, backgroundColor: bandColor(v), transition: "width 500ms ease" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
