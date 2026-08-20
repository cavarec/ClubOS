import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  clubSlug: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  licenseNumber: z.string().optional().or(z.literal("")),
  medicalCertificateExp: z.string().optional().or(z.literal("")),
});

// Édition des infos d'un adhérent existant. Passe par le client RLS
// (profiles_update_self_or_tenant_admin, licenses_write_admin) plutôt que le
// service-role : ni création de compte ni de membership ici, la policy
// standard suffit et garde l'appliquant honnête (pas de bypass superflu).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone || null,
      birth_date: body.birthDate || null,
    })
    .eq("id", id);

  if (profileError) {
    return NextResponse.json({ error: "Vous n'avez pas les droits pour modifier cet adhérent." }, { status: 403 });
  }

  if (body.licenseNumber) {
    const { data: existingLicense } = await supabase
      .from("licenses")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("profile_id", id)
      .maybeSingle();

    const licensePayload = {
      tenant_id: tenant.id,
      profile_id: id,
      license_number: body.licenseNumber,
      federation_code: "manuel",
      medical_certificate_exp: body.medicalCertificateExp || null,
      source: "manuel",
    };

    const { error: licenseError } = existingLicense
      ? await supabase.from("licenses").update(licensePayload).eq("id", existingLicense.id)
      : await supabase.from("licenses").insert(licensePayload);

    if (licenseError) {
      return NextResponse.json({ error: licenseError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
