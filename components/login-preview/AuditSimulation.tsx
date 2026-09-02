"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

const STAGES = [
  "Scanning repository...",
  "Analyzing test coverage...",
  "Checking accessibility...",
  "Detecting flaky tests...",
  "Generating AI recommendations...",
  "Audit Complete ✓",
] as const;

const STAGE_DURATION_MS = 2500;
const COMPLETE_PAUSE_MS = 2000;

export default function AuditSimulation({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState(0);
  const completedRef = useRef(false);

  const progress = ((stage + 1) / STAGES.length) * 100;
  const isComplete = stage === STAGES.length - 1;

  useEffect(() => {
    if (!isComplete) {
      completedRef.current = false;
      const timeout = setTimeout(() => setStage((s) => s + 1), STAGE_DURATION_MS);
      return () => clearTimeout(timeout);
    }

    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }

    const timeout = setTimeout(() => setStage(0), COMPLETE_PAUSE_MS);
    return () => clearTimeout(timeout);
  }, [stage, isComplete, onComplete]);

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2.5">
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-100" aria-hidden />
        ) : (
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin text-white/80"
            aria-hidden
          />
        )}
        <div className="min-h-[20px] flex-1 overflow-hidden" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
              className="text-sm font-medium text-white/90"
            >
              {STAGES[stage]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-white/90"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: reducedMotion ? 0 : 0.4,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}
