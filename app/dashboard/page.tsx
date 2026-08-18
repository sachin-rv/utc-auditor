import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listClients, listProjectsForClient, listReportsForClient } from "@/lib/db";
import StatusPill from "@/components/StatusPill";

function avgCoverage(c: { statements: number; branches: number; functions: number; lines: number }) {
  return Math.round((c.statements + c.branches + c.functions + c.lines) / 4);
}

function scoreColor(score: number) {
  if (score < 60) return "text-signal-fail";
  if (score < 80) return "text-signal-warn";
  if (score < 90) return "text-signal-info";
  return "text-signal-pass";
}

function timeAgo(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function AdminClientsPage() {
  const session = getSession();
  if (!session) redirect("/login");
  if (session.role === "client") redirect(`/dashboard/client/${session.clientId}`);

  const clients = listClients().map((c) => {
    const projects = listProjectsForClient(c.id);
    const reports = listReportsForClient(c.id);
    const latest = reports[0];
    return { ...c, projectCount: projects.length, latest };
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
        <div className="text-xs text-mist font-mono">{clients.length} client{clients.length === 1 ? "" : "s"}</div>
      </div>

      <div className="grid gap-4">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/client/${c.id}`}
            className="group border border-line bg-panel rounded-xl p-5 flex items-center justify-between hover:border-signal-pass/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-panel2 border border-line flex items-center justify-center font-display font-bold text-mist group-hover:text-signal-pass group-hover:border-signal-pass/30 transition-colors">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-mist mt-0.5">
                  {c.projectCount} project{c.projectCount === 1 ? "" : "s"}
                  {c.latest ? ` · last audit ${timeAgo(c.latest.timestamp)}` : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              {c.latest ? (
                <>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-mist">Coverage</div>
                    <div className="font-mono text-sm">{avgCoverage(c.latest.coverage)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-mist">Score</div>
                    <div className={`font-mono text-sm font-bold ${scoreColor(c.latest.overallScore)}`}>
                      {c.latest.overallScore}
                    </div>
                  </div>
                  <StatusPill status={c.latest.executionStatus} />
                </>
              ) : (
                <StatusPill status="no_reports" />
              )}
              <span className="text-mist group-hover:text-signal-pass transition-colors">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
