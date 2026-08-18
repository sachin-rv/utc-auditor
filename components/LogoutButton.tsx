"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="text-xs font-medium text-mist hover:text-chalk border border-line hover:border-mist rounded-md px-3 py-1.5 transition-colors"
    >
      Sign out
    </button>
  );
}
