"use client";

import { useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import type { ReportRow } from "@/components/ReportHistoryList";
import type { ApiProject } from "@/lib/api-types";

export interface ProjectBoardItem {
  project: ApiProject;
  reports: ReportRow[];
  total: number;
}

type StatusFilter = "all" | "passing" | "failing" | "empty";

function latestStatus(item: ProjectBoardItem) {
  return item.reports[0]?.status;
}

export default function ProjectsBoard({
  clientId,
  isAdmin,
  items,
}: {
  clientId: string;
  isAdmin: boolean;
  items: ProjectBoardItem[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [expandAll, setExpandAll] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const p = item.project;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.repositoryUrl ?? "").toLowerCase().includes(q) ||
        (p.branch ?? "").toLowerCase().includes(q);
      if (!matchesQuery) return false;
      const s = latestStatus(item);
      if (status === "empty") return item.reports.length === 0;
      if (status === "passing") return s === "success" || s === "pass";
      if (status === "failing") return s === "failed" || s === "fail";
      return true;
    });
  }, [items, query, status]);

  const chips: { id: StatusFilter; label: string }[] = [
    { id: "all", label: `All · ${items.length}` },
    { id: "passing", label: "Passing" },
    { id: "failing", label: "Failing" },
    { id: "empty", label: "No reports" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[14rem]">
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
            placeholder="Search projects, slugs, repos…"
            className="ui-input pl-9 pr-3 py-2"
          />
        </div>
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setStatus(c.id)}
            className={`ui-chip ${
              status === c.id ? "ui-chip-on" : "ui-chip-off"
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setExpandAll((v) => !v)}
          className="text-[11px] text-mist hover:text-chalk ml-auto"
        >
          {expandAll ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="ui-empty">
          {items.length === 0 ? "No projects yet." : "No projects match the current filters."}
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((item) => (
            <ProjectCard
              key={`${item.project.id}-${expandAll ? "open" : "shut"}`}
              clientId={clientId}
              project={item.project}
              isAdmin={isAdmin}
              reports={item.reports}
              total={item.total}
              defaultOpen={expandAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}
