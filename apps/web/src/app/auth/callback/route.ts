import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback du lien magique : échange le code contre une session, puis
// redirige vers le club de l'utilisateur s'il en a un, sinon l'onboarding.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("tenant:tenants(slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const clubSlug = (membership?.tenant as unknown as { slug: string } | null)?.slug;

  return NextResponse.redirect(
    clubSlug ? `${origin}/${clubSlug}/dashboard` : `${origin}/onboarding/club-setup`
  );
}
