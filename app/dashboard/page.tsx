import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listClients, listProjectsForClient, listReportsForClient } from "@/lib/db";
import ClientListPanel, { ClientRow } from "@/components/ClientListPanel";

function avgCoverage(c: { statements: number; branches: number; functions: number; lines: number }) {
  return Math.round((c.statements + c.branches + c.functions + c.lines) / 4);
}

export default function AdminClientsPage() {
  const session = getSession();
  if (!session) redirect("/login");
  if (session.role === "client") redirect(`/dashboard/client/${session.clientId}`);

  const rows: ClientRow[] = listClients().map((c) => {
    const projects = listProjectsForClient(c.id);
    const reports = listReportsForClient(c.id);
    const latest = reports[0];
    return {
      id: c.id,
      name: c.name,
      projectCount: projects.length,
      latestScore: latest?.overallScore ?? null,
      latestCoverage: latest ? avgCoverage(latest.coverage) : null,
      latestAuditAt: latest?.timestamp ?? null,
      status: latest ? latest.executionStatus : "no_reports",
    };
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-signal-pass mb-1">
            Registered clients
          </div>
          <h1 className="font-display text-3xl font-bold">Audit Console</h1>
        </div>
        <div className="text-xs text-mist font-mono">{rows.length} client{rows.length === 1 ? "" : "s"}</div>
      </div>

      <ClientListPanel clients={rows} />
    </div>
  );
}
