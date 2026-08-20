import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendExpoPush } from "@/lib/push";

const bodySchema = z.object({ eventId: z.string().uuid() });

// Crée la convocation + une réponse "pending" par joueur de l'équipe (RLS
// convocations_write_manager / convocation_responses_insert_manager,
// 009_rls_seasons_convocations_write.sql — réservé coach/director/club_admin
// de l'équipe). Notifications et tokens push lus/écrits en service-role :
// aucune policy d'insert sur notifications, et push_tokens_own empêche un
// coach de lire les tokens d'un joueur (comportement RLS voulu, pas un bug).
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

  const { data: event } = await supabase
    .from("events")
    .select("id, title, team_id")
    .eq("id", parsed.data.eventId)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  const { data: convocation, error: convocationError } = await supabase
    .from("convocations")
    .insert({ event_id: event.id, created_by: user.id })
    .select("id")
    .single();

  if (convocationError || !convocation) {
    return NextResponse.json(
      { error: "Vous n'avez pas les droits pour convoquer sur cet événement." },
      { status: 403 }
    );
  }

  const { data: players } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", event.team_id)
    .eq("role", "player");

  const playerIds = (players ?? []).map((p) => p.user_id);

  if (playerIds.length > 0) {
    await supabase
      .from("convocation_responses")
      .insert(playerIds.map((userId) => ({ convocation_id: convocation.id, user_id: userId, status: "pending" })));
  }

  if (playerIds.length > 0) {
    const admin = createAdminClient();

    await admin.from("notifications").insert(
      playerIds.map((userId) => ({
        user_id: userId,
        type: "convocation",
        title: "Nouvelle convocation",
        body: event.title,
        deep_link: `clubos://convocations/${convocation.id}`,
        channel: "push",
      }))
    );

    const { data: tokens } = await admin.from("push_tokens").select("token").in("user_id", playerIds);

    await sendExpoPush(
      (tokens ?? []).map((t) => ({
        to: t.token,
        title: "Nouvelle convocation",
        body: event.title,
        data: { convocationId: convocation.id },
      }))
    );
  }

  return NextResponse.json({ convocationId: convocation.id }, { status: 201 });
}
