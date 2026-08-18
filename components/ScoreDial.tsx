function bandColor(score: number) {
  if (score < 60) return "#FF6B5E";
  if (score < 80) return "#F5B942";
  if (score < 90) return "#5FA8FF";
  return "#3ED598";
}

function bandLabel(score: number) {
  if (score < 60) return "Critical improvement area";
  if (score < 80) return "Needs improvement";
  if (score < 90) return "Good baseline";
  return "Strong coverage";
}

export default function ScoreDial({
  score,
  size = 156,
  label = "Overall Score",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;
  const color = bandColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#272C34"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 700ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold tabular-nums" style={{ color }}>
            {Math.round(score)}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-mist mt-0.5">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-mist">{label}</div>
        <div className="text-sm font-medium mt-0.5" style={{ color }}>
          {bandLabel(score)}
        </div>
      </div>
    </div>
  );
}
