import { cookies } from "next/headers";
import type { Role } from "./types";
import { SESSION_COOKIE_NAME as SESSION_COOKIE } from "./constants";

export interface Session {
  userId: string;
  role: Role;
  clientId?: string;
  name: string;
}

// Demo-grade session encoding. In production this would be a signed/opaque
// token issued by the chosen auth provider (section 20: "Authentication
// provider — TBD").
export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeSession(token: string): Session | null {
  try {
    return JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function requireSession(): Session {
  const session = getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export { SESSION_COOKIE_NAME } from "./constants";

// Section 13: "scoped project credential/token" used by the npm package to
// authenticate audit submissions. Demo tokens live alongside the seed data;
// a real deployment would issue/rotate these via the backend.
const PROJECT_TOKENS: Record<string, { projectId: string; clientId: string }> = {
  "utc_demo_token_atlas": { projectId: "proj_atlas_web", clientId: "client_northwind" },
  "utc_demo_token_northwind_docs": { projectId: "proj_northwind_docs", clientId: "client_northwind" },
  "utc_demo_token_horizon": { projectId: "proj_horizon_app", clientId: "client_horizon" },
};

export function authenticateProjectToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  return PROJECT_TOKENS[token] ?? null;
}
