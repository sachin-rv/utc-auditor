import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getClient, getReport, listProjectsForClient } from "@/lib/db";
import ScoreDial from "@/components/ScoreDial";
import ScoreBarList from "@/components/ScoreBarList";
import CoverageFileTable from "@/components/CoverageFileTable";
import ExternalFindingsList from "@/components/ExternalFindingsList";
import RawOutputViewer from "@/components/RawOutputViewer";

const GRADE_COLOR: Record<string, string> = {
  A: "text-signal-pass border-signal-pass/30 bg-signal-pass/10",
  B: "text-signal-info border-signal-info/30 bg-signal-info/10",
  C: "text-signal-warn border-signal-warn/30 bg-signal-warn/10",
  D: "text-signal-high border-signal-high/30 bg-signal-high/10",
  F: "text-signal-fail border-signal-fail/30 bg-signal-fail/10",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ReportDetailedQualityPage({
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
  if (!report.detailed) notFound();

  const project = listProjectsForClient(params.clientId).find((p) => p.id === report.projectId);
  const { detailed } = report;
  const gradeStyle = GRADE_COLOR[detailed.grade[0]] ?? GRADE_COLOR.C;

  const subScores = [
    { label: "Coverage", value: detailed.scores.coverage },
    { label: "Isolation", value: detailed.scores.isolation },
    { label: "Mock hygiene", value: detailed.scores.mockHygiene },
    { label: "Readability", value: detailed.scores.readability },
    { label: "Titles", value: detailed.scores.titles },
    { label: "Reliability", value: detailed.scores.reliability },
    { label: "Assertions", value: detailed.scores.assertions },
    { label: "Hygiene", value: detailed.scores.hygiene },
  ];

  return (
    <div>
      <Link
        href={`/dashboard/client/${client.id}`}
        className="text-xs text-mist hover:text-chalk font-mono mb-4 inline-block"
      >
        ← Back to audit report
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-signal-pass mb-1">
            Detailed test-quality breakdown
          </div>
          <h1 className="font-display text-3xl font-bold">{project?.name ?? "Unknown project"}</h1>
          <div className="text-sm text-mist mt-1">{fmtDateTime(report.timestamp)}</div>
        </div>
        <span
          className={`text-2xl font-display font-bold border rounded-lg h-14 w-14 flex items-center justify-center ${gradeStyle}`}
          title={`Grade ${detailed.grade}`}
        >
          {detailed.grade}
        </span>
      </div>

      <div className="border border-line bg-panel rounded-xl px-5 py-4 mb-8 text-sm">
        <span className="text-mist">Verdict — </span>
        {detailed.verdict}
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-8 mb-10">
        <div className="border border-line bg-panel rounded-xl p-6 flex flex-col items-center justify-center">
          <ScoreDial score={detailed.scores.overall} size={172} label="Overall Score" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="border border-line bg-panel rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-mist mb-4">Aggregate coverage</div>
            <ScoreBarList
              items={[
                { label: "Statements", value: report.coverage.statements },
                { label: "Branches", value: report.coverage.branches },
                { label: "Functions", value: report.coverage.functions },
                { label: "Lines", value: report.coverage.lines },
              ]}
            />
          </div>
          <div className="border border-line bg-panel rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-mist mb-4">Quality sub-scores</div>
            <ScoreBarList items={subScores} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="border border-line bg-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-display font-bold">{detailed.testFileCount}</div>
          <div className="text-[11px] uppercase tracking-wider text-mist mt-1">Test files</div>
        </div>
        <div className="border border-line bg-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-display font-bold">{detailed.files.length}</div>
          <div className="text-[11px] uppercase tracking-wider text-mist mt-1">Source files covered</div>
        </div>
        <div className="border border-line bg-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-display font-bold">
            <span className="text-signal-fail">{detailed.findingCounts.error}</span>
            <span className="text-mist mx-1">/</span>
            <span className="text-signal-warn">{detailed.findingCounts.warning}</span>
            <span className="text-mist mx-1">/</span>
            <span className="text-signal-info">{detailed.findingCounts.info}</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-mist mt-1">Error / warning / info</div>
        </div>
      </div>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">
          Per-file coverage ({detailed.files.length})
        </div>
        <CoverageFileTable files={detailed.files} />
      </section>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">
          Quality findings ({detailed.qualityFindings.length})
        </div>
        <ExternalFindingsList findings={detailed.qualityFindings} />
      </section>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">
          Strategies run ({detailed.strategiesRun.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {detailed.strategiesRun.map((s) => (
            <span key={s} className="text-[11px] font-mono px-2 py-1 rounded-full border border-line text-mist">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section>
        <RawOutputViewer output={detailed.rawOutput} />
      </section>
    </div>
  );
}
