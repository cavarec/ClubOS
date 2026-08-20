export type CertificateStatus = "ok" | "expiring" | "expired" | "none";

// Statut d'un certificat médical à partir de sa date d'expiration — utilisé
// pour le badge sur Adhérents et l'alerte du tableau de bord.
export function certificateStatus(expiresAt: string | null, now: Date = new Date()): CertificateStatus {
  if (!expiresAt) return "none";
  const expDate = new Date(expiresAt);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (expDate < now) return "expired";
  if (expDate < in30Days) return "expiring";
  return "ok";
}
