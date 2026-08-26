"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type {
  CompletenessRec,
  CoverageFileRow,
  FailedCase,
  StaticIssue,
  TestFileResult,
  Tone,
  UserReportView,
} from "@/lib/user-report";
import { countTone, gradeTone, scoreTone } from "@/lib/user-report";

type SectionId = "static" | "failed" | "files" | "cms" | "missing" | "coverage";

const TONE_BORDER: Record<Tone, string> = {
  pass: "border-signal-pass/40",
  warn: "border-signal-warn/45",
  fail: "border-signal-fail/40",
  neutral: "border-line",
};

const TONE_TEXT: Record<Tone, string> = {
  pass: "text-signal-pass",
  warn: "text-signal-warn",
  fail: "text-signal-fail",
  neutral: "text-chalk",
};

const TONE_BG: Record<Tone, string> = {
  pass: "bg-signal-pass/10 text-signal-pass",
  warn: "bg-signal-warn/15 text-signal-warn",
  fail: "bg-signal-fail/10 text-signal-fail",
  neutral: "bg-panel2 text-mist",
};

const PAGE_SIZE = 8;

export default function AuditDetailsDashboard({ data }: { data: UserReportView }) {
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    static: true,
    failed: false,
    files: false,
    cms: false,
    missing: false,
    coverage: false,
  });
  const staticRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef<HTMLDivElement>(null);
  const cmsRef = useRef<HTMLDivElement>(null);
  const missingRef = useRef<HTMLDivElement>(null);
  const coverageRef = useRef<HTMLDivElement>(null);
  const refs: Record<SectionId, RefObject<HTMLDivElement>> = {
    static: staticRef,
    failed: failedRef,
    files: filesRef,
    cms: cmsRef,
    missing: missingRef,
    coverage: coverageRef,
  };

  const staticCounts = useMemo(() => {
    const error = data.staticIssues.filter((i) => i.severity === "error").length;
    const warning = data.staticIssues.filter((i) => i.severity === "warning").length;
    const info = data.staticIssues.filter((i) => i.severity === "info").length;
    return { error, warning, info };
  }, [data.staticIssues]);

  function go(id: SectionId) {
    setOpen((prev) => ({ ...prev, [id]: true }));
    requestAnimationFrame(() => {
      refs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggle(id: SectionId) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const cmsTotal = data.cms.stats.legacyIssues + data.cms.stats.gapIssues + data.cms.stats.progressSignals;
  const failedFiles = new Set(data.run.failedCases.map((c) => c.file)).size;
  const strategyErrors = data.quality.byStrategy.reduce((n, s) => n + s.errors, 0);
  const strategyWarnings = data.quality.byStrategy.reduce((n, s) => n + s.warnings, 0);
  const strategyTitles = Object.fromEntries(data.quality.byStrategy.map((s) => [s.strategy, s.title]));
  const metrics: {
    label: string;
    value: number;
    tone: Tone;
    hint: string;
    section: SectionId;
  }[] = [
    { label: "Total tests", value: data.run.total, tone: "neutral", hint: "Jest tests executed in this run", section: "failed" },
    { label: "Passed", value: data.run.passed, tone: "pass", hint: "Tests that passed", section: "failed" },
    { label: "Failed", value: data.run.failed, tone: countTone(data.run.failed), hint: "Tests that failed", section: "failed" },
    { label: "Pending", value: data.run.pending, tone: countTone(data.run.pending), hint: "Skipped / pending tests", section: "failed" },
    { label: "Todo", value: data.run.todo, tone: countTone(data.run.todo), hint: "Tests marked todo", section: "failed" },
    { label: "Static errors", value: staticCounts.error, tone: countTone(staticCounts.error), hint: "Static analysis errors", section: "static" },
    { label: "Static warnings", value: staticCounts.warning, tone: countTone(staticCounts.warning), hint: "Static analysis warnings", section: "static" },
    { label: "Static info", value: staticCounts.info, tone: countTone(staticCounts.info), hint: "Informational static findings", section: "static" },
    { label: "Legacy refs", value: data.cms.stats.filesWithLegacyRefs, tone: countTone(data.cms.stats.filesWithLegacyRefs), hint: "Files with legacy CMS references", section: "cms" },
    { label: "Untested", value: data.completeness.stats.untested, tone: countTone(data.completeness.stats.untested), hint: "Source modules with no matching unit test", section: "missing" },
    { label: "High-risk gaps", value: data.completeness.stats.highPriority, tone: countTone(data.completeness.stats.highPriority), hint: "High-priority missing-test recommendations", section: "missing" },
  ];

  return (
    <div className="space-y-4">
      <HeroRow
        kicker="Quality score"
        score={data.quality.score}
        grade={data.quality.grade}
        label={data.quality.label}
      >
        <p className="text-sm leading-relaxed">{data.quality.summary}</p>
        {data.quality.byStrategy.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.quality.byStrategy.map((s) => (
              <span key={s.strategy} className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-line text-mist">
                {s.title}
                {s.total ? ` · ${s.total}` : ""}
              </span>
            ))}
          </div>
        )}
      </HeroRow>

      <HeroRow
        kicker="CMS readiness"
        score={data.cms.score}
        grade={data.cms.grade}
        label={data.cms.label}
      >
        <p className="text-xs font-mono text-mist mb-2">
          {data.cms.fromCms} <span className="text-chalk">→</span> {data.cms.toCms}
        </p>
        <p className="text-sm leading-relaxed">{data.cms.summary}</p>
      </HeroRow>

      <HeroRow
        kicker="Test completeness"
        score={data.completeness.score}
        grade={data.completeness.grade}
        label={data.completeness.label}
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Chip>{data.completeness.stats.sourcesScanned} scanned</Chip>
          <Chip tone="pass">{data.completeness.stats.withTests} with tests</Chip>
          <Chip tone="warn">{data.completeness.stats.untested} untested</Chip>
        </div>
        <p className="text-sm leading-relaxed">{data.completeness.summary}</p>
      </HeroRow>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-2">
        {metrics.map((m) => (
          <button
            key={m.label}
            type="button"
            onClick={() => go(m.section)}
            className={`text-left border ${TONE_BORDER[m.tone]} bg-panel rounded-xl p-3 hover:brightness-110 transition`}
            title={m.hint}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-[10px] uppercase tracking-widest text-mist leading-tight">{m.label}</div>
              <InfoDot text={m.hint} />
            </div>
            <div className={`font-display text-2xl font-bold ${TONE_TEXT[m.tone]}`}>{m.value}</div>
            <div className="text-[11px] text-mist mt-2">View details →</div>
          </button>
        ))}
      </div>

      {data.quality.byStrategy.length > 0 && (
        <div className="pt-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-mist mb-3">
            Strategies deck · {data.quality.byStrategy.length} checks · {strategyErrors} errors · {strategyWarnings}{" "}
            warnings
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.quality.byStrategy.map((s) => (
              <div key={s.strategy} className="border border-line bg-panel rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-sm font-medium">{s.title}</div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${TONE_BG[countTone(s.warnings + s.errors)]}`}>
                    {s.total}
                  </span>
                </div>
                <p className="text-xs text-mist leading-relaxed">{s.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4">
        <div ref={refs.static}>
          <Accordion
            title="Static analysis issues"
            summary={`${staticCounts.error} errors, ${staticCounts.warning} warnings`}
            count={data.staticIssues.length}
            tone={countTone(staticCounts.error + staticCounts.warning)}
            open={open.static}
            onToggle={() => toggle("static")}
          >
            <IssuesTable issues={data.staticIssues} strategyTitles={strategyTitles} />
          </Accordion>
        </div>
        <div ref={refs.failed}>
          <Accordion
            title="Failed tests"
            summary={`${data.run.failed} failing tests across ${failedFiles} files`}
            count={data.run.failed}
            tone={countTone(data.run.failed)}
            open={open.failed}
            onToggle={() => toggle("failed")}
          >
            <FailedTable cases={data.run.failedCases} />
          </Accordion>
        </div>
        <div ref={refs.files}>
          <Accordion
            title="Test files"
            summary={`${data.run.testFiles.length} files · ${data.run.passed} passed · ${data.run.failed} failed`}
            count={data.run.testFiles.length}
            countLabel="files"
            tone={countTone(data.run.failed)}
            open={open.files}
            onToggle={() => toggle("files")}
          >
            <TestFilesTable files={data.run.testFiles} />
          </Accordion>
        </div>
        <div ref={refs.cms}>
          <Accordion
            title="CMS migration findings"
            summary={`${data.cms.fromCms} → ${data.cms.toCms} · ${data.cms.stats.legacyIssues} legacy · ${data.cms.stats.gapIssues} gap · ${data.cms.stats.progressSignals} progress`}
            count={cmsTotal}
            tone={countTone(cmsTotal)}
            open={open.cms}
            onToggle={() => toggle("cms")}
          >
            {data.cms.issues.length === 0 ? (
              <Empty>No CMS migration issues in this run.</Empty>
            ) : (
              <IssuesTable issues={data.cms.issues} strategyTitles={strategyTitles} />
            )}
          </Accordion>
        </div>
        <div ref={refs.missing}>
          <Accordion
            title="Missing tests / recommendations"
            summary={`${data.completeness.stats.untested} missing · ${data.completeness.stats.weakCoverage} weak coverage · ${data.completeness.stats.perfRisks} perf/loading · ${data.completeness.stats.highPriority} high priority`}
            count={data.completeness.recommendations.length}
            tone={countTone(data.completeness.recommendations.length)}
            open={open.missing}
            onToggle={() => toggle("missing")}
          >
            <RecommendationsList items={data.completeness.recommendations} />
          </Accordion>
        </div>
        <div ref={refs.coverage}>
          <Accordion
            title="Coverage"
            summary="Per-file statements, branches, functions, lines"
            count={data.coverage.length}
            countLabel="files"
            tone="pass"
            open={open.coverage}
            onToggle={() => toggle("coverage")}
          >
            <CoverageTable files={data.coverage} />
          </Accordion>
        </div>
      </div>
    </div>
  );
}

function HeroRow({
  kicker,
  score,
  grade,
  label,
  children,
}: {
  kicker: string;
  score: number;
  grade: string;
  label: string;
  children: React.ReactNode;
}) {
  const sTone = scoreTone(score);
  const gTone = gradeTone(grade);
  return (
    <div className="grid md:grid-cols-[minmax(0,11rem)_minmax(0,11rem)_1fr] gap-3">
      <div className={`border ${TONE_BORDER[sTone]} bg-panel rounded-xl p-4`}>
        <div className="text-[10px] uppercase tracking-widest text-mist mb-1">{kicker}</div>
        <div className={`font-display text-3xl font-bold ${TONE_TEXT[sTone]}`}>
          {score}
          <span className="text-lg text-mist font-medium">/100</span>
        </div>
      </div>
      <div className={`border ${TONE_BORDER[gTone]} bg-panel rounded-xl p-4`}>
        <div className="text-[10px] uppercase tracking-widest text-mist mb-1">Grade</div>
        <div className={`font-display text-3xl font-bold ${TONE_TEXT[gTone]}`}>{grade}</div>
        <div className={`text-xs mt-0.5 ${TONE_TEXT[gTone]}`}>{label}</div>
      </div>
      <div className={`border ${TONE_BORDER[sTone]} bg-panel rounded-xl p-4 flex flex-col justify-center`}>
        {children}
      </div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: Tone }) {
  const t = tone ?? "neutral";
  return (
    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${TONE_BORDER[t]} ${TONE_TEXT[t]}`}>
      {children}
    </span>
  );
}

function InfoDot({ text }: { text: string }) {
  return (
    <span
      className="h-4 w-4 rounded-full border border-line text-[10px] text-mist flex items-center justify-center shrink-0"
      title={text}
    >
      i
    </span>
  );
}

function Accordion({
  title,
  summary,
  count,
  countLabel,
  tone,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  count: number;
  countLabel?: string;
  tone: Tone;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-panel rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-panel2/50 transition-colors text-left"
      >
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-mist mt-0.5">{summary}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-mono min-w-[1.75rem] h-7 px-2 rounded-full flex items-center justify-center ${TONE_BG[tone]}`}>
            {count}
            {countLabel ? ` ${countLabel}` : ""}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`text-mist transition-transform ${open ? "" : "-rotate-90"}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && <div className="border-t border-line px-5 py-4">{children}</div>}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-mist text-center py-6">{children}</div>;
}

function IssuesTable({
  issues,
  strategyTitles = {},
}: {
  issues: StaticIssue[];
  strategyTitles?: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [strategy, setStrategy] = useState("all");
  const [page, setPage] = useState(1);

  const strategies = useMemo(
    () => Array.from(new Set(issues.map((i) => i.strategy).filter(Boolean))).sort(),
    [issues]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((i) => {
      if (severity !== "all" && i.severity !== severity) return false;
      if (strategy !== "all" && i.strategy !== strategy) return false;
      if (!q) return true;
      return (
        i.fileShort.toLowerCase().includes(q) ||
        i.rule.toLowerCase().includes(q) ||
        i.strategy.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      );
    });
  }, [issues, query, severity, strategy]);

  useEffect(() => setPage(1), [query, severity, strategy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (issues.length === 0) return <Empty>No static analysis issues.</Empty>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search file, rule, strategy, message…"
          className="flex-1 min-w-[12rem] bg-panel2 border border-line rounded-md px-3 py-1.5 text-xs outline-none focus:border-signal-pass/60"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-panel2 border border-line rounded-md px-2 py-1.5 text-[11px] font-mono text-mist"
        >
          <option value="all">All severities</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          className="bg-panel2 border border-line rounded-md px-2 py-1.5 text-[11px] font-mono text-mist"
        >
          <option value="all">All strategies</option>
          {strategies.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-mist">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">File</th>
              <th className="py-2 pr-3 font-medium">Line</th>
              <th className="py-2 pr-3 font-medium">Strategy</th>
              <th className="py-2 pr-3 font-medium">Rule</th>
              <th className="py-2 pr-3 font-medium">Severity</th>
              <th className="py-2 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {slice.map((i, idx) => (
              <tr key={`${i.file}-${i.line}-${idx}`}>
                <td className="py-2.5 pr-3 font-mono text-mist whitespace-nowrap" title={i.file}>
                  {i.fileShort}
                </td>
                <td className="py-2.5 pr-3 font-mono">{i.line ?? "—"}</td>
                <td className="py-2.5 pr-3 font-mono text-mist">{strategyTitles[i.strategy] ?? i.strategy}</td>
                <td className="py-2.5 pr-3 font-mono">{i.rule}</td>
                <td className="py-2.5 pr-3">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${TONE_BG[i.severity === "error" ? "fail" : i.severity === "warning" ? "warn" : "neutral"]}`}>
                    {i.severity}
                  </span>
                </td>
                <td className="py-2.5 text-sm">{i.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-mist">
        <span>
          {filtered.length} shown · page {page} / {pages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border border-line rounded px-2 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="border border-line rounded px-2 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function TestFilesTable({ files }: { files: TestFileResult[] }) {
  if (files.length === 0) return <Empty>No test file results in this run.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[10px] uppercase tracking-widest text-mist">
          <tr className="border-b border-line">
            <th className="py-2 pr-3 font-medium">File</th>
            <th className="py-2 pr-3 font-medium">Passed</th>
            <th className="py-2 pr-3 font-medium">Failed</th>
            <th className="py-2 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {files.map((f) => (
            <tr key={f.file}>
              <td className="py-2.5 pr-3 font-mono" title={f.file}>
                {f.fileShort}
              </td>
              <td className="py-2.5 pr-3 font-mono text-signal-pass">{f.passing}</td>
              <td className={`py-2.5 pr-3 font-mono ${f.failing ? "text-signal-fail" : "text-mist"}`}>{f.failing}</td>
              <td className="py-2.5 font-mono text-mist">{f.duration}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FailedTable({ cases }: { cases: FailedCase[] }) {
  if (cases.length === 0) return <Empty>No failing tests in this run.</Empty>;
  return (
    <div className="divide-y divide-line">
      {cases.map((c, i) => (
        <div key={`${c.file}-${c.name}-${i}`} className="py-2.5">
          <div className="text-sm">{c.name}</div>
          <div className="text-[11px] font-mono text-mist mt-0.5">{c.fileShort}</div>
        </div>
      ))}
    </div>
  );
}

function RecommendationsList({ items }: { items: CompletenessRec[] }) {
  if (items.length === 0) return <Empty>No missing-test recommendations.</Empty>;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.source} className="border border-line rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs">{item.sourceShort}</span>
            <Chip tone={item.priority === "high" ? "fail" : "warn"}>{item.priority}</Chip>
            <Chip>{item.tag}</Chip>
            <Chip>{item.kind}</Chip>
          </div>
          <p className="text-sm mt-1">{item.why}</p>
          <p className="text-xs text-mist mt-1.5">{item.suggest}</p>
          {item.exports.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.exports.map((e) => (
                <span key={e} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-line text-mist">
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function pctClass(v: number) {
  if (v >= 90) return "text-signal-pass";
  if (v >= 70) return "text-signal-warn";
  return "text-signal-fail";
}

function CoverageTable({ files }: { files: CoverageFileRow[] }) {
  const [query, setQuery] = useState("");
  const rows = files.filter((f) => f.fileShort.toLowerCase().includes(query.trim().toLowerCase()));
  if (files.length === 0) return <Empty>No coverage files in this report.</Empty>;
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter files…"
        className="w-full mb-3 bg-panel2 border border-line rounded-md px-3 py-1.5 text-xs outline-none focus:border-signal-pass/60"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-mist">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">File</th>
              <th className="py-2 pr-3 font-medium">Stmts</th>
              <th className="py-2 pr-3 font-medium">Branch</th>
              <th className="py-2 pr-3 font-medium">Funcs</th>
              <th className="py-2 font-medium">Lines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((f) => (
              <tr key={f.file}>
                <td className="py-2 pr-3 font-mono" title={f.file}>
                  {f.fileShort}
                </td>
                <td className={`py-2 pr-3 font-mono ${pctClass(f.statements)}`}>{Math.round(f.statements)}%</td>
                <td className={`py-2 pr-3 font-mono ${pctClass(f.branches)}`}>{Math.round(f.branches)}%</td>
                <td className={`py-2 pr-3 font-mono ${pctClass(f.functions)}`}>{Math.round(f.functions)}%</td>
                <td className={`py-2 font-mono ${pctClass(f.lines)}`}>{Math.round(f.lines)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
