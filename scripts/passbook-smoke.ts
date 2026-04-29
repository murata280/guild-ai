// GUILD AI — Passbook DB-enriched smoke test
// Run with: npx tsx scripts/passbook-smoke.ts

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
  const { listings, ownershipRecords, checkoutSessions } = await import("../src/db/schema");
  const { eq, inArray } = await import("drizzle-orm");
  const { getPassbookSnapshotFromDb } = await import("../src/lib/passbook/db");
  const { getPassbookSnapshot } = await import("../src/lib/passbook");
  const ownership = await import("../src/lib/ownership");
  const checkout = await import("../src/lib/checkout");

  const USER = "smoke-passbook-user-" + Date.now();
  const ASSET_S = "smoke-pb-s-" + Date.now();
  const ASSET_A = "smoke-pb-a-" + Date.now();
  const FIXTURES = [ASSET_S, ASSET_A];

  console.log("→ seed listings (1 S-rank, 1 A-rank)");
  await db.insert(listings).values([
    {
      id: ASSET_S,
      ownerId: "smoke-creator",
      title: "Smoke S-rank Asset",
      description: "fixture",
      ccaf: { intentSignals: ["test"], thoughtDensity: 90, iterations: 10, authorId: "smoke-creator", createdAt: new Date().toISOString() },
      vercelUptimeDays: 60,
      basePrice: 50000,
      rank: "S",
      floorPrice: 60000,
    },
    {
      id: ASSET_A,
      ownerId: "smoke-creator",
      title: "Smoke A-rank Asset",
      description: "fixture",
      ccaf: { intentSignals: [], thoughtDensity: 70, iterations: 5, authorId: "smoke-creator", createdAt: new Date().toISOString() },
      vercelUptimeDays: 14,
      basePrice: 20000,
      rank: "A",
      floorPrice: 22000,
    },
  ]);

  try {
    // 1. User with NO activity → returns mock (matches deterministic snapshot)
    console.log("→ [1] no-activity user → mock fallback");
    const enriched1 = await getPassbookSnapshotFromDb(USER);
    const mock = getPassbookSnapshot(USER);
    assert(enriched1.assetCount === mock.assetCount, "fallback assetCount matches mock");
    assert(enriched1.recentTransactions.length === mock.recentTransactions.length, "fallback recentTransactions matches mock count");

    // 2. After purchase, real data shows up
    console.log("→ [2] after purchase → real assetCount/rankBreakdown");
    await ownership.purchase(ASSET_S, USER, "Smoke S-rank Asset");
    await ownership.purchase(ASSET_A, USER, "Smoke A-rank Asset");

    const enriched2 = await getPassbookSnapshotFromDb(USER);
    assert(enriched2.assetCount === 2, `expected 2 owned assets, got ${enriched2.assetCount}`);
    assert(enriched2.rankBreakdown.S === 1, "1 S-rank owned");
    assert(enriched2.rankBreakdown.A === 1, "1 A-rank owned");
    assert(enriched2.rankBreakdown.B === 0, "0 B-rank owned");

    // 3. Settled checkout sessions become recentTransactions
    console.log("→ [3] settled checkouts → recentTransactions");
    const s1 = await checkout.createCheckoutSession({ assetId: ASSET_S, buyerId: USER, amountJpy: 60000, method: "card", payoutCurrency: "JPY" });
    await checkout.confirmPayment(s1.id);
    const s2 = await checkout.createCheckoutSession({ assetId: ASSET_A, buyerId: USER, amountJpy: 22000, method: "jpyc", payoutCurrency: "JPYC" });
    await checkout.confirmPayment(s2.id);

    const enriched3 = await getPassbookSnapshotFromDb(USER);
    assert(enriched3.recentTransactions.length === 2, `expected 2 recent, got ${enriched3.recentTransactions.length}`);
    const titles = enriched3.recentTransactions.map((t) => t.assetTitle);
    assert(titles.includes("Smoke S-rank Asset"), "S-rank title in recentTransactions");
    assert(titles.includes("Smoke A-rank Asset"), "A-rank title in recentTransactions");
    const types = enriched3.recentTransactions.map((t) => t.type);
    assert(types.includes("card") && types.includes("jpyc"), "both card and jpyc types present");

    // 4. mock fields still populated
    console.log("→ [4] mock fields preserved (jpycBalance, trustScore, trustHistory)");
    assert(enriched3.jpycBalance >= 1000 && enriched3.jpycBalance <= 10000, "jpycBalance in mock range");
    assert(enriched3.trustHistory.length === 7, "trustHistory has 7 entries");

    console.log("\n✓ Passbook DB-enriched smoke test PASSED — 4 scenarios OK");
  } finally {
    console.log("\n→ cleanup");
    await db.delete(checkoutSessions).where(eq(checkoutSessions.buyerId, USER));
    await db.delete(ownershipRecords).where(eq(ownershipRecords.ownerId, USER));
    await db.delete(listings).where(inArray(listings.id, FIXTURES));
  }
}

main().catch((err) => {
  console.error("✗ Passbook smoke FAILED:", err);
  process.exit(1);
});
