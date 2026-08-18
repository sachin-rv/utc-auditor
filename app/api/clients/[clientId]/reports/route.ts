import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient, listProjectsForClient, listReportsForClient } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });

  // Section 13: client users can only access their own client's reports.
  if (session.role !== "admin" && session.clientId !== params.clientId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const client = getClient(params.clientId);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const projects = listProjectsForClient(params.clientId);
  const reports = listReportsForClient(params.clientId);

  return NextResponse.json({ client, projects, reports });
}
