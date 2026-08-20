import { readFileSync } from "node:fs";
import path from "node:path";

// Playwright (global setup/teardown) tourne en Node pur, hors Next.js — qui
// charge .env.local automatiquement pour le serveur de dev lancé par
// webServer, mais pas pour ces scripts-là. Chargement minimal sans
// dépendance supplémentaire (pas de dotenv).
export function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  let content: string;
  try {
    content = readFileSync(envPath, "utf-8");
  } catch {
    return;
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
