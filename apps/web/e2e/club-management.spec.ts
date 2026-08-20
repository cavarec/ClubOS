import { test, expect } from "@playwright/test";
import { readTestData } from "./testData";

test("un admin peut créer une équipe puis ajouter un adhérent", async ({ page }) => {
  const { slug } = readTestData();

  await page.goto(`/${slug}/equipes`);
  await expect(page.getByRole("heading", { name: "Équipes" })).toBeVisible();

  await page.getByText("Créer une équipe").click();
  const teamName = `Seniors E2E ${Date.now()}`;
  await page.getByPlaceholder("Nom (ex: Seniors A)").fill(teamName);
  await page.getByPlaceholder("Catégorie (ex: U15 M)").fill("Seniors");
  await page.getByRole("button", { name: "Créer" }).click();

  await expect(page.getByText(teamName)).toBeVisible();

  await page.goto(`/${slug}/adherents`);
  await page.getByText("Ajouter un adhérent").click();
  const firstName = "Alex";
  const lastName = `E2E${Date.now()}`;
  await page.getByPlaceholder("Prénom", { exact: true }).fill(firstName);
  await page.getByPlaceholder("Nom", { exact: true }).fill(lastName);
  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible();
});
