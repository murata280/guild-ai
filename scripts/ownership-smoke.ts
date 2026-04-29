// GUILD AI — Ownership integration smoke test
// Verifies: purchase, transfer, current-owner semantics, getOwnedAssets filtering.
// Run with: npx tsx scripts/ownership-smoke.ts

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
  const { listings, ownershipRecords } = await import("../src/db/schema");
  const { inArray } = await import("drizzle-orm");
  const ownership = await import("../src/lib/ownership");

  const ASSET_A = "smoke-own-a-" + Date.now();
  const ASSET_B = "smoke-own-b-" + Date.now();
  const FIXTURES = [ASSET_A, ASSET_B];

  console.log("→ seed listings", FIXTURES);
  for (const id of FIXTURES) {
    await db.insert(listings).values({
      id,
      ownerId: "smoke-creator",
      title: `Smoke ${id}`,
      description: "ownership integration fixture",
      ccaf: { intentSignals: [], thoughtDensity: 50, iterations: 1, authorId: "smoke-creator", createdAt: new Date().toISOString() },
      vercelUptimeDays: 0,
      basePrice: 1000,
      rank: "B",
      floorPrice: 1000,
    });
  }

  try {
    // 1. purchase creates a record
    console.log("→ [1] purchase appends row");
    const r1 = await ownership.purchase(ASSET_A, "alice", "Smoke Asset A");
    assert(r1.ownerId === "alice", "owner is alice");
    assert(r1.assetTitle === "Smoke Asset A", "title set");
    assert(r1.deployUrl.startsWith("https://vercel.com/"), "deployUrl set");

    // 2. getOwnership returns latest
    console.log("→ [2] getOwnership returns alice");
    assert((await ownership.getOwnership(ASSET_A))?.ownerId === "alice", "current owner = alice");

    // 3. second purchase with different buyer → buyer becomes current owner
    console.log("→ [3] second purchase wins (latest = current)");
    await new Promise((r) => setTimeout(r, 5));
    await ownership.purchase(ASSET_A, "bob", "Smoke Asset A");
    assert((await ownership.getOwnership(ASSET_A))?.ownerId === "bob", "current owner = bob");

    // 4. transferOwnership moves from current owner forward
    console.log("→ [4] transferOwnership: bob → carol");
    await new Promise((r) => setTimeout(r, 5));
    const t = await ownership.transferOwnership(ASSET_A, "carol");
    assert(t?.ownerId === "carol", "transferred to carol");
    assert((await ownership.getOwnership(ASSET_A))?.ownerId === "carol", "current owner = carol");

    // 5. transferOwnership preserves deployUrl
    assert(t?.deployUrl === r1.deployUrl, "deployUrl preserved across transfer");

    // 6. transferOwnership on missing asset returns undefined
    console.log("→ [6] transferOwnership on unknown asset → undefined");
    const missing = await ownership.transferOwnership("does-not-exist", "alice");
    assert(missing === undefined, "missing → undefined");

    // 7. getOwnedAssets only returns CURRENT ownership
    console.log("→ [7] getOwnedAssets filters out historical owners");
    await ownership.purchase(ASSET_B, "carol", "Smoke Asset B");
    const carolOwns = await ownership.getOwnedAssets("carol");
    const carolIds = carolOwns.map((r) => r.assetId);
    assert(carolIds.includes(ASSET_A), "carol has ASSET_A (transferred to her)");
    assert(carolIds.includes(ASSET_B), "carol has ASSET_B (purchased directly)");

    const aliceOwns = await ownership.getOwnedAssets("alice");
    const aliceIds = aliceOwns.map((r) => r.assetId);
    assert(!aliceIds.includes(ASSET_A), "alice no longer has ASSET_A");

    const bobOwns = await ownership.getOwnedAssets("bob");
    assert(bobOwns.length === 0, "bob owns nothing currently");

    // 8. empty user
    console.log("→ [8] getOwnedAssets for user with nothing");
    const empty = await ownership.getOwnedAssets("nobody");
    assert(empty.length === 0, "empty array for unknown user");

    console.log("\n✓ Ownership integration test PASSED — all 8 scenarios OK");
  } finally {
    console.log("\n→ cleanup");
    await db.delete(ownershipRecords).where(inArray(ownershipRecords.assetId, FIXTURES));
    await db.delete(listings).where(inArray(listings.id, FIXTURES));
  }
}

main().catch((err) => {
  console.error("✗ Ownership smoke FAILED:", err);
  process.exit(1);
});
