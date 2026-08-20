import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  clubSlug: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["player", "parent", "coach", "director", "club_admin"]),
  birthDate: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  licenseNumber: z.string().optional().or(z.literal("")),
  medicalCertificateExp: z.string().optional().or(z.literal("")),
});

// Ajout direct d'un adhérent par un admin du club, sans passer par le flux
// d'invitation par email — indispensable pour les joueurs mineurs qui n'ont
// pas leur propre adresse email. Chaque profil doit malgré tout référencer
// une ligne auth.users (contrainte du schéma) : sans email fourni, on génère
// une adresse placeholder unique ; le compte existe pour la gestion du club
// mais n'est pas utilisable pour se connecter tant qu'un email réel n'est
// pas renseigné. Orchestration multi-étapes non transactionnelle (l'API
// admin.createUser est un appel Auth, pas du SQL — cf. la même limite déjà
// acceptée pour /api/join) : vérification des droits d'abord via le client
// RLS, puis écritures via le client service-role.
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
  const body = parsed.data;

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", body.clubSlug).maybeSingle();
  if (!tenant) {
    return NextResponse.json({ error: "Club introuvable" }, { status: 404 });
  }

  const { data: adminMembership } = await supabase
    .from("memberships")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .in("role", ["director", "club_admin"])
    .maybeSingle();

  if (!adminMembership) {
    return NextResponse.json({ error: "Vous n'avez pas les droits pour ajouter un adhérent." }, { status: 403 });
  }

  const admin = createAdminClient();
  const email = body.email || `${randomUUID()}@sans-email.clubos.local`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { first_name: body.firstName, last_name: body.lastName },
  });

  if (createError || !created.user) {
    const status = createError?.code === "email_exists" ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "Un compte existe déjà avec cet email." : createError?.message },
      { status }
    );
  }

  const newUserId = created.user.id;

  if (body.phone || body.birthDate) {
    await admin
      .from("profiles")
      .update({
        phone: body.phone || null,
        birth_date: body.birthDate || null,
      })
      .eq("id", newUserId);
  }

  const { error: membershipError } = await admin
    .from("memberships")
    .insert({ tenant_id: tenant.id, user_id: newUserId, role: body.role });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  let licenseWarning: string | undefined;
  if (body.licenseNumber) {
    const { error: licenseError } = await admin.from("licenses").insert({
      tenant_id: tenant.id,
      profile_id: newUserId,
      license_number: body.licenseNumber,
      federation_code: "manuel",
      medical_certificate_exp: body.medicalCertificateExp || null,
      source: "manuel",
    });
    if (licenseError) {
      licenseWarning =
        licenseError.code === "23505"
          ? "Ce numéro de licence est déjà utilisé dans le club."
          : "Adhérent créé mais la licence n'a pas pu être enregistrée.";
    }
  }

  return NextResponse.json(
    {
      member: { id: newUserId, firstName: body.firstName, lastName: body.lastName, role: body.role },
      ...(licenseWarning ? { warning: licenseWarning } : {}),
    },
    { status: 201 }
  );
}
