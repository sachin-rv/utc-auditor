import { NextRequest, NextResponse } from "next/server";
import { encodeSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { backendPublic, BackendError } from "@/lib/backend";
import { SESSION_MAX_AGE } from "@/lib/constants";
import type { AuthResponse } from "@/lib/api-types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const data = await backendPublic<AuthResponse>("/auth/setup", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const token = encodeSession({
      accessToken: data.accessToken,
      userId: data.user.id,
      role: data.user.role,
      clientId: data.user.clientId ?? undefined,
      name: data.user.name,
      email: data.user.email,
    });

    const res = NextResponse.json({
      role: data.user.role,
      name: data.user.name,
      clientId: data.user.clientId,
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (e) {
    if (e instanceof BackendError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Setup failed." }, { status: 502 });
  }
}
