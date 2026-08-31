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
