// Kept separate from lib/auth.ts so middleware.ts — which runs on the Edge
// runtime — can import just the cookie name without dragging in Node-only APIs.
export const SESSION_COOKIE_NAME = "utc_session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
