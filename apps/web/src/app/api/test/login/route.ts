import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({ email: z.string().email() });

// Route de test E2E UNIQUEMENT : établit une vraie session (cookies
// @supabase/ssr corrects, écrits par le même client que le reste de l'app)
// sans passer par un email réel — évite de re-déclencher le rate limit
// Supabase déjà rencontré. Double verrou : NODE_ENV !== production ET
// E2E_TEST_SECRET (jamais définie sur le déploiement Vercel réel) doivent
// tous les deux être satisfaits, sinon 404 (comme si la route n'existait
// pas, pas de 403 qui révélerait son existence).
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" || !process.env.E2E_TEST_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secretHeader = req.headers.get("x-e2e-secret");
  if (secretHeader !== process.env.E2E_TEST_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: parsed.data.email,
  });

  if (linkError || !link) {
    return NextResponse.json({ error: linkError?.message ?? "Impossible de générer un lien" }, { status: 500 });
  }

  // Le lien admin est en flux implicite (tokens dans le fragment) — on suit
  // la redirection nous-mêmes côté serveur pour les récupérer.
  const verifyResponse = await fetch(link.properties.action_link, { redirect: "manual" });
  const location = verifyResponse.headers.get("location");
  const hash = location?.split("#")[1];
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Lien de connexion invalide" }, { status: 500 });
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
