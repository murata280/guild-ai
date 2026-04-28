// GUILD AI — API Gateway integration smoke test
// Verifies: secure key generation, hash-only DB storage, payment gating,
// call counter, gateway logs, invalid-key handling.
// Run with: npx tsx scripts/api-gateway-smoke.ts

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
  const { listings, checkoutSessions, apiKeys, gatewayLogs } = await import("../src/db/schema");
  const { eq, inArray } = await import("drizzle-orm");
  const { createHash } = await import("node:crypto");
  const checkout = await import("../src/lib/checkout");
  const gateway = await import("../src/lib/api-gateway");

  const ASSET_ID = "smoke-gateway-" + Date.now();

  console.log("→ seed listing", ASSET_ID);
  await db.insert(listings).values({
    id: ASSET_ID,
    ownerId: "smoke-seller",
    title: "Smoke Asset (gateway)",
    description: "api-gateway integration fixture",
    ccaf: { intentSignals: [], thoughtDensity: 50, iterations: 1, authorId: "smoke-seller", createdAt: new Date().toISOString() },
    vercelUptimeDays: 0,
    basePrice: 1000,
    rank: "B",
    floorPrice: 1000,
  });

  try {
    // 1. issueApiKey returns a fresh raw key with gld_ prefix
    console.log("→ [1] issueApiKey returns raw key");
    const k1 = await gateway.issueApiKey("buyer-x", ASSET_ID);
    assert(k1.key.startsWith("gld_"), "raw key has gld_ prefix");
    assert(k1.key.length >= 30, "raw key length sane (>=30 chars)");
    assert(k1.id.startsWith("key-"), "row id format");

    // 2. DB stores SHA-256 hash, never the raw key
    console.log("→ [2] DB stores SHA-256 hash, never raw");
    const [stored] = await db.select().from(apiKeys).where(eq(apiKeys.id, k1.id));
    const expectedHash = createHash("sha256").update(k1.key).digest("hex");
    assert(stored.keyHash === expectedHash, "DB hash matches SHA-256(raw)");
    assert(stored.keyHash.length === 64, "SHA-256 hex is 64 chars");
    assert(!stored.keyHash.includes(k1.key.slice(4)), "DB hash does NOT contain the raw key body");

    // 3. issueApiKeyVerified rejects unsettled payment
    console.log("→ [3] issueApiKeyVerified rejects unsettled");
    let threw = false;
    try {
      await gateway.issueApiKeyVerified("buyer-y", ASSET_ID, "chk_does_not_exist");
    } catch (err) {
      threw = true;
      assert(err instanceof Error && err.message.includes("GUILD-E401"), "throws GUILD-E401");
    }
    assert(threw, "should have thrown for unsettled payment");

    // 4. With a settled session, issueApiKeyVerified works
    console.log("→ [4] issueApiKeyVerified succeeds after settle");
    const sess = await checkout.createCheckoutSession({
      assetId: ASSET_ID, buyerId: "buyer-y", amountJpy: 1000, method: "card", payoutCurrency: "JPY",
    });
    await checkout.confirmPayment(sess.id);
    const k2 = await gateway.issueApiKeyVerified("buyer-y", ASSET_ID, sess.id);
    assert(k2.key.startsWith("gld_") && k2.key !== k1.key, "second issuance returns DIFFERENT raw key");

    // 5. proxyRequest increments callCount + writes a log
    console.log("→ [5] proxyRequest increments callCount and logs");
    const proxy1 = await gateway.proxyRequest(k1.id, { input: "test" });
    assert(proxy1.success, "proxy success");
    assert(proxy1.latencyMs > 0, "latency reported");

    const k1After = await gateway.getApiKey(k1.id);
    assert(k1After?.callCount === 1, "callCount incremented to 1");
    assert(k1After?.key === "", "getApiKey does NOT return raw key");

    const proxy2 = await gateway.proxyRequest(k1.id, { input: "test2" });
    assert(proxy2.success, "second proxy success");
    const k1After2 = await gateway.getApiKey(k1.id);
    assert(k1After2?.callCount === 2, "callCount = 2");

    // 6. getLogs returns log entries
    console.log("→ [6] getLogs");
    const logs = await gateway.getLogs(k1.id);
    assert(logs.length === 2, `expected 2 logs, got ${logs.length}`);
    assert(logs.every((l) => l.success), "all logs success");

    // 7. proxyRequest with invalid id fails cleanly (no throw)
    console.log("→ [7] proxyRequest invalid id");
    const proxyBad = await gateway.proxyRequest("key-does-not-exist", { input: "x" });
    assert(!proxyBad.success, "invalid key returns success=false");
    assert(proxyBad.error === "Invalid API key", "error message");

    // 8. getApiKey on missing returns undefined
    console.log("→ [8] getApiKey missing");
    assert((await gateway.getApiKey("key-nope")) === undefined, "missing returns undefined");

    console.log("\n✓ API Gateway integration test PASSED — all 8 scenarios OK");
  } finally {
    console.log("\n→ cleanup");
    const ourKeys = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(eq(apiKeys.assetId, ASSET_ID));
    if (ourKeys.length) {
      await db.delete(gatewayLogs).where(inArray(gatewayLogs.apiKeyId, ourKeys.map((k) => k.id)));
    }
    await db.delete(apiKeys).where(eq(apiKeys.assetId, ASSET_ID));
    await db.delete(checkoutSessions).where(eq(checkoutSessions.assetId, ASSET_ID));
    await db.delete(listings).where(eq(listings.id, ASSET_ID));
  }
}

main().catch((err) => {
  console.error("✗ API Gateway smoke FAILED:", err);
  process.exit(1);
});
