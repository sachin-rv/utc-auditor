"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";

export interface ClientRow {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  projectCount: number;
  status: string;
}

export default function ClientListPanel({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, query]);

  return (
    <div>
      <div className="relative mb-5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-mist"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients…"
          className="w-full bg-panel border border-line rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line bg-panel rounded-xl px-6 py-12 text-center text-sm text-mist">
          {clients.length === 0 ? "No clients yet. Create one to get started." : `No clients match “${query}”.`}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/client/${c.id}`}
              className="group border border-line bg-panel rounded-xl p-5 flex items-center justify-between hover:border-signal-pass/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-panel2 border border-line flex items-center justify-center font-display font-bold text-mist group-hover:text-signal-pass group-hover:border-signal-pass/30 transition-colors">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-mist mt-0.5">
                    {c.slug} · {c.contactEmail} · {c.projectCount} project{c.projectCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusPill status={c.status} />
                <span className="text-mist group-hover:text-signal-pass transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
