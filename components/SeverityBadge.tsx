import type { Severity } from "@/lib/types";

const STYLES: Record<Severity, string> = {
  critical: "bg-signal-fail/15 text-signal-fail border-signal-fail/30",
  high: "bg-signal-high/15 text-signal-high border-signal-high/30",
  medium: "bg-signal-warn/15 text-signal-warn border-signal-warn/30",
  low: "bg-signal-info/15 text-signal-info border-signal-info/30",
  info: "bg-mist/15 text-mist border-mist/30",
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
