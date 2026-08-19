import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  clubSlug: z.string().min(1),
  role: z.enum(["player", "parent", "coach", "director", "club_admin"]),
});

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O/1/I, ambigus à l'oral/écrit

function generateCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// Génère un code d'invitation pour le club courant. RLS (invitations_write_admin)
// garantit que seul un director/club_admin du tenant peut réussir l'insert —
// pas de vérification de rôle ici, la base est la source de vérité.
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

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", parsed.data.clubSlug)
    .maybeSingle();

  if (!tenant) {
    return NextResponse.json({ error: "Club introuvable" }, { status: 404 });
  }

  // Quelques tentatives en cas de collision de code (très improbable, 33^8 possibilités).
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        tenant_id: tenant.id,
        code: generateCode(),
        role: parsed.data.role,
        created_by: user.id,
      })
      .select("code, role, created_at")
      .single();

    if (!error) {
      return NextResponse.json({ invitation: data }, { status: 201 });
    }
    if (error.code !== "23505" /* unique_violation */) {
      const status = error.code === "42501" ? 403 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  }

  return NextResponse.json({ error: "Impossible de générer un code unique, réessayez." }, { status: 500 });
}
