"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";

export interface ReportRow {
  id: string;
  timestamp: string;
  trigger: string;
  overallScore: number;
  passed: number;
  total: number;
  criticalCount: number;
  highCount: number;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function scoreColor(score: number) {
  if (score < 60) return "text-signal-fail";
  if (score < 80) return "text-signal-warn";
  if (score < 90) return "text-signal-info";
  return "text-signal-pass";
}

const TRIGGER_FILTERS = [
  { key: "all", label: "All" },
  { key: "production_build", label: "Build" },
  { key: "scheduled", label: "Scheduled" },
  { key: "manual", label: "Manual" },
];

export default function ReportHistoryList({
  clientId,
  reports,
}: {
  clientId: string;
  reports: ReportRow[];
}) {
  const [trigger, setTrigger] = useState("all");
  const [onlyFindings, setOnlyFindings] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let rows = reports;
    if (trigger !== "all") rows = rows.filter((r) => r.trigger === trigger);
    if (onlyFindings) rows = rows.filter((r) => r.criticalCount > 0 || r.highCount > 0);
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort(
      (a, b) => (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * dir
    );
  }, [reports, trigger, onlyFindings, sortDir]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {TRIGGER_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTrigger(f.key)}
            className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
              trigger === f.key
                ? "border-signal-pass/40 text-signal-pass bg-signal-pass/10"
                : "border-line text-mist hover:text-chalk hover:border-mist"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setOnlyFindings((v) => !v)}
          className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
            onlyFindings
              ? "border-signal-fail/40 text-signal-fail bg-signal-fail/10"
              : "border-line text-mist hover:text-chalk hover:border-mist"
          }`}
        >
          critical/high only
        </button>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="text-[11px] font-mono text-mist hover:text-chalk ml-auto flex items-center gap-1"
        >
          date {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-mist text-center py-6">No reports match the current filters.</div>
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/client/${clientId}/report/${r.id}`}
              className="flex items-center justify-between py-3 group hover:bg-panel2/40 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-mist w-32 shrink-0">{fmtDateTime(r.timestamp)}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-line text-mist font-mono uppercase tracking-wider">
                  {r.trigger.replace("_", " ")}
                </span>
                <div className="flex gap-1.5">
                  {r.criticalCount > 0 && <SeverityBadge severity="critical" />}
                  {r.highCount > 0 && <SeverityBadge severity="high" />}
                  {r.criticalCount === 0 && r.highCount === 0 && (
                    <span className="text-[10px] font-mono text-signal-pass uppercase tracking-wider">clean</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-xs text-mist">
                  {r.passed}/{r.total} passed
                </span>
                <span className={`font-mono text-sm font-bold w-8 text-right ${scoreColor(r.overallScore)}`}>
                  {r.overallScore}
                </span>
                <span className="text-mist group-hover:text-signal-pass transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
