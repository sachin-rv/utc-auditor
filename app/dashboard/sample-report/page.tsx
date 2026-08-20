import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ScoreDial from "@/components/ScoreDial";
import ScoreBarList from "@/components/ScoreBarList";
import CoverageFileTable from "@/components/CoverageFileTable";
import ExternalFindingsList from "@/components/ExternalFindingsList";
import RawOutputViewer from "@/components/RawOutputViewer";
import type { ExternalReport } from "@/lib/externalReport";
import reportData from "@/data/sample-external-report.json";

const report = reportData as unknown as ExternalReport;

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const GRADE_COLOR: Record<string, string> = {
  A: "text-signal-pass border-signal-pass/30 bg-signal-pass/10",
  B: "text-signal-info border-signal-info/30 bg-signal-info/10",
  C: "text-signal-warn border-signal-warn/30 bg-signal-warn/10",
  D: "text-signal-high border-signal-high/30 bg-signal-high/10",
  F: "text-signal-fail border-signal-fail/30 bg-signal-fail/10",
};

export default function SampleReportPage() {
  const session = getSession();
  if (!session) redirect("/login");

  const { project, coverage, findings, scores, summary } = report;
  const gradeStyle = GRADE_COLOR[summary.grade[0]] ?? GRADE_COLOR.C;

  const subScores = [
    { label: "Coverage", value: scores.coverage },
    { label: "Isolation", value: scores.isolation },
    { label: "Mock hygiene", value: scores.mockHygiene },
    { label: "Readability", value: scores.readability },
    { label: "Titles", value: scores.titles },
    { label: "Reliability", value: scores.reliability },
    { label: "Assertions", value: scores.assertions },
    { label: "Hygiene", value: scores.hygiene },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">{project.packageJson.name}</h1>
          <div className="text-sm text-mist mt-1">
            {fmtDateTime(report.generatedAt)} · {project.framework} · {project.packageManager}
          </div>
        </div>
        <span
          className={`text-2xl font-display font-bold border rounded-lg h-14 w-14 flex items-center justify-center ${gradeStyle}`}
          title={`Grade ${summary.grade}`}
        >
          {summary.grade}
        </span>
      </div>

      <div className="border border-line bg-panel rounded-xl px-5 py-4 mb-8 text-sm">
        <span className="text-mist">Verdict — </span>
        {summary.verdict}
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-8 mb-10">
        <div className="border border-line bg-panel rounded-xl p-6 flex flex-col items-center justify-center">
          <ScoreDial score={scores.overall} size={172} label="Overall Score" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="border border-line bg-panel rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-mist mb-4">Aggregate coverage</div>
            <ScoreBarList
              items={[
                { label: "Statements", value: coverage.statements },
                { label: "Branches", value: coverage.branches },
                { label: "Functions", value: coverage.functions },
                { label: "Lines", value: coverage.lines },
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
          <div className="text-2xl font-display font-bold">{summary.testFileCount}</div>
          <div className="text-[11px] uppercase tracking-wider text-mist mt-1">Test files</div>
        </div>
        <div className="border border-line bg-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-display font-bold">{coverage.files.length}</div>
          <div className="text-[11px] uppercase tracking-wider text-mist mt-1">Source files covered</div>
        </div>
        <div className="border border-line bg-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-display font-bold">
            <span className="text-signal-fail">{summary.findingCounts.error}</span>
            <span className="text-mist mx-1">/</span>
            <span className="text-signal-warn">{summary.findingCounts.warning}</span>
            <span className="text-mist mx-1">/</span>
            <span className="text-signal-info">{summary.findingCounts.info}</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-mist mt-1">Error / warning / info</div>
        </div>
      </div>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">
          Per-file coverage ({coverage.files.length})
        </div>
        <CoverageFileTable files={coverage.files} />
      </section>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">Findings ({findings.length})</div>
        <ExternalFindingsList findings={findings} />
      </section>

      <section className="mb-10">
        <div className="text-xs uppercase tracking-widest text-mist mb-4">
          Strategies run ({summary.strategiesRun.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {summary.strategiesRun.map((s) => (
            <span
              key={s}
              className="text-[11px] font-mono px-2 py-1 rounded-full border border-line text-mist"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {coverage.rawOutput && (
        <section>
          <RawOutputViewer output={coverage.rawOutput} />
        </section>
      )}
    </div>
  );
}
