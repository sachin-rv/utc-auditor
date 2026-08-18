const STYLES: Record<string, { dot: string; text: string; label: string }> = {
  success: { dot: "bg-signal-pass", text: "text-signal-pass", label: "Passing" },
  completed_with_errors: { dot: "bg-signal-warn", text: "text-signal-warn", label: "Errors" },
  failed: { dot: "bg-signal-fail", text: "text-signal-fail", label: "Failed" },
  no_reports: { dot: "bg-mist", text: "text-mist", label: "No audits yet" },
};

export default function StatusPill({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.no_reports;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
