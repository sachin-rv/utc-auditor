import type { ExternalCoverageFile, ExternalFinding } from "./externalReport";

export type Role = "admin" | "client";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  clientId?: string; // present for role === "client"
  password: string; // demo-only plaintext; replace with hashed auth in production
}

export interface ClientRecord {
  id: string;
  name: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  clientId: string;
  name: string;
  appType: "react" | "nextjs";
  repo: string;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  ruleId: string;
  ruleVersion: string;
  category: string;
  title: string;
  severity: Severity;
  detail: string;
  recommendation: string;
  file?: string;
}

export interface CoverageMetrics {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TestExecutionSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  pending: number;
  durationMs: number;
}

export interface DependencyFinding {
  package: string;
  kind: "unused_in_source" | "referenced_missing_from_manifest" | "migration_residue";
  detail: string;
}

export interface MigrationFinding {
  area: "cms" | "search" | "ab_testing" | "rendering";
  packages: string[];
  status: "active" | "inconsistent" | "likely_obsolete";
  detail: string;
}

// Richer, per-file test-quality breakdown — same shape family as the
// external report format (lib/externalReport.ts / test-quality-report.json)
// so a generated AuditReport can carry the same level of detail and be
// rendered with the same viewer components.
export interface DetailedTestQuality {
  scores: {
    overall: number;
    coverage: number;
    isolation: number;
    mockHygiene: number;
    readability: number;
    titles: number;
    reliability: number;
    assertions: number;
    hygiene: number;
  };
  grade: string;
  verdict: string;
  strategiesRun: string[];
  testFileCount: number;
  findingCounts: { error: number; warning: number; info: number };
  files: ExternalCoverageFile[];
  qualityFindings: ExternalFinding[];
  rawOutput: string;
}

export interface AuditReport {
  id: string;
  clientId: string;
  projectId: string;
  auditExecutionId: string;
  timestamp: string;
  trigger: "production_build" | "scheduled" | "manual";
  buildId?: string;
  auditorVersion: string;
  ruleSetVersion: string;
  jestVersion?: string;
  overallScore: number; // 0-100
  coverage: CoverageMetrics;
  testExecution: TestExecutionSummary;
  findings: Finding[];
  dependencyFindings: DependencyFinding[];
  migrationFindings: MigrationFinding[];
  recommendations: string[];
  executionStatus: "success" | "completed_with_errors" | "failed";
  errors: string[];
  durationMs: number;
  detailed?: DetailedTestQuality;
}

export interface DB {
  users: UserRecord[];
  clients: ClientRecord[];
  projects: ProjectRecord[];
  reports: AuditReport[];
}
