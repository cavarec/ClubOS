"use client";

import { useState } from "react";
import { Button } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";

export function JoinLoginForm({ code }: { code: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/join/${code}` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="prenom.nom@club.fr"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi en cours…" : "Recevoir le lien de connexion"}
      </Button>
      {status === "sent" && <p className="text-sm text-green-600">Lien envoyé — vérifiez votre boîte mail.</p>}
      {status === "error" && <p className="text-sm text-red-600">Une erreur est survenue, réessayez.</p>}
    </form>
  );
}
