import { describe, expect, it } from "vitest";
import { formatAmount } from "./format";

// Intl insere une espace insecable (U+00A0) avant le symbole euro. On
// normalise vers une espace ASCII avant de comparer, pour ne pas dependre du
// caractere exact produit par l'ICU du runtime qui execute le test.
function normalizeSpaces(s: string): string {
  return s.replace(/ /g, " ");
}

describe("formatAmount", () => {
  it("convertit les centimes en euros formates fr-FR", () => {
    expect(normalizeSpaces(formatAmount(1999))).toBe("19,99 €");
  });

  it("gere les montants ronds", () => {
    expect(normalizeSpaces(formatAmount(2000))).toBe("20,00 €");
  });

  it("gere zero", () => {
    expect(normalizeSpaces(formatAmount(0))).toBe("0,00 €");
  });
});
