import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { loadEnvLocal } from "./loadEnv";
import { TEST_DATA_PATH } from "./global-setup";

export default async function globalTeardown() {
  loadEnvLocal();
  if (!existsSync(TEST_DATA_PATH)) return;

  const { userId, tenantId } = JSON.parse(readFileSync(TEST_DATA_PATH, "utf-8"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // onDelete: Cascade sur la quasi-totalité des tables liées à tenant_id
  // (teams, events, memberships, sponsors, orders, documents...) — supprimer
  // le tenant nettoie tout le reste en une fois.
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
  if (userId) await admin.auth.admin.deleteUser(userId);

  rmSync(TEST_DATA_PATH, { force: true });
}
