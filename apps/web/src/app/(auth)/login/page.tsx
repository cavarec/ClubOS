"use client";

import { useState } from "react";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <form onSubmit={handleMagicLink} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-ink">Connexion à ClubOS</h1>
        <p className="mt-1 text-sm text-slate-500">Recevez un lien de connexion par email, sans mot de passe.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="prenom.nom@club.fr"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />

        <Button type="submit" className="mt-4 w-full" disabled={status === "sending"}>
          {status === "sending" ? "Envoi en cours…" : "Recevoir le lien de connexion"}
        </Button>

        {status === "sent" && (
          <p className="mt-3 text-sm text-green-600">Lien envoyé — vérifiez votre boîte mail.</p>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">Une erreur est survenue, réessayez.</p>
        )}
      </form>
    </main>
  );
}
