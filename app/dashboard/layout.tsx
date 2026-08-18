import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-panel/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={session.role === "admin" ? "/dashboard" : `/dashboard/client/${session.clientId}`} className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-md bg-signal-pass/15 border border-signal-pass/30 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-signal-pass animate-pulse" />
            </span>
            <span className="font-display font-bold tracking-tight text-lg">
              UTC<span className="text-signal-pass">/</span>Auditor
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
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
      <footer className="border-t border-line py-4">
        <div className="max-w-6xl mx-auto px-6 text-[11px] text-mist font-mono">
          UTC Auditor — quality assessment &amp; recommendation system, not a coverage-only report.
        </div>
      </footer>
    </div>
  );
}
