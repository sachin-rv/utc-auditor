"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createApiKeyAction } from "@/app/dashboard/actions";

const inputClass =
  "w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors";

export default function CreateApiKeyButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`CI — ${projectName}`);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ plainKey: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createApiKeyAction(projectId, name);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCreated({ plainKey: result.data.plainKey, message: result.data.message });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(created?.plainKey ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function close() {
    setOpen(false);
    setCreated(null);
    setError(null);
    setCopied(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium border border-line hover:border-mist rounded-md px-2.5 py-1.5 text-mist hover:text-chalk transition-colors"
      >
        Add API key
      </button>
      <Modal open={open} onClose={close} title="Add API key" widthClass="max-w-md">
        {created ? (
          <div className="space-y-3">
            <p className="text-sm text-signal-warn">{created.message}</p>
            <div className="bg-panel2 border border-line rounded-md px-3 py-2 font-mono text-xs break-all">{created.plainKey}</div>
            <div className="flex justify-end gap-2">
              <button onClick={copy} className="text-xs border border-line rounded-md px-3 py-1.5">
                {copied ? "Copied" : "Copy key"}
              </button>
              <button onClick={close} className="text-xs font-semibold bg-signal-pass text-onaccent rounded-md px-3 py-1.5">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-mist mb-1.5">Key name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            {error && <div className="text-xs text-signal-fail">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="text-xs border border-line rounded-md px-3 py-1.5 text-mist">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="text-xs font-semibold bg-signal-pass text-onaccent rounded-md px-3 py-1.5 disabled:opacity-60"
              >
                {loading ? "Generating…" : "Generate key"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
