// GUILD AI — DB smoke test
// Inserts one listing → selects it back → cleans up. Verifies end-to-end round trip
// across schema, neon-http driver, and Drizzle. Run with: npx tsx scripts/db-smoke.ts

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env.local loader — keeps the script self-contained on Windows shells.
const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(?:"([^"]*)"|(.*))\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2] ?? m[3] ?? "";
}

async function main() {
  const { db } = await import("../src/db/client");
  const { listings } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");

  const TEST_ID = "smoke-" + Date.now();

  console.log("→ INSERT listing:", TEST_ID);
  await db.insert(listings).values({
    id: TEST_ID,
    ownerId: "smoke-owner",
    title: "Smoke Test Listing",
    description: "DB round-trip verification",
    ccaf: {
      intentSignals: ["smoke"],
      thoughtDensity: 75,
      iterations: 1,
      authorId: "smoke-owner",
      createdAt: new Date().toISOString(),
    },
    vercelUptimeDays: 10,
    basePrice: 1000,
    rank: "B",
    floorPrice: 1000,
  });

  console.log("→ SELECT it back");
  const rows = await db.select().from(listings).where(eq(listings.id, TEST_ID));
  console.log("  rows returned:", rows.length);
  if (rows.length !== 1) throw new Error("Expected 1 row, got " + rows.length);
  const r = rows[0];
  console.log("  id          :", r.id);
  console.log("  rank        :", r.rank);
  console.log("  ccaf.density:", r.ccaf.thoughtDensity);
  console.log("  createdAt   :", r.createdAt.toISOString());

  console.log("→ DELETE cleanup");
  await db.delete(listings).where(eq(listings.id, TEST_ID));

  console.log("\n✓ DB smoke test passed — schema + driver + round trip OK");
}

main().catch((err) => {
  console.error("✗ Smoke test FAILED:", err);
  process.exit(1);
});
