"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ClubSetupForm({ sports }: { sports: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const res = await fetch("/api/onboarding/club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, sportId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMessage(typeof body.error === "string" ? body.error : "Une erreur est survenue.");
      setStatus("error");
      return;
    }

    const { tenant } = await res.json();

    // Le JWT en cours a été émis avant la création du club : tenant_ids n'y
    // figure pas encore (claim injecté par le hook à l'émission du token).
    // Un refresh force la réémission via le hook, donc les policies RLS
    // basées sur tenant_ids voient immédiatement le nouveau club.
    const supabase = createClient();
    await supabase.auth.refreshSession();

    router.push(`/${tenant.slug}/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="name">
          Nom du club
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="HBC Lesneven"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="slug">
          Identifiant (URL)
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugTouched(true);
          }}
          placeholder="hbc-lesneven"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="sport">
          Sport principal
        </label>
        <select
          id="sport"
          required
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Création en cours…" : "Créer le club"}
      </Button>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
    </form>
  );
}
