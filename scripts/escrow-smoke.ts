// GUILD AI — Escrow integration smoke test
// Verifies: hold → confirm → release happy path AND illegal-transition guards.
// Run with: npx tsx scripts/escrow-smoke.ts

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(?:"([^"]*)"|(.*))\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2] ?? m[3] ?? "";
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
}

async function main() {
  const { db } = await import("../src/db/client");
  const { listings, escrowRecords } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");
  const escrow = await import("../src/lib/escrow");

  const ASSET_ID = "smoke-asset-" + Date.now();

  console.log("→ seed listing", ASSET_ID);
  await db.insert(listings).values({
    id: ASSET_ID,
    ownerId: "smoke-seller",
    title: "Smoke Asset",
    description: "escrow integration fixture",
    ccaf: {
      intentSignals: ["smoke"],
      thoughtDensity: 50,
      iterations: 1,
      authorId: "smoke-seller",
      createdAt: new Date().toISOString(),
    },
    vercelUptimeDays: 10,
    basePrice: 5000,
    rank: "B",
    floorPrice: 5000,
  });

  try {
    // 1. hold
    console.log("→ [1] holdPayment");
    const held = await escrow.holdPayment("buyer-1", "smoke-seller", ASSET_ID, 5000, "card", "JPY");
    console.log("    id:", held.id, "status:", held.status);
    assert(held.status === "held", "expected status=held");
    assert(typeof held.createdAt === "string", "createdAt should be ISO string");

    // 2. getEscrowStatus
    console.log("→ [2] getEscrowStatus");
    assert((await escrow.getEscrowStatus(held.id)) === "held", "status should be held");

    // 3. illegal: release before confirm — must return undefined
    console.log("→ [3] release before confirm (illegal)");
    const earlyRelease = await escrow.release(held.id);
    assert(earlyRelease === undefined, "release before confirm must be undefined");

    // 4. confirm
    console.log("→ [4] confirmOnApiSuccess");
    const confirmed = await escrow.confirmOnApiSuccess(held.id);
    assert(confirmed?.status === "confirmed", "expected status=confirmed");

    // 5. illegal: double confirm — must return undefined (atomic guard)
    console.log("→ [5] double confirm (illegal)");
    const reConfirm = await escrow.confirmOnApiSuccess(held.id);
    assert(reConfirm === undefined, "double confirm must be undefined");

    // 6. release
    console.log("→ [6] release");
    const released = await escrow.release(held.id);
    assert(released?.status === "released", "expected status=released");
    assert(typeof released.releasedAt === "string", "releasedAt should be ISO string");

    // 7. getEscrow returns terminal state
    console.log("→ [7] getEscrow returns terminal state");
    const fetched = await escrow.getEscrow(held.id);
    assert(fetched?.status === "released", "fetched should be released");

    // 8. getEscrow for missing id returns undefined
    console.log("→ [8] getEscrow missing id");
    const missing = await escrow.getEscrow("does-not-exist");
    assert(missing === undefined, "missing id must be undefined");

    console.log("\n✓ Escrow integration test PASSED — all 8 scenarios OK");
  } finally {
    console.log("\n→ cleanup");
    // Targeted cleanup — DON'T use _resetStore which wipes the whole table.
    await db.delete(escrowRecords).where(eq(escrowRecords.assetId, ASSET_ID));
    await db.delete(listings).where(eq(listings.id, ASSET_ID));
  }
}

main().catch((err) => {
  console.error("✗ Escrow smoke FAILED:", err);
  process.exit(1);
});
