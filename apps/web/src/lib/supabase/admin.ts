import { createClient } from "@supabase/supabase-js";

// Client service-role : bypass RLS, réservé aux Route Handlers serveur
// (ex. création d'un club à l'onboarding, avant qu'un membership n'existe).
// Ne jamais importer ce module depuis du code exécuté côté client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
