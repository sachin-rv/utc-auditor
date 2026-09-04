import Link from "next/link";
import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { dashboardHome, getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login");

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f8a7f] via-[#0d6e66] to-[#071110] text-white"
      style={
        {
          "--c-chalk": "247 252 251",
          "--c-mist": "214 228 225",
          "--c-panel2": "14 40 41",
          "--c-line": "92 132 130",
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(27,180,155,0.18),transparent_30%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 p-4 pb-0">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[22px] border border-white/10 bg-[#0a2f2f]/45 shadow-[0_22px_50px_rgba(2,10,11,0.35)] backdrop-blur-2xl">
            <div className="px-5 sm:px-6 h-16 flex items-center justify-between bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]">
              <Link href={dashboardHome(session)} className="flex items-center gap-2.5 group">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 shadow-inner shadow-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:bg-white/10">
                  <Logo />
                </span>
                <span className="font-display font-bold tracking-tight text-lg text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  UTC Auditor
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden text-right leading-tight sm:block">
                  <div className="text-sm font-medium text-white">{session.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-50">
                    {session.role === "admin" ? "Administrator" : "Client user"}
                  </div>
                </div>
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-8">
          <div className="w-full rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,34,34,0.26),rgba(8,22,22,0.42))] p-3 shadow-[0_35px_90px_rgba(1,13,14,0.35)] backdrop-blur-md ring-1 ring-white/5 sm:p-4">
            {children}
          </div>
        </main>

        <footer className="py-6">
          <div className="mx-auto max-w-6xl px-6 text-[11px] text-emerald-50/90">
            Copyright © 2026 UTC Auditor. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
