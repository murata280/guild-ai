import { describe, it, expect, beforeEach } from "vitest";
import {
  createCheckoutSession,
  confirmPayment,
  cancelCheckoutSession,
  isPaymentSettled,
  _resetStore,
} from "../index";

beforeEach(() => _resetStore());

describe("createCheckoutSession", () => {
  it("creates a pending session with 1:1 JPY/JPYC amounts", () => {
    const s = createCheckoutSession({
      assetId: "asset-001",
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

  it("supports all four payment methods", () => {
    for (const method of ["card", "bank", "jpyc", "onramp"] as const) {
      const s = createCheckoutSession({
        assetId: "asset-001",
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
  it("settles a pending session and returns receiptUrl for card", () => {
    const s = createCheckoutSession({
      assetId: "a",
      buyerId: "b",
      amountJpy: 1000,
      method: "card",
      payoutCurrency: "JPY",
    });
    const result = confirmPayment(s.id);
    expect(result.status).toBe("settled");
    expect(result.receiptUrl).toBeDefined();
    expect(isPaymentSettled(s.id)).toBe(true);
  });

  it("returns txHash for jpyc method", () => {
    const s = createCheckoutSession({
      assetId: "a",
      buyerId: "b",
      amountJpy: 1000,
      method: "jpyc",
      payoutCurrency: "JPYC",
    });
    const result = confirmPayment(s.id);
    expect(result.txHash).toBeDefined();
    expect(result.receiptUrl).toBeUndefined();
  });
});

describe("cancelCheckoutSession", () => {
  it("cancels a pending session", () => {
    const s = createCheckoutSession({
      assetId: "a",
      buyerId: "b",
      amountJpy: 1000,
      method: "bank",
      payoutCurrency: "JPY",
    });
    expect(cancelCheckoutSession(s.id)).toBe(true);
    expect(isPaymentSettled(s.id)).toBe(false);
  });

  it("returns false when cancelling a non-existent session", () => {
    expect(cancelCheckoutSession("chk_nonexistent")).toBe(false);
  });
});
