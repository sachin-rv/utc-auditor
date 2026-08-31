import { redirect } from "next/navigation";
import { dashboardHome, getSession } from "@/lib/auth";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session) redirect(dashboardHome(session));
  return children;
}
