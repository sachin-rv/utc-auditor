"use client";

import { useState } from "react";

export default function RawOutputViewer({ output }: { output: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-line bg-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-2.5 bg-panel2/40 border-b border-line text-sm font-medium flex items-center justify-between hover:bg-panel2/70 transition-colors"
      >
        <span>Raw Jest output</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-mist transition-transform ${open ? "" : "-rotate-90"}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <pre className="px-5 py-4 text-[11px] font-mono text-mist overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {output}
        </pre>
      )}
    </div>
  );
}
