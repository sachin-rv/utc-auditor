"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="8" fill="#1a62ea" />
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

function DashboardPreview() {
  const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 48, 90];
  const tableRows = [
    { name: "Enterprise Plan", value: "$12,400", trend: "+12%" },
    { name: "Pro Subscription", value: "$8,240", trend: "+8%" },
    { name: "Starter Pack", value: "$4,044", trend: "+3%" },
  ];

  return (
    <div className="relative mt-8 flex-1 min-h-[280px]">
      <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-medium">Total Revenue</p>
            <p className="text-white text-2xl font-bold tracking-tight">$189,374</p>
            <p className="text-emerald-300 text-xs font-medium mt-0.5">+18.2% from last month</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs font-medium">Active Users</p>
            <p className="text-white text-xl font-bold">$25,684</p>
          </div>
        </div>

        <div className="flex items-end gap-1 h-16 mb-4">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-white/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-3 text-[10px] text-white/50 font-medium uppercase tracking-wide px-1">
            <span>Product</span>
            <span className="text-right">Revenue</span>
            <span className="text-right">Growth</span>
          </div>
          {tableRows.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-3 text-xs text-white/90 bg-white/10 rounded-lg px-2 py-1.5"
            >
              <span className="truncate">{row.name}</span>
              <span className="text-right font-medium">{row.value}</span>
              <span className="text-right text-emerald-300">{row.trend}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-4 -right-2 w-44 rounded-2xl bg-white shadow-2xl p-4 border border-gray-100">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">
          Units Sold
        </p>
        <div className="relative w-24 h-24 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#e8ecf0" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#1a62ea"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="179 239"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-900 leading-none">6,248</span>
            <span className="text-[10px] text-gray-400">Units</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl md:rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col md:flex-row md:min-h-[640px]">
        {/* Left — Authentication */}
        <div className="flex-1 flex flex-col p-8 sm:p-10 md:p-12 relative">
          <div className="flex items-center gap-2.5 mb-10">
            <Logo />
            <span className="font-display font-bold text-lg text-gray-900 tracking-tight">
              UTC Auditor
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {setupRequired ? "Create Your Account" : "Welcome Back"}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                {setupRequired
                  ? "Set up the first admin account to get started."
                  : "Enter your email and password to access your account."}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {setupRequired && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1a62ea] focus:ring-2 focus:ring-[#1a62ea]/20 transition"
                    placeholder="Admin User"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1a62ea] focus:ring-2 focus:ring-[#1a62ea]/20 transition"
                  placeholder="email@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1a62ea] focus:ring-2 focus:ring-[#1a62ea]/20 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                      className="h-4 w-4 rounded border-gray-300 text-[#1a62ea] focus:ring-[#1a62ea]/30"
                    />
                    <span className="text-sm text-gray-600">Remember Me</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-[#1a62ea] hover:text-[#1550c4] transition"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot Your Password?
                  </a>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a62ea] hover:bg-[#1550c4] text-white font-semibold text-sm rounded-lg py-2.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
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

            {!setupRequired && (
              <>
                <p className="text-center text-sm text-gray-500 mt-8">
                  Don&apos;t Have An Account?{" "}
                  <a
                    href="#"
                    className="font-medium text-[#1a62ea] hover:text-[#1550c4] transition"
                    onClick={(e) => e.preventDefault()}
                  >
                    Register Now
                  </a>
                </p>
              </>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-8 md:mt-0 md:absolute md:bottom-8 md:left-10 lg:left-12">
            Copyright © 2026 UTC Auditor. All rights reserved.
          </p>
        </div>

        {/* Right — Branding Preview */}
        <div className="flex-1 bg-[#1a62ea] p-8 sm:p-10 md:p-12 flex flex-col rounded-t-2xl md:rounded-t-none md:rounded-r-3xl">
          <div className="max-w-md mx-auto w-full flex flex-col flex-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              Effortlessly manage your applications.
            </h2>
            <p className="text-white/70 text-sm sm:text-base mt-3 leading-relaxed">
              Log in to access your Auditor
            </p>
            <DashboardPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
