/**
 * This shape comes from a different, external test-quality tool (the
 * uploaded test-quality-report.json) — it is not the internal AuditReport
 * schema in lib/types.ts. Kept as its own type so the two report formats
 * don't get conflated; the viewer page renders this one directly.
 */
export interface ExternalCoverageFile {
  path: string;
  statements: { covered: number; total: number; pct: number };
  branches: { covered: number; total: number; pct: number };
  functions: { covered: number; total: number; pct: number };
  lines: { covered: number; total: number; pct: number };
}

export interface ExternalCoverage {
  available: boolean;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  files: ExternalCoverageFile[];
  rawOutput?: string;
}

export type ExternalSeverity = "error" | "warning" | "info";

export interface ExternalFinding {
  category: string;
  severity: ExternalSeverity;
  file: string;
  line?: number;
  title?: string;
  message: string;
  suggestion: string;
}

export interface ExternalScores {
  overall: number;
  coverage: number;
  isolation: number;
  mockHygiene: number;
  readability: number;
  titles: number;
  reliability: number;
  assertions: number;
  hygiene: number;
}

export interface ExternalSummary {
  testFileCount: number;
  findingCounts: { error: number; warning: number; info: number };
  strategiesRun: string[];
  grade: string;
  verdict: string;
}

export interface ExternalProject {
  root: string;
  framework: string;
  hasJest: boolean;
  hasReactTestingLibrary: boolean;
  packageManager: string;
  testScript: string;
  jestConfigPath: string;
  packageJson: { name: string; scripts: Record<string, string> };
}

export interface ExternalReport {
  project: ExternalProject;
  coverage: ExternalCoverage;
  findings: ExternalFinding[];
  scores: ExternalScores;
  summary: ExternalSummary;
  generatedAt: string;
}
