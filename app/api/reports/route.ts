import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateProjectToken } from "@/lib/auth";
import { clientOwnsProject, insertReport } from "@/lib/db";

// Section 12: "Validate submitted report schema and reject malformed or
// unauthorized submissions." This mirrors the AuditReport shape in lib/types.ts.
const findingSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  ruleVersion: z.string(),
  category: z.string(),
  title: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  detail: z.string(),
  recommendation: z.string(),
  file: z.string().optional(),
});

const reportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  auditExecutionId: z.string(),
  timestamp: z.string(),
  trigger: z.enum(["production_build", "scheduled", "manual"]),
  buildId: z.string().optional(),
  auditorVersion: z.string(),
  ruleSetVersion: z.string(),
  jestVersion: z.string().optional(),
  overallScore: z.number().min(0).max(100),
  coverage: z.object({
    statements: z.number(),
    branches: z.number(),
    functions: z.number(),
    lines: z.number(),
  }),
  testExecution: z.object({
    total: z.number(),
    passed: z.number(),
    failed: z.number(),
    skipped: z.number(),
    pending: z.number(),
    durationMs: z.number(),
  }),
  findings: z.array(findingSchema),
  dependencyFindings: z.array(
    z.object({
      package: z.string(),
      kind: z.enum(["unused_in_source", "referenced_missing_from_manifest", "migration_residue"]),
      detail: z.string(),
    })
  ),
  migrationFindings: z.array(
    z.object({
      area: z.enum(["cms", "search", "ab_testing", "rendering"]),
      packages: z.array(z.string()),
      status: z.enum(["active", "inconsistent", "likely_obsolete"]),
      detail: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
  executionStatus: z.enum(["success", "completed_with_errors", "failed"]),
  errors: z.array(z.string()),
  durationMs: z.number(),
});

export async function POST(req: NextRequest) {
  // Section 13: the package authenticates with a scoped project token, not
  // the dashboard's user session.
  const auth = authenticateProjectToken(req.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Invalid or missing project credential." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Report schema validation failed.", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  if (parsed.data.projectId !== auth.projectId) {
    return NextResponse.json(
      { error: "Project credential does not authorize this projectId." },
      { status: 403 }
    );
  }
  if (!clientOwnsProject(auth.clientId, parsed.data.projectId)) {
    return NextResponse.json({ error: "Unknown project." }, { status: 403 });
  }

  const report = insertReport({ ...parsed.data, clientId: auth.clientId });

  return NextResponse.json(
    { status: "accepted", reportId: report.id, auditExecutionId: report.auditExecutionId },
    { status: 201 }
  );
}
