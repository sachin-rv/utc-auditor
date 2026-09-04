"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, BarChart3, FileSearch, Sparkles } from "lucide-react";

const METRICS = [
  {
    label: "Coverage Score",
    from: 67,
    to: 91,
    suffix: "%",
    icon: BarChart3,
    color: "text-emerald-100",
  },
  {
    label: "Tests Reviewed",
    from: 0,
    to: 248,
    suffix: "",
    icon: FileSearch,
    color: "text-white/70",
  },
  {
    label: "Issues Found",
    from: 12,
    to: 3,
    suffix: "",
    icon: AlertTriangle,
    color: "text-rose-200",
  },
  {
    label: "Recommendations",
    from: 0,
    to: 18,
    suffix: "",
    icon: Sparkles,
    color: "text-amber-200",
  },
] as const;

function AnimatedValue({
  from,
  to,
  suffix,
  auditCycle,
}: {
  from: number;
  to: number;
  suffix: string;
  auditCycle: number;
}) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(from);
  const prevCycle = useRef(auditCycle);

  useEffect(() => {
    if (auditCycle === 0) {
      setDisplay(from);
      return;
    }
    if (auditCycle === prevCycle.current) return;
    prevCycle.current = auditCycle;

    if (reducedMotion) {
      setDisplay(to);
      return;
    }

    setDisplay(from);
    const controls = animate(from, to, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    return () => controls.stop();
  }, [auditCycle, from, to, reducedMotion]);

  return (
    <span className="font-display text-xl font-bold tabular-nums text-white">
      {display}
      {suffix}
    </span>
  );
}

export default function MetricsCards({ auditCycle }: { auditCycle: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            whileHover={
              reducedMotion ? undefined : { scale: 1.03, y: -2 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-sm hover:border-white/30 hover:shadow-lg hover:shadow-black/10"
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Icon className={`h-3.5 w-3.5 ${metric.color}`} aria-hidden />
              <span className="text-[11px] font-medium text-white/85">
                {metric.label}
              </span>
            </div>
            <AnimatedValue
              from={metric.from}
              to={metric.to}
              suffix={metric.suffix}
              auditCycle={auditCycle}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
