import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getClient, getReport, listProjectsForClient, listReportsForClient } from "@/lib/db";
import ScoreDial from "@/components/ScoreDial";
import CoverageBars from "@/components/CoverageBars";
import FindingsPanel from "@/components/FindingsPanel";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { MigrationFinding } from "@/lib/types";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function delta(curr: number, prev?: number) {
  if (prev === undefined) return null;
  const d = curr - prev;
  if (d === 0) return <span className="text-mist">±0</span>;
  const positive = d > 0;
  return (
    <span className={positive ? "text-signal-pass" : "text-signal-fail"}>
      {positive ? "+" : ""}
      {d}
    </span>
  );
}

const MIGRATION_STATUS_STYLE: Record<MigrationFinding["status"], string> = {
  active: "text-signal-pass border-signal-pass/30 bg-signal-pass/10",
  inconsistent: "text-signal-warn border-signal-warn/30 bg-signal-warn/10",
  likely_obsolete: "text-signal-fail border-signal-fail/30 bg-signal-fail/10",
};

const MIGRATION_AREA_LABEL: Record<MigrationFinding["area"], string> = {
  cms: "CMS",
  search: "Search",
  ab_testing: "A/B Testing",
  rendering: "Rendering",
};

export default function ReportDetailPage({
  params,
}: {
  params: { clientId: string; reportId: string };
}) {
  const session = getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin" && session.clientId !== params.clientId) redirect("/dashboard");

  const client = getClient(params.clientId);
  const report = getReport(params.reportId);
  if (!client || !report || report.clientId !== params.clientId) notFound();

  const project = listProjectsForClient(params.clientId).find((p) => p.id === report.projectId);
  const history = listReportsForClient(params.clientId)
    .filter((r) => r.projectId === report.projectId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const idx = history.findIndex((r) => r.id === report.id);
  const previous = idx >= 0 ? history[idx + 1] : undefined;

  return (
    <div>
      <Link
        href={`/dashboard/client/${client.id}`}
        className="text-xs text-mist hover:text-chalk font-mono mb-4 inline-block"
      >
        ← {client.name} history
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-signal-pass mb-1">
            Audit report
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{project?.name ?? "Unknown project"}</h1>
            <CopyLinkButton />
          </div>
          <div className="text-sm text-mist mt-1">{fmtDateTime(report.timestamp)}</div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-mist">
          <dt>Execution ID</dt>
          <dd className="text-chalk">{report.auditExecutionId}</dd>
          <dt>Build</dt>
          <dd className="text-chalk">{report.buildId ?? "—"}</dd>
          <dt>Auditor</dt>
          <dd className="text-chalk">v{report.auditorVersion}</dd>
          <dt>Rule set</dt>
          <dd className="text-chalk">v{report.ruleSetVersion}</dd>
          <dt>Jest</dt>
          <dd className="text-chalk">{report.jestVersion ?? "—"}</dd>
          <dt>Trigger</dt>
          <dd className="text-chalk capitalize">{report.trigger.replace("_", " ")}</dd>
        </dl>
      </div>

      {report.detailed && (
        <Link
          href={`/dashboard/client/${client.id}/report/${report.id}/details`}
          className="group mb-6 flex items-center justify-between border border-line bg-panel hover:border-signal-pass/40 rounded-xl px-5 py-3.5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-display font-bold border rounded-md h-8 w-8 flex items-center justify-center ${
                report.detailed.grade[0] === "A"
                  ? "text-signal-pass border-signal-pass/30 bg-signal-pass/10"
                  : report.detailed.grade[0] === "B"
                  ? "text-signal-info border-signal-info/30 bg-signal-info/10"
                  : report.detailed.grade[0] === "C"
                  ? "text-signal-warn border-signal-warn/30 bg-signal-warn/10"
                  : report.detailed.grade[0] === "D"
                  ? "text-signal-high border-signal-high/30 bg-signal-high/10"
                  : "text-signal-fail border-signal-fail/30 bg-signal-fail/10"
              }`}
            >
              {report.detailed.grade}
            </span>
            <div>
              <div className="text-sm font-medium">Detailed test-quality breakdown</div>
              <div className="text-xs text-mist mt-0.5">
                Per-file coverage, {report.detailed.qualityFindings.length} quality finding
                {report.detailed.qualityFindings.length === 1 ? "" : "s"}, and 8 sub-scores
              </div>
            </div>
          </div>
          <span className="text-mist group-hover:text-signal-pass transition-colors">→</span>
        </Link>
      )}

      {report.errors.length > 0 && (
        <div className="mb-6 border border-signal-warn/30 bg-signal-warn/10 rounded-lg px-4 py-3 text-sm text-signal-warn">
          {report.errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-[auto_1fr] gap-8 mb-10">
        <div className="border border-line bg-panel rounded-xl p-6 flex flex-col items-center justify-center gap-2">
          <ScoreDial score={report.overallScore} size={172} />
          {previous && (
            <div className="text-xs font-mono text-mist mt-1">
              {delta(report.overallScore, previous.overallScore)} vs previous audit
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="border border-line bg-panel rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-mist mb-4">Coverage</div>
            <CoverageBars coverage={report.coverage} />
          </div>
          <div className="border border-line bg-panel rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-mist mb-4">Test execution</div>
            <div className="grid grid-cols-2 gap-y-3 text-sm font-mono">
              <span className="text-mist">Total</span>
              <span className="text-right">{report.testExecution.total}</span>
              <span className="text-signal-pass">Passed</span>
              <span className="text-right text-signal-pass">{report.testExecution.passed}</span>
              <span className="text-signal-fail">Failed</span>
              <span className="text-right text-signal-fail">{report.testExecution.failed}</span>
              <span className="text-signal-warn">Skipped</span>
              <span className="text-right text-signal-warn">{report.testExecution.skipped}</span>
              <span className="text-mist">Pending</span>
              <span className="text-right">{report.testExecution.pending}</span>
              <span className="text-mist">Duration</span>
              <span className="text-right">{(report.testExecution.durationMs / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">
          Findings ({report.findings.length})
        </div>
        <FindingsPanel findings={report.findings} />
      </section>

      {report.dependencyFindings.length > 0 && (
        <section className="mb-10">
          <div className="text-xs uppercase tracking-widest text-mist mb-4">
            Dependency consistency
          </div>
          <div className="border border-line bg-panel rounded-xl divide-y divide-line">
            {report.dependencyFindings.map((d, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-sm">{d.package}</span>
                  <span className="text-sm text-mist"> — {d.detail}</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-mist border border-line rounded px-1.5 py-0.5 shrink-0">
                  {d.kind.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">Migration analysis</div>
        {report.migrationFindings.length === 0 ? (
          <div className="border border-line bg-panel rounded-xl px-6 py-6 text-center text-sm text-mist">
            Not evaluated for this report.
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {report.migrationFindings.map((m, i) => (
            <div key={i} className="border border-line bg-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{MIGRATION_AREA_LABEL[m.area]}</span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider border rounded px-1.5 py-0.5 ${MIGRATION_STATUS_STYLE[m.status]}`}
                >
                  {m.status.replace("_", " ")}
                </span>
              </div>
              <div className="font-mono text-xs text-mist mb-2">
                {m.packages.length ? m.packages.join(", ") : "no active package"}
              </div>
              <p className="text-sm text-mist">{m.detail}</p>
            </div>
          ))}
        </div>
        )}
      </section>

      {report.recommendations.length > 0 && (
        <section>
          <div className="text-xs uppercase tracking-widest text-mist mb-4">Recommendations</div>
          <ul className="border border-line bg-panel rounded-xl divide-y divide-line">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="px-5 py-3 text-sm flex gap-3">
                <span className="text-signal-pass font-mono">{String(i + 1).padStart(2, "0")}</span>
                {rec}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
