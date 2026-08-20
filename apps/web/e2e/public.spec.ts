import { test, expect } from "@playwright/test";

// Pages publiques : pas besoin de session, on ignore volontairement le
// storageState authentifié en repartant d'un contexte vierge.
test.use({ storageState: { cookies: [], origins: [] } });

test("la page de login affiche le formulaire sans déclencher d'envoi d'email", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByPlaceholder("prenom.nom@club.fr")).toBeVisible();
  await expect(page.getByRole("button", { name: /recevoir le lien/i })).toBeVisible();
});

test("un slug de club inexistant renvoie 404 sur la page publique", async ({ page }) => {
  const response = await page.goto("/club/ce-club-n-existe-pas-vraiment");
  expect(response?.status()).toBe(404);
});
