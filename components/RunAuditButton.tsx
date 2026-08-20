"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

export default function RunAuditButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const command = `UTC_AUDITOR_TOKEN=<project-token> \\\n  npx utc-audit run --trigger manual`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — nothing to recover, fail silently.
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-mist hover:text-chalk border border-line hover:border-mist rounded-md px-2.5 py-1.5 transition-colors flex items-center gap-1.5"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Run audit
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Run an audit for this project" widthClass="max-w-lg">
        <p className="text-sm text-mist mb-4">
          Audits are triggered from inside the client repository by the{" "}
          <code className="font-mono text-chalk">@utc-auditor/cli</code> package (see{" "}
          <code className="font-mono text-chalk">/audit-engine</code>), not from this dashboard — it needs
          local access to run Jest and read the project's source. Run this from{" "}
          <code className="font-mono text-chalk">{projectId}</code>'s repository root:
        </p>
        <div className="relative">
          <pre className="font-mono text-xs bg-panel2 border border-line rounded-md px-3 py-3 overflow-x-auto whitespace-pre">
            {command}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 h-6 w-6 rounded-md flex items-center justify-center text-mist hover:text-chalk hover:bg-panel transition-colors"
            aria-label="Copy command"
            title="Copy command"
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-signal-pass">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-mist mt-4">
          Project token comes from your CI secret store — see{" "}
          <code className="font-mono text-chalk">audit-engine/README.md</code> for setup. Once it completes,
          the new report shows up here automatically.
        </p>
      </Modal>
    </>
  );
}
