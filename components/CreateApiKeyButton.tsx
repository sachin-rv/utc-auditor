"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createApiKeyAction } from "@/app/dashboard/actions";

const inputClass = "ui-input";

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
        className="ui-btn-secondary"
      >
        Add API key
      </button>
      <Modal open={open} onClose={close} title="Add API key" widthClass="max-w-md">
        {created ? (
          <div className="space-y-3">
            <p className="text-sm text-signal-warn">{created.message}</p>
            <div className="bg-panel2 border border-line rounded-xl px-3 py-2 font-mono text-xs break-all">{created.plainKey}</div>
            <div className="flex justify-end gap-2">
              <button onClick={copy} className="ui-btn-secondary">
                {copied ? "Copied" : "Copy key"}
              </button>
              <button onClick={close} className="ui-btn-primary">
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
              <button type="button" onClick={close} className="ui-btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ui-btn-primary"
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
