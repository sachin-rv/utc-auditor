"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BarChart3,
  FolderGit2,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";

const REPOS = [
  { name: "acme/web-app", status: "pass" as const },
  { name: "acme/api-gateway", status: "warn" as const },
  { name: "acme/design-system", status: "pass" as const },
];

const SPARKLINE_POINTS = "4,28 12,22 20,24 28,16 36,18 44,10 52,12 60,6";

export default function DashboardPreview() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 200,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        reducedMotion
          ? undefined
          : { y: [0, -6, 0] }
      }
      transition={
        reducedMotion
          ? undefined
          : { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }
      style={
        reducedMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 800,
            }
      }
      className="rounded-xl border border-white/20 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-md"
      aria-hidden
    >
      <div className="flex h-[180px] overflow-hidden rounded-xl">
        {/* Sidebar */}
        <div className="flex w-9 shrink-0 flex-col items-center gap-2.5 border-r border-white/10 bg-black/10 py-2.5">
          <LayoutDashboard className="h-3.5 w-3.5 text-white" />
          <FolderGit2 className="h-3.5 w-3.5 text-white/40" />
          <BarChart3 className="h-3.5 w-3.5 text-white/40" />
          <Settings className="h-3.5 w-3.5 text-white/40" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-2.5">
          {/* Search bar */}
          <div className="mb-2 flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1">
            <Search className="h-3 w-3 text-white/70" />
            <span className="text-[10px] text-white/70">Search audits...</span>
          </div>

          <div className="mb-2 flex gap-2">
            {/* Audit report card */}
            <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="text-[9px] font-medium uppercase tracking-wider text-white/75">
                Audit Report
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-white">
                acme/web-app
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-emerald-400/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-100">
                  B+
                </span>
                <span className="text-[9px] text-white/75">86 quality score</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="w-[4.5rem] rounded-lg border border-white/10 bg-white/5 p-1.5">
              <p className="text-[8px] text-white/75">Trend</p>
              <svg viewBox="0 0 64 32" className="mt-0.5 h-8 w-full text-white">
                <polyline
                  points={SPARKLINE_POINTS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Repo list */}
          <div className="space-y-0.5">
            <p className="text-[9px] font-medium uppercase tracking-wider text-white/75">
              Recent
            </p>
            {REPOS.map((repo) => (
              <div
                key={repo.name}
                className="flex items-center justify-between rounded-md bg-white/[0.05] px-2 py-0.5"
              >
                <span className="truncate text-[10px] text-white/85">{repo.name}</span>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    repo.status === "pass" ? "bg-emerald-300" : "bg-amber-300"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
