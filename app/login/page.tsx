"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Sign in failed.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  function fill(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
        <div className="h-40 w-full bg-signal-pass animate-scan blur-2xl" />
      </div>

      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="h-8 w-8 rounded-md bg-signal-pass/15 border border-signal-pass/30 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-signal-pass animate-pulse" />
          </span>
          <span className="font-display font-bold tracking-tight text-xl">
            UTC<span className="text-signal-pass">/</span>Auditor
          </span>
        </div>

        <div className="border border-line bg-panel rounded-xl p-7">
          <div className="text-xs font-mono uppercase tracking-widest text-mist mb-1">
            Authenticated access
          </div>
          <h1 className="font-display text-xl font-bold mb-6">Sign in to the console</h1>

          <form onSubmit={onSubmit} className="space-y-4">
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
                className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors"
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
                className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="text-xs text-signal-fail">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal-pass text-ink font-semibold text-sm rounded-md py-2.5 hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div className="mt-5 border border-line/60 rounded-lg p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-mist mb-2">
            Demo credentials
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <button onClick={() => fill("admin@utcauditor.dev", "admin123")} className="block text-left text-mist hover:text-signal-pass transition-colors">
              admin@utcauditor.dev / admin123 <span className="text-mist/60">— administrator</span>
            </button>
            <button onClick={() => fill("dana@northwind.example", "demo123")} className="block text-left text-mist hover:text-signal-pass transition-colors">
              dana@northwind.example / demo123 <span className="text-mist/60">— Northwind Retail</span>
            </button>
            <button onClick={() => fill("sam@horizon.example", "demo123")} className="block text-left text-mist hover:text-signal-pass transition-colors">
              sam@horizon.example / demo123 <span className="text-mist/60">— Horizon Media</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
