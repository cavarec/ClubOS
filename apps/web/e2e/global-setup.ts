import { createClient } from "@supabase/supabase-js";
import { request } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvLocal } from "./loadEnv";

const AUTH_DIR = path.join(__dirname, ".auth");
export const TEST_DATA_PATH = path.join(AUTH_DIR, "test-data.json");
const E2E_SECRET = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";

// Crée un club isolé + un admin de test à chaque run E2E — jamais contre le
// club réel (PLHB) déjà utilisé en production par l'utilisateur. Nettoyé
// dans global-teardown.ts.
export default async function globalSetup() {
  loadEnvLocal();
  mkdirSync(AUTH_DIR, { recursive: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const runId = Date.now();
  const email = `e2e-${runId}@example.com`;
  const slug = `e2e-test-${runId}`;

  const { data: sport } = await admin.from("sports").select("id").eq("slug", "handball").single();

  const { data: userResult, error: userError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { first_name: "E2E", last_name: "Admin" },
  });
  if (userError || !userResult.user) throw new Error(`E2E setup: création user échouée — ${userError?.message}`);

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ type: "club", name: `Club E2E ${runId}`, slug, sport_id: sport?.id })
    .select("id")
    .single();
  if (tenantError || !tenant) throw new Error(`E2E setup: création tenant échouée — ${tenantError?.message}`);

  const { error: membershipError } = await admin
    .from("memberships")
    .insert({ tenant_id: tenant.id, user_id: userResult.user.id, role: "club_admin" });
  if (membershipError) throw new Error(`E2E setup: création membership échouée — ${membershipError.message}`);

  writeFileSync(
    TEST_DATA_PATH,
    JSON.stringify({ userId: userResult.user.id, tenantId: tenant.id, slug, email }, null, 2)
  );

  // Établit une vraie session via la route de test (cookies @supabase/ssr
  // écrits par le serveur lui-même), puis sauvegarde le storageState réutilisé
  // par tous les tests du projet "chromium".
  const context = await request.newContext({ baseURL: "http://localhost:3000" });
  const res = await context.post("/api/test/login", {
    headers: { "x-e2e-secret": E2E_SECRET },
    data: { email },
  });
  if (!res.ok()) {
    throw new Error(`E2E setup: /api/test/login a échoué (${res.status()}) — ${await res.text()}`);
  }
  await context.storageState({ path: path.join(AUTH_DIR, "state.json") });
  await context.dispose();
}
