import Link from "next/link";
import { redirect } from "next/navigation";
import { dashboardHome, getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 px-4 pt-4 pb-2">
        <div className="max-w-6xl mx-auto h-14 px-3 sm:px-5 flex items-center justify-between rounded-full bg-panel/80 backdrop-blur-md border border-line shadow-sm shadow-black/[0.04] dark:shadow-black/30">
          <Link href={dashboardHome(session)} className="flex items-center gap-2.5 pl-1">
            <Logo />
            <span className="font-display font-bold tracking-tight text-lg">
              UTC<span className="text-signal-pass">/</span>Auditor
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-medium">{session.name}</div>
              <div className="text-[11px] text-mist">
                {session.role === "admin" ? "Administrator" : "Client user"}
              </div>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
      <footer className="px-4 pb-6">
        <div className="max-w-6xl mx-auto px-5 py-3 text-[11px] text-mist rounded-full bg-panel/60 border border-line">
          UTC Auditor — quality assessment &amp; recommendation system, not a coverage-only report.
        </div>
      </footer>
    </div>
  );
}
