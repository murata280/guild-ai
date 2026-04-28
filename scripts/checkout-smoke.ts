// GUILD AI — Checkout integration smoke test
// Run with: npx tsx scripts/checkout-smoke.ts

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
  const { listings, checkoutSessions } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");
  const checkout = await import("../src/lib/checkout");

  const ASSET_ID = "smoke-checkout-" + Date.now();

  console.log("→ seed listing", ASSET_ID);
  await db.insert(listings).values({
    id: ASSET_ID,
    ownerId: "smoke-seller",
    title: "Smoke Asset (checkout)",
    description: "checkout integration fixture",
    ccaf: {
      intentSignals: [],
      thoughtDensity: 50,
      iterations: 1,
      authorId: "smoke-seller",
      createdAt: new Date().toISOString(),
    },
    vercelUptimeDays: 0,
    basePrice: 5000,
    rank: "B",
    floorPrice: 5000,
  });

  try {
    // 1. create card session
    console.log("→ [1] createCheckoutSession (card)");
    const s1 = await checkout.createCheckoutSession({
      assetId: ASSET_ID, buyerId: "buyer-1", amountJpy: 5000, method: "card", payoutCurrency: "JPY",
    });
    assert(s1.status === "pending", "expected pending");
    assert(s1.amountJpyc === 5000, "1:1 peg");
    assert(s1.id.startsWith("chk_"), "id format");

    // 2. card confirm → receiptUrl
    console.log("→ [2] confirmPayment (card → receiptUrl)");
    const r1 = await checkout.confirmPayment(s1.id);
    assert(r1.status === "settled", "card settled");
    assert(typeof r1.receiptUrl === "string", "receiptUrl present");
    assert(r1.txHash === undefined, "no txHash for card");

    // 3. double confirm → failed (atomic guard)
    console.log("→ [3] double confirm (illegal)");
    const r1again = await checkout.confirmPayment(s1.id);
    assert(r1again.status === "failed", "double confirm must be failed");

    // 4. isPaymentSettled
    console.log("→ [4] isPaymentSettled");
    assert((await checkout.isPaymentSettled(s1.id)) === true, "should be settled");

    // 5. jpyc → txHash, no receiptUrl
    console.log("→ [5] jpyc method confirms with txHash");
    const s2 = await checkout.createCheckoutSession({
      assetId: ASSET_ID, buyerId: "buyer-1", amountJpy: 1000, method: "jpyc", payoutCurrency: "JPYC",
    });
    const r2 = await checkout.confirmPayment(s2.id);
    assert(r2.status === "settled" && typeof r2.txHash === "string" && r2.receiptUrl === undefined, "jpyc shape");

    // 6. cancel pending
    console.log("→ [6] cancelCheckoutSession (pending)");
    const s3 = await checkout.createCheckoutSession({
      assetId: ASSET_ID, buyerId: "buyer-1", amountJpy: 200, method: "bank", payoutCurrency: "JPY",
    });
    assert((await checkout.cancelCheckoutSession(s3.id)) === true, "cancel ok");
    assert((await checkout.isPaymentSettled(s3.id)) === false, "cancelled is not settled");

    // 7. cancel after settle → false
    console.log("→ [7] cancelCheckoutSession after settle (illegal)");
    assert((await checkout.cancelCheckoutSession(s1.id)) === false, "cant cancel settled");

    // 8. cancel non-existent → false
    console.log("→ [8] cancel non-existent");
    assert((await checkout.cancelCheckoutSession("chk_nope")) === false, "non-existent");

    console.log("\n✓ Checkout integration test PASSED — all 8 scenarios OK");
  } finally {
    console.log("\n→ cleanup");
    await db.delete(checkoutSessions).where(eq(checkoutSessions.assetId, ASSET_ID));
    await db.delete(listings).where(eq(listings.id, ASSET_ID));
  }
}

main().catch((err) => {
  console.error("✗ Checkout smoke FAILED:", err);
  process.exit(1);
});
