import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ code: z.string().min(1) });

// Rejoint un club via un code d'invitation (fonction SQL join_via_invite_code).
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
    .rpc("join_via_invite_code", { p_code: parsed.data.code })
    .single();

  if (error || !tenant) {
    return NextResponse.json(
      { error: "Code d'invitation invalide, expiré, ou déjà utilisé." },
      { status: 400 }
    );
  }

  return NextResponse.json({ tenant });
}
