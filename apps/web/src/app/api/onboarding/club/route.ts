import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets uniquement)"),
  sportId: z.string().uuid(),
});

// Crée un nouveau tenant club et rattache son créateur en tant que club_admin,
// en un seul appel atomique (fonction SQL `create_club_with_admin`, SECURITY
// DEFINER — nécessaire car RLS bloquerait l'insert du tenant tant qu'aucun
// membership n'existe dessus). Deux inserts séparés depuis l'API laisseraient
// un tenant orphelin si le second échouait. Cf. docs/05-API-PERMISSIONS.md §18.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: tenant, error } = await supabase
    .rpc("create_club_with_admin", {
      p_name: parsed.data.name,
      p_slug: parsed.data.slug,
      p_sport_id: parsed.data.sportId,
      p_user_id: user.id,
    })
    .single();

  if (error) {
    const status = error.code === "23505" /* unique_violation */ ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ tenant }, { status: 201 });
}
