"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ScoreDial from "@/components/ScoreDial";
import CoverageBars from "@/components/CoverageBars";
import FindingsPanel from "@/components/FindingsPanel";
import CopyLinkButton from "@/components/CopyLinkButton";
import CopyTextButton from "@/components/CopyTextButton";
import StatusPill from "@/components/StatusPill";
import type { CoverageMetrics, Finding } from "@/lib/types";
import type { ReportPipeline } from "@/lib/api-types";

export interface ReportViewModel {
  id: string;
  reportId: string;
  clientId: string;
  timestamp: string;
  overallScore: number;
  coverage: CoverageMetrics;
  testExecution: { total: number; passed: number; failed: number };
  findings: Finding[];
  status: string;
  pipeline?: ReportPipeline;
  hasDetailed: boolean;
  rawJson: Record<string, unknown>;
}

type Tab = "overview" | "findings" | "payload";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function scoreColor(score: number) {
  if (score < 60) return "text-signal-fail";
  if (score < 80) return "text-signal-warn";
  if (score < 90) return "text-signal-info";
  return "text-signal-pass";
}

export default function ReportView({
  projectName,
  view,
}: {
  projectName: string;
  view: ReportViewModel;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [pipelineOpen, setPipelineOpen] = useState(true);
  const jsonText = useMemo(() => JSON.stringify(view.rawJson, null, 2), [view.rawJson]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "findings", label: `Findings (${view.findings.length})` },
    { id: "payload", label: "Report JSON" },
  ];

  const passRate =
    view.testExecution.total > 0
      ? Math.round((view.testExecution.passed / view.testExecution.total) * 100)
      : 0;

  return (
    <div>
      <Link
        href={`/dashboard/client/${view.clientId}`}
        className="ui-back"
      >
        ← Project history
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="ui-kicker">Audit report</div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{projectName}</h1>
            <CopyLinkButton />
            <StatusPill status={view.status} />
          </div>
          <div className="text-sm text-mist mt-1">{fmtDateTime(view.timestamp)}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-display text-4xl font-bold ${scoreColor(view.overallScore)}`}>{view.overallScore}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-line pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`ui-chip ${
              tab === t.id ? "ui-chip-on" : "ui-chip-off border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="w-full mb-6 ui-card overflow-hidden">
            <button
              type="button"
              onClick={() => setPipelineOpen((v) => !v)}
              className="w-full px-5 py-3.5 text-left hover:bg-panel2/40 transition-colors flex items-center justify-between"
            >
              <span className="text-xs uppercase tracking-widest text-mist">Run metadata</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`text-mist transition-transform ${pipelineOpen ? "" : "-rotate-90"}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {pipelineOpen && (
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono px-5 pb-4">
                <MetaRow label="Report id" value={view.reportId} />
                <MetaRow label="Mongo id" value={view.id} />
                <MetaRow label="Branch" value={view.pipeline?.branch ?? "—"} />
                <MetaRow label="Provider" value={view.pipeline?.provider ?? "—"} />
                <MetaRow label="Trigger" value={view.pipeline?.triggeredBy ?? "—"} />
                <MetaRow label="Commit" value={view.pipeline?.commitSha ?? "—"} />
                <MetaRow label="Run id" value={view.pipeline?.runId ?? "—"} />
              </dl>
            )}
          </div>

          {view.hasDetailed && (
            <Link
              href={`/dashboard/client/${view.clientId}/report/${view.id}/details`}
              className="group mb-6 flex items-center justify-between ui-card-hover px-5 py-3.5"
            >
              <div>
                <div className="text-sm font-medium">Detailed test-quality breakdown</div>
                <div className="text-xs text-mist mt-0.5">Per-file coverage, quality findings, and sub-scores</div>
              </div>
              <span className="text-mist group-hover:text-signal-pass transition-colors">→</span>
            </Link>
          )}

          <div className="grid md:grid-cols-[auto_1fr] gap-8 mb-10">
            <div className="ui-card p-6 flex flex-col items-center justify-center gap-2">
              <ScoreDial score={view.overallScore} size={172} />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="ui-card p-6">
                <div className="text-xs uppercase tracking-widest text-mist mb-4">Coverage</div>
                <CoverageBars coverage={view.coverage} />
              </div>
              <div className="ui-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs uppercase tracking-widest text-mist">Test execution</div>
                  <span className="text-[11px] text-mist">{passRate}% pass rate</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm font-mono">
                  <span className="text-mist">Total</span>
                  <span className="text-right">{view.testExecution.total}</span>
                  <span className="text-signal-pass">Passed</span>
                  <span className="text-right text-signal-pass">{view.testExecution.passed}</span>
                  <span className="text-signal-fail">Failed</span>
                  <span className="text-right text-signal-fail">{view.testExecution.failed}</span>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-panel2 overflow-hidden">
                  <div
                    className="h-full bg-signal-pass"
                    style={{ width: `${Math.min(100, passRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "findings" && (
        <section>
          <FindingsPanel findings={view.findings} />
        </section>
      )}

      {tab === "payload" && (
        <section className="ui-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-line bg-panel2/40">
            <span className="text-xs uppercase tracking-widest text-mist">reportJson</span>
            <CopyTextButton value={jsonText} label="Copy JSON" />
          </div>
          <pre className="px-5 py-4 text-[11px] font-mono text-mist overflow-x-auto max-h-[32rem] overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {jsonText}
          </pre>
        </section>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <dt className="text-mist shrink-0">{label}</dt>
      <dd className="text-chalk truncate">{value}</dd>
    </div>
  );
}
