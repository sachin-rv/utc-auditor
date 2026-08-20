"use client";

import { useMemo, useState } from "react";
import type { ExternalCoverageFile } from "@/lib/externalReport";
import Modal from "@/components/Modal";
import ScoreBarList from "@/components/ScoreBarList";

type SortKey = "path" | "statements" | "branches" | "functions" | "lines";

function pctColor(v: number) {
  if (v < 60) return "text-signal-fail";
  if (v < 80) return "text-signal-warn";
  if (v < 90) return "text-signal-info";
  return "text-signal-pass";
}

export default function CoverageFileTable({ files }: { files: ExternalCoverageFile[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("path");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [onlyBelow90, setOnlyBelow90] = useState(false);
  const [selected, setSelected] = useState<ExternalCoverageFile | null>(null);

  const rows = useMemo(() => {
    let r = files.filter((f) => f.path.toLowerCase().includes(query.trim().toLowerCase()));
    if (onlyBelow90) {
      r = r.filter(
        (f) => f.statements.pct < 90 || f.branches.pct < 90 || f.functions.pct < 90 || f.lines.pct < 90
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => {
      if (sortKey === "path") return a.path.localeCompare(b.path) * dir;
      return (a[sortKey].pct - b[sortKey].pct) * dir;
    });
  }, [files, query, sortKey, sortDir, onlyBelow90]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "path" ? "asc" : "desc");
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "path", label: "File" },
    { key: "statements", label: "Stmts" },
    { key: "branches", label: "Branch" },
    { key: "functions", label: "Funcs" },
    { key: "lines", label: "Lines" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mist"
            width="13"
            height="13"
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
            placeholder="Filter files…"
            className="w-full bg-panel border border-line rounded-md pl-8 pr-3 py-1.5 text-xs font-mono outline-none focus:border-signal-pass/60 transition-colors"
          />
        </div>
        <button
          onClick={() => setOnlyBelow90((v) => !v)}
          className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-md border shrink-0 transition-colors ${
            onlyBelow90
              ? "border-signal-warn/40 text-signal-warn bg-signal-warn/10"
              : "border-line text-mist hover:text-chalk hover:border-mist"
          }`}
        >
          below 90% only
        </button>
      </div>

      <div className="text-[11px] font-mono text-mist mb-2">
        {rows.length} of {files.length} files
      </div>

      <div className="border border-line rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_70px_70px_70px_70px] bg-panel2/40 border-b border-line text-[10px] uppercase tracking-wider text-mist">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => toggleSort(col.key)}
              className={`px-3 py-2 text-left hover:text-chalk transition-colors flex items-center gap-1 ${
                col.key !== "path" ? "justify-end text-right" : ""
              }`}
            >
              {col.label}
              {sortKey === col.key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
            </button>
          ))}
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-line">
          {rows.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-mist">No files match “{query}”.</div>
          ) : (
            rows.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelected(f)}
                className="w-full grid grid-cols-[1fr_70px_70px_70px_70px] text-xs hover:bg-panel2/40 transition-colors text-left"
              >
                <span className="px-3 py-1.5 font-mono text-chalk truncate" title={f.path}>
                  {f.path}
                </span>
                <span className={`px-3 py-1.5 text-right font-mono ${pctColor(f.statements.pct)}`}>
                  {f.statements.pct}%
                </span>
                <span className={`px-3 py-1.5 text-right font-mono ${pctColor(f.branches.pct)}`}>
                  {f.branches.pct}%
                </span>
                <span className={`px-3 py-1.5 text-right font-mono ${pctColor(f.functions.pct)}`}>
                  {f.functions.pct}%
                </span>
                <span className={`px-3 py-1.5 text-right font-mono ${pctColor(f.lines.pct)}`}>
                  {f.lines.pct}%
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.path} widthClass="max-w-md">
        {selected && (
          <div>
            <ScoreBarList
              items={[
                { label: "Statements", value: selected.statements.pct },
                { label: "Branches", value: selected.branches.pct },
                { label: "Functions", value: selected.functions.pct },
                { label: "Lines", value: selected.lines.pct },
              ]}
            />
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-line text-xs font-mono">
              <div>
                <span className="text-mist">Statements </span>
                {selected.statements.covered}/{selected.statements.total}
              </div>
              <div>
                <span className="text-mist">Branches </span>
                {selected.branches.covered}/{selected.branches.total}
              </div>
              <div>
                <span className="text-mist">Functions </span>
                {selected.functions.covered}/{selected.functions.total}
              </div>
              <div>
                <span className="text-mist">Lines </span>
                {selected.lines.covered}/{selected.lines.total}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
