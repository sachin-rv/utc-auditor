"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="ui-card px-6 py-12 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-signal-fail mb-2">API error</div>
      <h1 className="font-display text-2xl font-bold mb-2">Could not load this view</h1>
      <p className="text-sm text-mist mb-6">{error.message || "The UTC Auditor API returned an error."}</p>
      <button
        onClick={reset}
        className="ui-btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
