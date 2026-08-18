// Kept separate from lib/auth.ts and lib/db.ts (which pull in Node's `fs`)
// so middleware.ts — which runs on the Edge runtime — can import just the
// cookie name without dragging in Node-only APIs.
export const SESSION_COOKIE_NAME = "utc_session";
