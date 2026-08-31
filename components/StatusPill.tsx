const STYLES: Record<string, { dot: string; text: string; label: string }> = {
  success: { dot: "bg-signal-pass", text: "text-signal-pass", label: "Passing" },
  pass: { dot: "bg-signal-pass", text: "text-signal-pass", label: "Passing" },
  active: { dot: "bg-signal-pass", text: "text-signal-pass", label: "Active" },
  completed_with_errors: { dot: "bg-signal-warn", text: "text-signal-warn", label: "Errors" },
  warning: { dot: "bg-signal-warn", text: "text-signal-warn", label: "Warning" },
  failed: { dot: "bg-signal-fail", text: "text-signal-fail", label: "Failed" },
  fail: { dot: "bg-signal-fail", text: "text-signal-fail", label: "Failed" },
  no_reports: { dot: "bg-mist", text: "text-mist", label: "No audits yet" },
};

export default function StatusPill({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.no_reports;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 bg-panel2 border border-line ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
