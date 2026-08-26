import { redirect } from "next/navigation";
import { dashboardHome, getSession } from "@/lib/auth";

export default function Home() {
  const session = getSession();
  if (!session) redirect("/login");
  redirect(dashboardHome(session));
}
