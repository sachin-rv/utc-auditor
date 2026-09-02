"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import InteractivePreview from "@/components/login-preview/InteractivePreview";

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="8" className="fill-signal-pass" />
      <path
        d="M8 10.5h12M8 14h12M8 17.5h8"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="19" cy="17.5" r="2" fill="white" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const fieldClass =
  "w-full bg-panel2 border border-line rounded-xl px-3.5 py-2.5 text-sm text-chalk placeholder:text-mist/70 outline-none focus:border-signal-pass focus:ring-2 focus:ring-signal-pass/20 transition";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl bg-panel rounded-2xl md:rounded-3xl border border-line shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden flex flex-col md:flex-row md:min-h-[640px]">
        <div className="flex-1 flex flex-col p-8 sm:p-10 md:p-12 relative">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="font-display font-bold text-lg text-chalk tracking-tight">
                UTC Auditor
              </span>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-chalk mb-2">
                {setupRequired ? "Create Your Account" : "Welcome Back"}
              </h1>
              <p className="text-sm text-mist leading-relaxed">
                {setupRequired
                  ? "Set up the first admin account to get started."
                  : "Enter your email and password to access your account."}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {setupRequired && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-chalk mb-1.5">
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                    placeholder="Admin User"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-chalk mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  placeholder="email@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-chalk mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${fieldClass} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-chalk transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {!setupRequired && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-line text-signal-pass focus:ring-signal-pass/30"
                    />
                    <span className="text-sm text-mist">Remember Me</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-signal-pass hover:brightness-110 transition"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot Your Password?
                  </a>
                </div>
              )}

              {error && (
                <div className="text-sm text-signal-fail bg-signal-fail/10 border border-signal-fail/20 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-chalk dark:bg-signal-pass text-panel dark:text-onaccent hover:opacity-90 font-semibold text-sm rounded-full py-2.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? setupRequired
                    ? "Creating…"
                    : "Signing in…"
                  : setupRequired
                    ? "Create admin"
                    : "Log in"}
              </button>
            </form>
          </div>

          <p className="text-[11px] text-mist mt-8 md:mt-0 md:absolute md:bottom-8 md:left-10 lg:left-12">
            Copyright © 2026 UTC Auditor. All rights reserved.
          </p>
        </div>

        <InteractivePreview />
      </div>
    </div>
  );
}
