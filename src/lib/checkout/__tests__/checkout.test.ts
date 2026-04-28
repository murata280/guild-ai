// Integration tests — hit the real Postgres via Drizzle.
// Skipped automatically when DATABASE_URL is not set (e.g. fresh clone, CI w/o DB).
//
// FK note: checkout_sessions.asset_id → listings.id, so each test seeds a listing
// fixture and tears it down. Uses a unique suffix per run to avoid collisions if
// vitest is run in parallel against a shared dev DB.

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import {
  createCheckoutSession,
  confirmPayment,
  cancelCheckoutSession,
  isPaymentSettled,
  _resetStore,
} from "../index";
import { db } from "@/db/client";
import { listings } from "@/db/schema";

const HAS_DB = !!process.env.DATABASE_URL;
const FIXTURE_ID = `test-listing-checkout-${Date.now()}`;

describe.skipIf(!HAS_DB)("checkout (DB integration)", () => {
  beforeAll(async () => {
    await db.insert(listings).values({
      id: FIXTURE_ID,
      ownerId: "test-owner",
      title: "Checkout test fixture",
      description: "fixture for FK satisfaction",
      ccaf: {
        intentSignals: [],
        thoughtDensity: 50,
        iterations: 1,
        authorId: "test-owner",
        createdAt: new Date().toISOString(),
      },
      vercelUptimeDays: 0,
      basePrice: 1000,
      rank: "B",
      floorPrice: 1000,
    });
  });

  afterAll(async () => {
    await db.delete(listings).where(eq(listings.id, FIXTURE_ID));
  });

  beforeEach(() => _resetStore());

  describe("createCheckoutSession", () => {
    it("creates a pending session with 1:1 JPY/JPYC amounts", async () => {
      const s = await createCheckoutSession({
        assetId: FIXTURE_ID,
        buyerId: "buyer-1",
        amountJpy: 5000,
        method: "card",
        payoutCurrency: "JPY",
      });
      expect(s.status).toBe("pending");
      expect(s.amountJpy).toBe(5000);
      expect(s.amountJpyc).toBe(5000);
      expect(s.id.startsWith("chk_")).toBe(true);
    });

    it("supports all four payment methods", async () => {
      for (const method of ["card", "bank", "jpyc", "onramp"] as const) {
        const s = await createCheckoutSession({
          assetId: FIXTURE_ID,
          buyerId: "b",
          amountJpy: 1000,
          method,
          payoutCurrency: "JPY",
        });
        expect(s.method).toBe(method);
      }
    });
  });

  describe("confirmPayment", () => {
    it("settles a pending session and returns receiptUrl for card", async () => {
      const s = await createCheckoutSession({
        assetId: FIXTURE_ID,
        buyerId: "b",
        amountJpy: 1000,
        method: "card",
        payoutCurrency: "JPY",
      });
      const result = await confirmPayment(s.id);
      expect(result.status).toBe("settled");
      expect(result.receiptUrl).toBeDefined();
      expect(await isPaymentSettled(s.id)).toBe(true);
    });

    it("returns txHash for jpyc method", async () => {
      const s = await createCheckoutSession({
        assetId: FIXTURE_ID,
        buyerId: "b",
        amountJpy: 1000,
        method: "jpyc",
        payoutCurrency: "JPYC",
      });
      const result = await confirmPayment(s.id);
      expect(result.txHash).toBeDefined();
      expect(result.receiptUrl).toBeUndefined();
    });
  });

  describe("cancelCheckoutSession", () => {
    it("cancels a pending session", async () => {
      const s = await createCheckoutSession({
        assetId: FIXTURE_ID,
        buyerId: "b",
        amountJpy: 1000,
        method: "bank",
        payoutCurrency: "JPY",
      });
      expect(await cancelCheckoutSession(s.id)).toBe(true);
      expect(await isPaymentSettled(s.id)).toBe(false);
    });

    it("returns false when cancelling a non-existent session", async () => {
      expect(await cancelCheckoutSession("chk_nonexistent")).toBe(false);
    });
  });
});
