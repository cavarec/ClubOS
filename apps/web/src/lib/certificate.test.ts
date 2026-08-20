import { describe, expect, it } from "vitest";
import { certificateStatus } from "./certificate";

const NOW = new Date("2026-06-15T12:00:00Z");

describe("certificateStatus", () => {
  it("retourne 'none' sans date d'expiration", () => {
    expect(certificateStatus(null, NOW)).toBe("none");
  });

  it("retourne 'expired' pour une date passée", () => {
    expect(certificateStatus("2026-01-01", NOW)).toBe("expired");
  });

  it("retourne 'expiring' dans les 30 jours", () => {
    expect(certificateStatus("2026-06-25", NOW)).toBe("expiring");
  });

  it("retourne 'ok' au-delà de 30 jours", () => {
    expect(certificateStatus("2026-12-31", NOW)).toBe("ok");
  });

  it("traite exactement +30 jours comme 'ok' (comparaison strictement inférieure)", () => {
    const in30Days = new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(certificateStatus(in30Days, NOW)).toBe("ok");
  });
});
