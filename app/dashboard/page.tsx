import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/backend";
import { normalizeClients, normalizeProjects } from "@/lib/api-normalize";
import { loadProjectBoardItems } from "@/lib/load-project-reports";
import ClientListPanel, { ClientRow } from "@/components/ClientListPanel";
import CreateClientButton from "@/components/CreateClientButton";
import CreateUserButton from "@/components/CreateUserButton";
import ProjectsBoard from "@/components/ProjectsBoard";
import PageEnter from "@/components/PageEnter";

export default async function DashboardPage() {
  const session = getSession();
  if (!session) redirect("/login");

  if (session.role === "client") {
    if (session.clientId) redirect(`/dashboard/client/${session.clientId}`);
    const projects = normalizeProjects(await apiGet<unknown>("/projects"));
    const items = await loadProjectBoardItems(projects);

    return (
      <PageEnter>
        <div>
          <div className="mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-signal-pass mb-1">Your projects</div>
            <h1 className="font-display text-3xl font-bold">Audit Console</h1>
          </div>
          <ProjectsBoard clientId={projects[0]?.clientId ?? ""} isAdmin={false} items={items} />
        </div>
      </PageEnter>
    );
  }

  const clients = normalizeClients(await apiGet<unknown>("/clients"));
  const rows: ClientRow[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    contactEmail: c.contactEmail,
    projectCount: c.projectCount ?? 0,
    status: c.status,
  }));

  return (
    <PageEnter>
      <div>
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-signal-pass mb-1">Registered clients</div>
            <h1 className="font-display text-3xl font-bold">Audit Console</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-mist font-mono">
              {rows.length} client{rows.length === 1 ? "" : "s"}
            </div>
            <CreateClientButton />
            <CreateUserButton clients={rows.map((c) => ({ id: c.id, name: c.name }))} />
          </div>
        </div>

        <ClientListPanel clients={rows} />
      </div>
    </PageEnter>
  );
}
