"use client";

import { useMemo, useState } from "react";
import type { ExternalFinding, ExternalSeverity } from "@/lib/externalReport";

const SEVERITY_ORDER: ExternalSeverity[] = ["error", "warning", "info"];

const SEVERITY_STYLE: Record<ExternalSeverity, string> = {
  error: "bg-signal-fail/15 text-signal-fail border-signal-fail/30",
  warning: "bg-signal-warn/15 text-signal-warn border-signal-warn/30",
  info: "bg-signal-info/15 text-signal-info border-signal-info/30",
};

export default function ExternalFindingsList({ findings }: { findings: ExternalFinding[] }) {
  const [activeSeverities, setActiveSeverities] = useState<Set<ExternalSeverity>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => [...new Set(findings.map((f) => f.category))].sort(),
    [findings]
  );

  const severityCounts = useMemo(() => {
    const c: Record<ExternalSeverity, number> = { error: 0, warning: 0, info: 0 };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const visible = useMemo(() => {
    let rows = findings;
    if (activeSeverities.size > 0) rows = rows.filter((f) => activeSeverities.has(f.severity));
    if (activeCategory) rows = rows.filter((f) => f.category === activeCategory);
    return rows;
  }, [findings, activeSeverities, activeCategory]);

  const byCategory = useMemo(() => {
    return visible.reduce<Record<string, ExternalFinding[]>>((acc, f) => {
      (acc[f.category] ??= []).push(f);
      return acc;
    }, {});
  }, [visible]);

  function toggleSeverity(s: ExternalSeverity) {
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function toggleCollapsed(category: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {SEVERITY_ORDER.filter((s) => severityCounts[s] > 0).map((s) => {
          const active = activeSeverities.has(s);
          return (
            <button
              key={s}
              onClick={() => toggleSeverity(s)}
              className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                active ? SEVERITY_STYLE[s] : "border-line text-mist hover:text-chalk hover:border-mist"
              }`}
            >
              {s} · {severityCounts[s]}
            </button>
          );
        })}
        {(activeSeverities.size > 0 || activeCategory) && (
          <button
            onClick={() => {
              setActiveSeverities(new Set());
              setActiveCategory(null);
            }}
            className="text-[11px] font-mono text-mist hover:text-chalk underline underline-offset-2 ml-1"
          >
            clear
          </button>
        )}
        <span className="text-[11px] font-mono text-mist ml-auto">
          {visible.length} of {findings.length} shown
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory((c) => (c === cat ? null : cat))}
            className={`text-[10px] font-mono px-2 py-1 rounded-full border transition-colors ${
              activeCategory === cat
                ? "border-signal-pass/40 text-signal-pass bg-signal-pass/10"
                : "border-line text-mist hover:text-chalk hover:border-mist"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="border border-line bg-panel rounded-xl px-6 py-8 text-center text-sm text-mist">
          No findings match the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, categoryFindings]) => {
            const isCollapsed = collapsed.has(category);
            return (
              <div key={category} className="border border-line bg-panel rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCollapsed(category)}
                  className="w-full px-5 py-2.5 bg-panel2/40 border-b border-line text-sm font-medium flex items-center justify-between hover:bg-panel2/70 transition-colors"
                >
                  <span>
                    {category}{" "}
                    <span className="text-mist font-mono text-xs">({categoryFindings.length})</span>
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`text-mist transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {!isCollapsed && (
                  <div className="divide-y divide-line">
                    {categoryFindings.map((f, i) => (
                      <div key={i} className="px-5 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${SEVERITY_STYLE[f.severity]}`}
                          >
                            {f.severity}
                          </span>
                          {f.title && <span className="font-mono text-[11px] text-mist">{f.title}</span>}
                        </div>
                        <div className="text-sm">{f.message}</div>
                        <div className="font-mono text-xs text-mist mt-1">
                          {f.file}
                          {f.line ? `:${f.line}` : ""}
                        </div>
                        <div className="text-xs text-signal-info mt-1.5">→ {f.suggestion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
