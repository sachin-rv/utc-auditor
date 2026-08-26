export type IssueSeverity = "error" | "warning" | "info";
export type Tone = "pass" | "warn" | "fail" | "neutral";

export interface StaticIssue {
  file: string;
  fileShort: string;
  line: number | null;
  rule: string;
  strategy: string;
  message: string;
  severity: IssueSeverity;
}

export interface FailedCase {
  file: string;
  fileShort: string;
  name: string;
  status: string;
}

export interface QualityStrategy {
  strategy: string;
  title: string;
  blurb: string;
  errors: number;
  warnings: number;
  infos: number;
  total: number;
}

export interface CoverageFileRow {
  file: string;
  fileShort: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TestFileResult {
  file: string;
  fileShort: string;
  passing: number;
  failing: number;
  duration: number;
  failureMessages: string[];
}

export interface CompletenessRec {
  source: string;
  sourceShort: string;
  kind: string;
  priority: string;
  tag: string;
  why: string;
  suggest: string;
  exports: string[];
}

export interface ScoreBlock {
  score: number;
  grade: string;
  label: string;
  summary: string;
}

export interface UserReportView {
  quality: ScoreBlock & { byStrategy: QualityStrategy[] };
  cms: ScoreBlock & {
    fromCms: string;
    toCms: string;
    stats: {
      filesScanned: number;
      filesWithLegacyRefs: number;
      legacyIssues: number;
      gapIssues: number;
      progressSignals: number;
    };
    issues: StaticIssue[];
  };
  completeness: ScoreBlock & {
    stats: {
      sourcesScanned: number;
      withTests: number;
      untested: number;
      weakCoverage: number;
      perfRisks: number;
      recommendations: number;
      highPriority: number;
    };
    recommendations: CompletenessRec[];
  };
  run: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    todo: number;
    failedCases: FailedCase[];
    testFiles: TestFileResult[];
  };
  staticIssues: StaticIssue[];
  coverage: CoverageFileRow[];
  coverageTotals: { statements: number; branches: number; functions: number; lines: number };
}

