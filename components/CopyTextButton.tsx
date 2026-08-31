"use client";

import { useState } from "react";

export default function CopyTextButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`text-[11px] text-mist hover:text-chalk border border-line hover:border-mist rounded-full px-2 py-0.5 transition-colors ${className}`}
      title={label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
