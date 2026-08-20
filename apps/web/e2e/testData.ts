import { readFileSync } from "node:fs";
import { TEST_DATA_PATH } from "./global-setup";

export function readTestData(): { userId: string; tenantId: string; slug: string; email: string } {
  return JSON.parse(readFileSync(TEST_DATA_PATH, "utf-8"));
}
