"use client";

import { useState } from "react";
import StatusPill from "@/components/StatusPill";
import ScoreDial from "@/components/ScoreDial";
import CoverageBars from "@/components/CoverageBars";
import ReportHistoryList, { ReportRow } from "@/components/ReportHistoryList";
import CreateApiKeyButton from "@/components/CreateApiKeyButton";
import CopyTextButton from "@/components/CopyTextButton";
import type { ApiProject } from "@/lib/api-types";

export default function ProjectCard({
  clientId,
  project,
  isAdmin,
  reports,
  total,
  defaultOpen = true,
}: {
  clientId: string;
  project: ApiProject;
  isAdmin: boolean;
  reports: ReportRow[];
  total: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const latest = reports[0];
  const coverage = latest?.coverage ?? {
    statements: Math.round(latest?.coveragePercent ?? 0),
    branches: Math.round(latest?.coveragePercent ?? 0),
    functions: Math.round(latest?.coveragePercent ?? 0),
    lines: Math.round(latest?.coveragePercent ?? 0),
  };
  const passRate =
    latest && latest.total > 0 ? Math.round((latest.passed / latest.total) * 100) : 0;

  return (
    <section className="border border-line bg-panel rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel2/40 gap-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-left min-w-0 flex-1 group"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-bold text-lg group-hover:text-signal-pass transition-colors">{project.name}</h2>
            <span className="text-[10px] font-mono uppercase tracking-wider text-mist border border-line rounded px-1.5 py-0.5">
              {project.slug}
            </span>
            {project.auditConfig?.schedule && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-mist border border-line rounded px-1.5 py-0.5">
                {project.auditConfig.schedule}
              </span>
            )}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`text-mist transition-transform ${open ? "" : "-rotate-90"}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className="text-xs text-mist font-mono mt-0.5 truncate">
            {project.repositoryUrl ?? "No repository URL"}
            {project.branch ? ` · ${project.branch}` : ""}
          </div>
        </button>
        <div className="flex items-center gap-2.5 shrink-0">
          {latest && <StatusPill status={latest.status ?? "no_reports"} />}
          {project.repositoryUrl && <CopyTextButton value={project.repositoryUrl} label="Repo" />}
          {isAdmin && <CreateApiKeyButton projectId={project.id} projectName={project.name} />}
        </div>
      </div>

      {open && (
        <>
          {project.description && (
            <div className="px-6 py-3 border-b border-line text-sm text-mist">{project.description}</div>
          )}
          {reports.length === 0 ? (
            <div className="px-6 py-10 text-center text-mist text-sm">No audit reports submitted for this project yet.</div>
          ) : (
            <>
              <div className="grid md:grid-cols-[auto_1fr] gap-8 px-6 py-6 border-b border-line">
                <ScoreDial
                  score={latest?.overallScore ?? 0}
                  label={latest?.qualityGrade ? `Grade ${latest.qualityGrade}` : "Quality score"}
                />
                <div>
                  <div className="text-xs uppercase tracking-widest text-mist mb-3">Latest coverage</div>
                  <CoverageBars coverage={coverage} />
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-line text-mist">
                      {latest?.passed ?? 0}/{latest?.total ?? 0} tests · {passRate}% pass
                    </span>
                    {latest?.failed ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-signal-fail/40 text-signal-fail">
                        {latest.failed} failed
                      </span>
                    ) : null}
                    {latest?.findingsCount ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-signal-warn/40 text-signal-warn">
                        {latest.findingsCount} findings
                      </span>
                    ) : null}
                    {latest?.completenessScore != null ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-line text-mist">
                        Completeness {latest.completenessScore}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="text-xs uppercase tracking-widest text-mist mb-3">
                  Report history ({total})
                </div>
                <ReportHistoryList clientId={clientId} reports={reports} />
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