function rec(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function num(v: unknown, fallback = 0) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function str(v: unknown, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

export function shortPath(file: string) {
  const n = file.replace(/\\/g, "/");
  const markers = ["/nextjs-sample-app/", "/__tests__/", "/app/", "/components/", "/utils/"];
  for (const m of markers) {
    const i = n.lastIndexOf(m);
    if (i >= 0) {
      if (m === "/nextjs-sample-app/") return n.slice(i + m.length);
      return n.slice(i + 1);
    }
  }
  return n.split("/").slice(-3).join("/");
}

export function unwrapReportJson(json: Record<string, unknown> | undefined | null): Record<string, unknown> | null {
  if (!json) return null;
  if (isUserReport(json)) return json;
  const nested = rec(json.reportJson);
  if (isUserReport(nested)) return nested;
  const payload = rec(json.payload);
  if (isUserReport(payload)) return payload;
  return json;
}

export function isUserReport(json: Record<string, unknown> | undefined | null): boolean {
  if (!json) return false;
  const quality = rec(json.quality);
  const run = rec(json.runSummary);
  return (
    typeof quality.score === "number" ||
    typeof run.numTotalTests === "number" ||
    Array.isArray(json.staticIssues) ||
    Array.isArray(json.coverage)
  );
}

function asIssue(row: Record<string, unknown>): StaticIssue {
  const sev = str(row.severity, "info");
  return {
    file: str(row.file),
    fileShort: shortPath(str(row.file)),
    line: typeof row.line === "number" ? row.line : null,
    rule: str(row.rule),
    strategy: str(row.strategy),
    message: str(row.message),
    severity: sev === "error" || sev === "warning" ? sev : "info",
  };
}

function avgMetric(files: CoverageFileRow[], key: keyof Pick<CoverageFileRow, "statements" | "branches" | "functions" | "lines">) {
  if (files.length === 0) return 0;
  const sum = files.reduce((acc, f) => acc + f[key], 0);
  return Math.round(sum / files.length);
}

export function parseUserReport(json: Record<string, unknown> | undefined | null): UserReportView | null {
  const unwrapped = unwrapReportJson(json);
  if (!unwrapped || !isUserReport(unwrapped)) return null;
  const j = unwrapped;
  const quality = rec(j.quality);
  const run = rec(j.runSummary);
  const cmsRoot = rec(j.cmsMigration);
  const readiness = rec(cmsRoot.readiness);
  const completenessRoot = rec(j.testCompleteness);
  const completeness = rec(completenessRoot.completeness);
  const cmsStats = rec(readiness.stats);
  const compStats = rec(completeness.stats);
  const fromCms = rec(readiness.fromCms);
  const toCms = rec(readiness.toCms);

  const staticIssues = (Array.isArray(j.staticIssues) ? j.staticIssues : []).map((r) => asIssue(rec(r)));
  const cmsIssues = (Array.isArray(cmsRoot.issues) ? cmsRoot.issues : []).map((r) => asIssue(rec(r)));

  const failedCases: FailedCase[] = [];
  const cases = Array.isArray(run.failedCases)
    ? run.failedCases
    : Array.isArray(run.testCases)
      ? run.testCases
      : [];
  for (const c of cases) {
    const row = rec(c);
    const status = str(row.status, "passed");
    if (status === "passed") continue;
    failedCases.push({
      file: str(row.file),
      fileShort: shortPath(str(row.file)),
      name: str(row.name),
      status,
    });
  }

  const coverage = (Array.isArray(j.coverage) ? j.coverage : []).map((r) => {
    const row = rec(r);
    const file = str(row.file);
    return {
      file,
      fileShort: shortPath(file),
      statements: num(row.statements),
      branches: num(row.branches),
      functions: num(row.functions),
      lines: num(row.lines),
    };
  });

  const testFiles: TestFileResult[] = (Array.isArray(run.testResults) ? run.testResults : []).map((r) => {
    const row = rec(r);
    const file = str(row.testFilePath ?? row.file);
    return {
      file,
      fileShort: shortPath(file),
      passing: num(row.numPassingTests),
      failing: num(row.numFailingTests),
      duration: num(row.duration),
      failureMessages: Array.isArray(row.failureMessages) ? row.failureMessages.map(String) : [],
    };
  });

  const byStrategy: QualityStrategy[] = (Array.isArray(quality.byStrategy) ? quality.byStrategy : []).map((r) => {
    const row = rec(r);
    return {
      strategy: str(row.strategy),
      title: str(row.title),
      blurb: str(row.blurb),
      errors: num(row.errors),
      warnings: num(row.warnings),
      infos: num(row.infos),
      total: num(row.total),
    };
  });

  const recommendations: CompletenessRec[] = (
    Array.isArray(completenessRoot.recommendations) ? completenessRoot.recommendations : []
  ).map((r) => {
    const row = rec(r);
    const source = str(row.source);
    return {
      source,
      sourceShort: shortPath(source),
      kind: str(row.kind),
      priority: str(row.priority),
      tag: str(row.tag),
      why: str(row.why),
      suggest: str(row.suggest),
      exports: Array.isArray(row.exports) ? row.exports.map(String) : [],
    };
  });

  return {
    quality: {
      score: num(quality.score),
      grade: str(quality.grade),
      label: str(quality.label),
      summary: str(quality.summary),
      byStrategy,
    },
    cms: {
      score: num(readiness.score),
      grade: str(readiness.grade),
      label: str(readiness.label),
      summary: str(readiness.summary),
      fromCms: str(fromCms.displayName, "source CMS"),
      toCms: str(toCms.displayName, "target CMS"),
      stats: {
        filesScanned: num(cmsStats.filesScanned),
        filesWithLegacyRefs: num(cmsStats.filesWithLegacyRefs),
        legacyIssues: num(cmsStats.legacyIssues),
        gapIssues: num(cmsStats.gapIssues),
        progressSignals: num(cmsStats.progressSignals),
      },
      issues: cmsIssues,
    },
    completeness: {
      score: num(completeness.score),
      grade: str(completeness.grade),
      label: str(completeness.label),
      summary: str(completeness.summary),
      stats: {
        sourcesScanned: num(compStats.sourcesScanned),
        withTests: num(compStats.withTests),
        untested: num(compStats.untested),
        weakCoverage: num(compStats.weakCoverage),
        perfRisks: num(compStats.perfRisks),
        recommendations: num(compStats.recommendations),
        highPriority: num(compStats.highPriority),
      },
      recommendations,
    },
    run: {
      total: num(run.numTotalTests),
      passed: num(run.numPassedTests),
      failed: num(run.numFailedTests),
      pending: num(run.numPendingTests),
      todo: num(run.numTodoTests),
      failedCases,
      testFiles,
    },
    staticIssues,
    coverage,
    coverageTotals: {
      statements: avgMetric(coverage, "statements"),
      branches: avgMetric(coverage, "branches"),
      functions: avgMetric(coverage, "functions"),
      lines: avgMetric(coverage, "lines"),
    },
  };
}

export function gradeTone(grade: string): Tone {
  const g = (grade || "").charAt(0).toUpperCase();
  if (g === "A" || g === "B") return "pass";
  if (g === "C") return "warn";
  return "fail";
}

export function scoreTone(score: number): Tone {
  if (score >= 90) return "pass";
  if (score >= 70) return "warn";
  return "fail";
}

export function countTone(n: number): Tone {
  if (n <= 0) return "pass";
  if (n >= 5) return "fail";
  return "warn";
}
