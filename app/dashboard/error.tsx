"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="border border-line bg-panel rounded-xl px-6 py-12 text-center">
      <div className="text-xs font-mono uppercase tracking-widest text-signal-fail mb-2">API error</div>
      <h1 className="font-display text-2xl font-bold mb-2">Could not load this view</h1>
      <p className="text-sm text-mist mb-6">{error.message || "The UTC Auditor API returned an error."}</p>
      <button
        onClick={reset}
        className="text-xs font-semibold bg-signal-pass text-onaccent rounded-md px-3 py-2 hover:brightness-110 transition"
      >
        Try again
      </button>
    </div>
  );
}
