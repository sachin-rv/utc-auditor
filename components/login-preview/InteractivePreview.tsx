"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import AuditSimulation from "./AuditSimulation";
import DashboardPreview from "./DashboardPreview";
import MetricsCards from "./MetricsCards";

export default function InteractivePreview() {
  const reducedMotion = useReducedMotion();
  const [auditCycle, setAuditCycle] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const spotlightX = useSpring(cursor.x, { stiffness: 150, damping: 25 });
  const spotlightY = useSpring(cursor.y, { stiffness: 150, damping: 25 });

  const handleAuditComplete = useCallback(() => {
    setAuditCycle((c) => c + 1);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div
      className="relative hidden flex-1 overflow-hidden rounded-t-2xl md:flex md:rounded-t-none md:rounded-r-3xl"
      aria-label="Product preview"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#12b8a8] via-[#0d8f7f] to-[#0a6b62] dark:from-[#0d8f7f] dark:via-[#0a4f48] dark:to-[#071110]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.35),transparent_45%)]" />

      {!reducedMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-signal-pass/25 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -right-10 bottom-16 h-48 w-48 rounded-full bg-signal-info/20 blur-3xl"
            animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute z-10 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12]"
          style={{
            left: spotlightX,
            top: spotlightY,
            background:
              "radial-gradient(circle, rgb(var(--c-pass) / 0.5) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative z-20 flex w-full flex-col justify-center p-5 sm:p-6 md:p-8">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            <div>
              <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                Coverage, quality, and migration — in one console.
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/90">
                Sign in to review Jest audits, findings, and recommendations for your
                React and Next.js suites.
              </p>
            </div>

            <AuditSimulation onComplete={handleAuditComplete} />
            <MetricsCards auditCycle={auditCycle} />
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
