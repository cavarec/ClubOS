import { describe, expect, it } from "vitest";
import { currentSeasonLabel } from "./season";

describe("currentSeasonLabel", () => {
  it("reste sur la saison en cours pendant l'été (avant septembre)", () => {
    const season = currentSeasonLabel(new Date("2026-06-15"));
    expect(season).toEqual({ label: "2025-2026", startDate: "2025-09-01", endDate: "2026-08-31" });
  });

  it("bascule sur la nouvelle saison en septembre", () => {
    const season = currentSeasonLabel(new Date("2026-09-01"));
    expect(season).toEqual({ label: "2026-2027", startDate: "2026-09-01", endDate: "2027-08-31" });
  });

  it("reste sur la saison en cours en decembre", () => {
    const season = currentSeasonLabel(new Date("2026-12-25"));
    expect(season.label).toBe("2026-2027");
  });
});
