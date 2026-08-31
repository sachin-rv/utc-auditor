import { cookies } from "next/headers";
import type { UserRole } from "./api-types";
import { SESSION_COOKIE_NAME as SESSION_COOKIE } from "./constants";

export interface Session {
  accessToken: string;
  userId: string;
  role: UserRole;
  clientId?: string;
  name: string;
  email: string;
}

export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeSession(token: string): Session | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf-8")) as Session;
    if (!parsed?.accessToken || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function dashboardHome(session: Session) {
  if (session.role === "admin") return "/dashboard";
  if (session.clientId) return `/dashboard/client/${session.clientId}`;
  return "/dashboard";
}

export { SESSION_COOKIE_NAME } from "./constants";
