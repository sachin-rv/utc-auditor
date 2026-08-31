"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const inputClass =
  "w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    fetch("/api/auth/setup-status")
      .then((r) => r.json())
      .then((d) => setSetupRequired(!!d.setupRequired))
      .catch(() => setSetupRequired(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = setupRequired ? "/api/auth/setup" : "/api/auth/login";
    const body = setupRequired ? { email, password, name } : { email, password };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Sign in failed.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
        <div className="h-40 w-full bg-signal-pass animate-scan blur-2xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex items-center justify-center gap-2.5 mb-8 relative">
          <span className="h-8 w-8 rounded-md bg-signal-pass/15 border border-signal-pass/30 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-signal-pass animate-pulse" />
          </span>
          <span className="font-display font-bold tracking-tight text-xl">
            UTC<span className="text-signal-pass">/</span>Auditor
          </span>
          <div className="absolute right-0">
            <ThemeToggle />
          </div>
        </div>

        <div className="border border-line bg-panel rounded-xl p-7">
          <div className="text-xs font-mono uppercase tracking-widest text-mist mb-1">
            {setupRequired ? "First-run setup" : "Authenticated access"}
          </div>
          <h1 className="font-display text-xl font-bold mb-6">
            {setupRequired ? "Create the first admin" : "Sign in to the console"}
          </h1>

          <form onSubmit={onSubmit} className="space-y-4">
            {setupRequired && (
              <div>
                <label className="block text-xs text-mist mb-1.5" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Admin User"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-mist mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs text-mist mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {error && <div className="text-xs text-signal-fail">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal-pass text-onaccent font-semibold text-sm rounded-md py-2.5 hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? (setupRequired ? "Creating…" : "Signing in…") : setupRequired ? "Create admin" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
