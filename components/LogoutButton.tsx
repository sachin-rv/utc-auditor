"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function LogoutButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="ui-btn-secondary"
      >
        Sign out
      </button>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="Sign out?" widthClass="max-w-xs">
        <p className="text-sm text-mist mb-5">You'll need to sign back in to view the audit console.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setConfirming(false)}
            className="ui-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={doLogout}
            disabled={loading}
            className="ui-btn-danger"
          >
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </Modal>
    </>
  );
}
