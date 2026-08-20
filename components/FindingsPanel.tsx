"use client";

import { useMemo, useState } from "react";
import SeverityBadge from "@/components/SeverityBadge";
import Modal from "@/components/Modal";
import type { Finding, Severity } from "@/lib/types";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export default function FindingsPanel({ findings }: { findings: Finding[] }) {
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Finding | null>(null);
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const visible = useMemo(() => {
    if (activeSeverities.size === 0) return findings;
    return findings.filter((f) => activeSeverities.has(f.severity));
  }, [findings, activeSeverities]);

  const byCategory = useMemo(() => {
    return visible.reduce<Record<string, Finding[]>>((acc, f) => {
      (acc[f.category] ??= []).push(f);
      return acc;
    }, {});
  }, [visible]);

  function toggleSeverity(s: Severity) {
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

  async function copyFinding(f: Finding) {
    const text = `[${f.severity.toUpperCase()}] ${f.ruleId} — ${f.category}\n${f.detail}${
      f.file ? `\nFile: ${f.file}` : ""
    }\nRecommendation: ${f.recommendation}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — nothing to recover, fail silently.
    }
  }

  if (findings.length === 0) {
    return (
      <div className="border border-line bg-panel rounded-xl px-6 py-8 text-center text-sm text-signal-pass">
        No rule violations detected in this audit.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {SEVERITY_ORDER.filter((s) => counts[s] > 0).map((s) => {
          const active = activeSeverities.has(s);
          return (
            <button
              key={s}
              onClick={() => toggleSeverity(s)}
              className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                active
                  ? "border-signal-pass/40 text-signal-pass bg-signal-pass/10"
                  : "border-line text-mist hover:text-chalk hover:border-mist"
              }`}
            >
              {s} · {counts[s]}
            </button>
          );
        })}
        {activeSeverities.size > 0 && (
          <button
            onClick={() => setActiveSeverities(new Set())}
            className="text-[11px] font-mono text-mist hover:text-chalk underline underline-offset-2 ml-1"
          >
            clear
          </button>
        )}
        <span className="text-[11px] font-mono text-mist ml-auto">
          {visible.length} of {findings.length} shown
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="border border-line bg-panel rounded-xl px-6 py-8 text-center text-sm text-mist">
          No findings match the selected severity filter.
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
                    {category} <span className="text-mist font-mono text-xs">({categoryFindings.length})</span>
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
                    {categoryFindings.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelected(f)}
                        className="w-full text-left px-5 py-3 flex items-start justify-between gap-4 hover:bg-panel2/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[11px] text-mist">{f.ruleId}</span>
                            <SeverityBadge severity={f.severity} />
                          </div>
                          <div className="text-sm">{f.detail}</div>
                          {f.file && <div className="font-mono text-xs text-mist mt-1">{f.file}</div>}
                          <div className="text-xs text-signal-info mt-1.5">→ {f.recommendation}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.ruleId} widthClass="max-w-lg">
        {selected && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SeverityBadge severity={selected.severity} />
              <span className="text-xs text-mist uppercase tracking-wider">{selected.category}</span>
              <span className="text-[10px] font-mono text-mist ml-auto">rule v{selected.ruleVersion}</span>
            </div>
            <div className="text-sm mb-3">{selected.detail}</div>
            {selected.file && (
              <div className="font-mono text-xs text-mist bg-panel2 border border-line rounded-md px-3 py-2 mb-3">
                {selected.file}
              </div>
            )}
            <div className="border-l-2 border-signal-info/40 pl-3 text-sm text-signal-info mb-4">
              {selected.recommendation}
            </div>
            <button
              onClick={() => copyFinding(selected)}
              className="text-xs font-medium text-mist hover:text-chalk border border-line hover:border-mist rounded-md px-3 py-1.5 transition-colors"
            >
              {copied ? "Copied" : "Copy finding"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
