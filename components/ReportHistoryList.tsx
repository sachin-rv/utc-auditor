"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";

import type { CoverageMetrics } from "@/lib/types";

export interface ReportRow {
  id: string;
  timestamp: string;
  trigger: string;
  overallScore: number;
  passed: number;
  total: number;
  failed?: number;
  coverage?: CoverageMetrics;
  coveragePercent?: number | null;
  status?: string;
  qualityGrade?: string;
  completenessScore?: number;
  findingsCount?: number;
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

type SortKey = "date" | "score";

export default function ReportHistoryList({
  clientId,
  reports,
}: {
  clientId: string;
  reports: ReportRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [trigger, setTrigger] = useState("all");
  const [failingOnly, setFailingOnly] = useState(false);
  const [query, setQuery] = useState("");

  const triggers = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.trigger))).sort();
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const dir = sortDir === "asc" ? 1 : -1;
    return [...reports]
      .filter((r) => trigger === "all" || r.trigger === trigger)
      .filter((r) => !failingOnly || r.status === "failed" || r.status === "fail")
      .filter(
        (r) =>
          !q ||
          r.trigger.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          String(r.overallScore).includes(q)
      )
      .sort((a, b) => {
        if (sortKey === "score") return (a.overallScore - b.overallScore) * dir;
        return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * dir;
      });
  }, [reports, sortDir, sortKey, trigger, failingOnly, query]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports…"
          className="bg-panel2 border border-line rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-signal-pass/60 min-w-[10rem] flex-1"
        />
        <select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          className="bg-panel2 border border-line rounded-md px-2 py-1.5 text-[11px] font-mono text-mist outline-none"
        >
          <option value="all">All triggers</option>
          {triggers.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFailingOnly((v) => !v)}
          className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1.5 rounded border transition-colors ${
            failingOnly
              ? "border-signal-fail/40 text-signal-fail bg-signal-fail/10"
              : "border-line text-mist hover:text-chalk"
          }`}
        >
          Failing
        </button>
        <button
          type="button"
          onClick={() => toggleSort("date")}
          className="text-[11px] font-mono text-mist hover:text-chalk"
        >
          date {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
        </button>
        <button
          type="button"
          onClick={() => toggleSort("score")}
          className="text-[11px] font-mono text-mist hover:text-chalk"
        >
          score {sortKey === "score" ? (sortDir === "asc" ? "↑" : "↓") : ""}
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
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-xs text-mist w-32 shrink-0">{fmtDateTime(r.timestamp)}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-line text-mist font-mono uppercase tracking-wider truncate">
                  {r.trigger.replace(/_/g, " ")}
                </span>
                {r.status && <StatusPill status={r.status} />}
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="font-mono text-xs text-mist hidden sm:inline">
                  {r.passed}/{r.total} passed
                  {r.findingsCount ? ` · ${r.findingsCount} findings` : ""}
                  {r.coveragePercent != null ? ` · ${Math.round(r.coveragePercent)}% cov` : ""}
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
