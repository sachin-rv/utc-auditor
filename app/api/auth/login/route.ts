import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, getClient } from "@/lib/db";
import { encodeSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = findUserByEmail(email ?? "");
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const clientName = user.clientId ? getClient(user.clientId)?.name : undefined;
  const token = encodeSession({
    userId: user.id,
    role: user.role,
    clientId: user.clientId,
    name: user.name,
  });

  const res = NextResponse.json({
    role: user.role,
    name: user.name,
    clientId: user.clientId,
    clientName,
  });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
