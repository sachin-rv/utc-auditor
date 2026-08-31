"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { createClientAction } from "@/app/dashboard/actions";

const inputClass =
  "w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-signal-pass/60 transition-colors";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreateClientButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [withUser, setWithUser] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setContactEmail("");
    setWithUser(true);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createClientAction({
      name,
      slug,
      contactEmail,
      user: withUser ? { name: userName, email: userEmail, password: userPassword } : undefined,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold bg-signal-pass text-onaccent rounded-md px-3 py-2 hover:brightness-110 transition"
      >
        Create client
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create client" widthClass="max-w-lg">
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Organization name">
            <input
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="Ipsy"
            />
          </Field>
          <Field label="Slug">
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={inputClass}
              placeholder="ipsy"
            />
          </Field>
          <Field label="Contact email">
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
              placeholder="contact@ipsy.com"
            />
          </Field>

          <label className="flex items-center gap-2 text-xs text-mist pt-1">
            <input type="checkbox" checked={withUser} onChange={(e) => setWithUser(e.target.checked)} />
            Also create the first client user
          </label>

          {withUser && (
            <div className="grid sm:grid-cols-2 gap-3 border border-line rounded-lg p-3">
              <Field label="User name">
                <input required={withUser} value={userName} onChange={(e) => setUserName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="User email">
                <input
                  type="email"
                  required={withUser}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required={withUser}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {error && <div className="text-xs text-signal-fail">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="text-xs border border-line rounded-md px-3 py-1.5 text-mist">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-xs font-semibold bg-signal-pass text-onaccent rounded-md px-3 py-1.5 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-mist mb-1.5">{label}</label>
      {children}
    </div>
  );
}
