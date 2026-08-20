export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Relais Expo (https://exp.host) : pas de credentials Firebase nécessaires,
// Expo route lui-même vers FCM (Android) / APNs (iOS) à partir du token.
// Best-effort : ne lève jamais, un échec d'envoi ne doit pas faire échouer
// l'action métier (convocation créée même si la notif ne part pas).
export async function sendExpoPush(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });
  } catch {
    // réseau indisponible, service Expo down, etc. — silencieux volontairement
  }
}
