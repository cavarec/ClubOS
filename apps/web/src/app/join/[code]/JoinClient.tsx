"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinClient({ code }: { code: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"joining" | "error">("joining");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function join() {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (cancelled) return;

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(typeof body.error === "string" ? body.error : "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      const { tenant } = await res.json();

      // Le JWT en cours a été émis avant la création du membership : il faut
      // le rafraîchir pour que les policies RLS voient le nouveau tenant
      // (même besoin que ClubSetupForm après la création d'un club).
      const supabase = createClient();
      await supabase.auth.refreshSession();

      router.push(`/${tenant.slug}/dashboard`);
      router.refresh();
    }

    join();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  return (
    <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center">
      {status === "joining" ? (
        <p className="text-sm text-slate-500">Connexion au club…</p>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-ink">Impossible de rejoindre</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </>
      )}
    </div>
  );
}
