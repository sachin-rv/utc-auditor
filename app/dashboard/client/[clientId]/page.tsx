import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getClient, listProjectsForClient, listReportsForClient } from "@/lib/db";
import ScoreDial from "@/components/ScoreDial";
import CoverageBars from "@/components/CoverageBars";
import TrendChart, { TrendPoint } from "@/components/TrendChart";
import StatusPill from "@/components/StatusPill";
import ReportHistoryList, { ReportRow } from "@/components/ReportHistoryList";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClientHistoryPage({ params }: { params: { clientId: string } }) {
  const session = getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin" && session.clientId !== params.clientId) redirect("/dashboard");

  const client = getClient(params.clientId);
  if (!client) notFound();

  const projects = listProjectsForClient(params.clientId);
  const allReports = listReportsForClient(params.clientId);

  return (
    <div>
      {session.role === "admin" && (
        <Link href="/dashboard" className="text-xs text-mist hover:text-chalk font-mono mb-4 inline-block">
          ← All clients
        </Link>
      )}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-signal-pass mb-1">Client</div>
        <h1 className="font-display text-3xl font-bold">{client.name}</h1>
      </div>

      <div className="space-y-10">
        {projects.map((project) => {
          const reports = allReports
            .filter((r) => r.projectId === project.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const latest = reports[0];
          const trend: TrendPoint[] = [...reports]
            .reverse()
            .map((r) => ({
              date: fmtDate(r.timestamp),
              score: r.overallScore,
              statements: r.coverage.statements,
              branches: r.coverage.branches,
            }));

          return (
            <section key={project.id} className="border border-line bg-panel rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel2/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-lg">{project.name}</h2>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-mist border border-line rounded px-1.5 py-0.5">
                      {project.appType}
                    </span>
                  </div>
                  <div className="text-xs text-mist font-mono mt-0.5">{project.repo}</div>
                </div>
                {latest && <StatusPill status={latest.executionStatus} />}
              </div>

              {!latest ? (
                <div className="px-6 py-10 text-center text-mist text-sm">
                  No audit reports submitted for this project yet.
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-[auto_1fr_1fr] gap-8 px-6 py-6 border-b border-line">
                    <ScoreDial score={latest.overallScore} />
                    <div>
                      <div className="text-xs uppercase tracking-widest text-mist mb-3">Latest coverage</div>
                      <CoverageBars coverage={latest.coverage} />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-mist mb-3">
                        Score &amp; coverage trend
                      </div>
                      {trend.length > 1 ? (
                        <TrendChart data={trend} />
                      ) : (
                        <div className="text-sm text-mist py-8 text-center">
                          Need more than one report to chart a trend.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="text-xs uppercase tracking-widest text-mist mb-3">
                      Report history ({reports.length})
                    </div>
                    <ReportHistoryList
                      clientId={client.id}
                      reports={reports.map(
                        (r): ReportRow => ({
                          id: r.id,
                          timestamp: r.timestamp,
                          trigger: r.trigger,
                          overallScore: r.overallScore,
                          passed: r.testExecution.passed,
                          total: r.testExecution.total,
                          criticalCount: r.findings.filter((f) => f.severity === "critical").length,
                          highCount: r.findings.filter((f) => f.severity === "high").length,
                          hasDetailed: !!r.detailed,
                          grade: r.detailed?.grade,
                        })
                      )}
                    />
                  </div>
                </>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
