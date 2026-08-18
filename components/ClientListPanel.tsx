"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";

export interface ClientRow {
  id: string;
  name: string;
  projectCount: number;
  latestScore: number | null;
  latestCoverage: number | null;
  latestAuditAt: string | null;
  status: string;
}

type SortKey = "name" | "score" | "coverage" | "recent";

function scoreColor(score: number) {
  if (score < 60) return "text-signal-fail";
  if (score < 80) return "text-signal-warn";
  if (score < 90) return "text-signal-info";
  return "text-signal-pass";
}

function timeAgo(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "success", label: "Passing" },
  { key: "completed_with_errors", label: "Errors" },
  { key: "failed", label: "Failed" },
  { key: "no_reports", label: "No audits" },
];

export default function ClientListPanel({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let rows = clients.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
    if (statusFilter !== "all") rows = rows.filter((c) => c.status === statusFilter);

    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "score":
          return ((a.latestScore ?? -1) - (b.latestScore ?? -1)) * dir;
        case "coverage":
          return ((a.latestCoverage ?? -1) - (b.latestCoverage ?? -1)) * dir;
        case "recent":
        default:
          return (
            (new Date(a.latestAuditAt ?? 0).getTime() - new Date(b.latestAuditAt ?? 0).getTime()) * dir
          );
      }
    });
    return rows;
  }, [clients, query, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: "recent", label: "Last audit" },
    { key: "score", label: "Score" },
    { key: "coverage", label: "Coverage" },
    { key: "name", label: "Name" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mist"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            className="w-full bg-panel border border-line rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`text-xs font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-md border transition-colors ${
                statusFilter === f.key
                  ? "border-signal-pass/40 text-signal-pass bg-signal-pass/10"
                  : "border-line text-mist hover:text-chalk hover:border-mist"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 px-1">
        <span className="text-[10px] uppercase tracking-widest text-mist mr-1">Sort</span>
        {sortButtons.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSort(s.key)}
            className={`text-[11px] font-mono px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              sortKey === s.key ? "text-signal-pass" : "text-mist hover:text-chalk"
            }`}
          >
            {s.label}
            {sortKey === s.key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line bg-panel rounded-xl px-6 py-12 text-center text-sm text-mist">
          No clients match “{query}”.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/client/${c.id}`}
              className="group border border-line bg-panel rounded-xl p-5 flex items-center justify-between hover:border-signal-pass/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-panel2 border border-line flex items-center justify-center font-display font-bold text-mist group-hover:text-signal-pass group-hover:border-signal-pass/30 transition-colors">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-mist mt-0.5">
                    {c.projectCount} project{c.projectCount === 1 ? "" : "s"}
                    {c.latestAuditAt ? ` · last audit ${timeAgo(c.latestAuditAt)}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                {c.latestScore !== null ? (
                  <>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-mist">Coverage</div>
                      <div className="font-mono text-sm">{c.latestCoverage}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-mist">Score</div>
                      <div className={`font-mono text-sm font-bold ${scoreColor(c.latestScore)}`}>
                        {c.latestScore}
                      </div>
                    </div>
                  </>
                ) : null}
                <StatusPill status={c.status} />
                <span className="text-mist group-hover:text-signal-pass transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
