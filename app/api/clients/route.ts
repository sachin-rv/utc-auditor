import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listClients, listReportsForClient, listProjectsForClient } from "@/lib/db";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });

  const clients = listClients().filter(
    (c) => session.role === "admin" || c.id === session.clientId
  );

  const summarized = clients.map((c) => {
    const reports = listReportsForClient(c.id);
    const latest = reports[0];
    return {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      projectCount: listProjectsForClient(c.id).length,
      latestScore: latest?.overallScore ?? null,
      latestCoverage: latest ? avgCoverage(latest.coverage) : null,
      latestAuditAt: latest?.timestamp ?? null,
      status: latest ? latest.executionStatus : "no_reports",
    };
  });

  return NextResponse.json({ clients: summarized });
}

function avgCoverage(c: { statements: number; branches: number; functions: number; lines: number }) {
  return Math.round((c.statements + c.branches + c.functions + c.lines) / 4);
}
