import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReport, listReportsForClient } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });

  const report = getReport(params.reportId);
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  if (session.role !== "admin" && session.clientId !== report.clientId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Trend/comparison metadata against the previous report (section 10).
  const history = listReportsForClient(report.clientId).filter(
    (r) => r.projectId === report.projectId
  );
  const idx = history.findIndex((r) => r.id === report.id);
  const previous = idx >= 0 ? history[idx + 1] : undefined;

  return NextResponse.json({ report, previous: previous ?? null });
}
