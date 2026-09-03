import Link from "next/link";
import { redirect } from "next/navigation";
import { dashboardHome, getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { layoutShellClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 p-4 pb-0">
        <div className={`max-w-6xl mx-auto ${layoutShellClass} rounded-2xl`}>
          <div className="px-5 sm:px-6 h-16 flex items-center justify-between">
            <Link href={dashboardHome(session)} className="flex items-center gap-2.5 group">
              <span className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
                <Logo />
              </span>
              <span className="font-display font-bold tracking-tight text-lg text-chalk">
                UTC Auditor
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-sm font-medium">{session.name}</div>
                <div className="text-[11px] text-mist uppercase tracking-wider">
                  {session.role === "admin" ? "Administrator" : "Client user"}
                </div>
              </div>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className={`${layoutShellClass} rounded-3xl px-5 sm:px-6 py-6`}>{children}</div>
      </main>
      <footer className="px-4 pb-4">
        <div className={`max-w-6xl mx-auto px-6 py-3 rounded-2xl ${layoutShellClass} text-[11px] text-mist`}>
          Copyright © 2026 UTC Auditor. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
