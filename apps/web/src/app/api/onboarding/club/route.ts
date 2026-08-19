import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets uniquement)"),
  sportId: z.string().uuid(),
});

// Crée un nouveau tenant club et rattache son créateur en tant que club_admin.
// Utilise le client service-role car aucun membership n'existe encore sur ce
// tenant au moment de la création — RLS bloquerait un insert via le client
// authentifié standard. Cf. docs/05-API-PERMISSIONS.md §18.
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

  const admin = createAdminClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      type: "club",
      name: parsed.data.name,
      slug: parsed.data.slug,
      sport_id: parsed.data.sportId,
    })
    .select()
    .single();

  if (tenantError) {
    const status = tenantError.code === "23505" /* unique_violation */ ? 409 : 500;
    return NextResponse.json({ error: tenantError.message }, { status });
  }

  const { error: membershipError } = await admin.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: user.id,
    role: "club_admin",
  });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  return NextResponse.json({ tenant }, { status: 201 });
}
