"use client";

import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API may be unavailable — fail silently, nothing to recover.
    }
  }

  return (
    <button
      onClick={copy}
      className="ui-icon-btn h-7 w-7"
      aria-label="Copy report link"
      title="Copy report link"
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-signal-pass">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}
