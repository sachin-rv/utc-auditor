import { NextResponse } from "next/server";
import { backendPublic, BackendError } from "@/lib/backend";

export async function GET() {
  try {
    const data = await backendPublic<{ setupRequired: boolean }>("/auth/setup-status");
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof BackendError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ setupRequired: false });
  }
}
