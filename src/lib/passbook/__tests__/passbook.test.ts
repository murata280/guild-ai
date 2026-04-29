import { describe, it, expect } from "vitest";
import { getPassbookSnapshot, getMonthlyEarnings } from "../index";

describe("getPassbookSnapshot", () => {
  it("returns deterministic snapshot for same userId", () => {
    const a = getPassbookSnapshot("user-abc");
    const b = getPassbookSnapshot("user-abc");
    expect(a.jpycBalance).toBe(b.jpycBalance);
    expect(a.trustScore).toBe(b.trustScore);
  });

  it("has jpycBalance in range 1000–10000", () => {
    const snap = getPassbookSnapshot("user-xyz");
    expect(snap.jpycBalance).toBeGreaterThanOrEqual(1000);
    expect(snap.jpycBalance).toBeLessThanOrEqual(10000);
  });

  it("trustHistory has exactly 7 entries all in range 0–1000", () => {
    const snap = getPassbookSnapshot("user-test");
    expect(snap.trustHistory).toHaveLength(7);
    snap.trustHistory.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1000);
    });
  });

  it("recentTransactions has exactly 3 entries with positive amounts", () => {
    const snap = getPassbookSnapshot("user-tx");
    expect(snap.recentTransactions).toHaveLength(3);
    snap.recentTransactions.forEach((tx) => {
      expect(tx.amount).toBeGreaterThan(0);
      expect(["card", "jpyc"]).toContain(tx.type);
    });
  });
});

describe("getMonthlyEarnings", () => {
  it("returns positive jpy in reasonable range", () => {
    const e = getMonthlyEarnings("demo-user");
    expect(e.jpy).toBeGreaterThanOrEqual(8000);
    expect(e.jpy).toBeLessThanOrEqual(21000);
  });

  it("breakdown amounts sum to total jpy", () => {
    const e = getMonthlyEarnings("demo-user");
    const sum = e.breakdown.reduce((acc, b) => acc + b.amount, 0);
    expect(sum).toBe(e.jpy);
  });

  it("returns 3 breakdown items with labels", () => {
    const e = getMonthlyEarnings("demo-user");
    expect(e.breakdown).toHaveLength(3);
    for (const b of e.breakdown) {
      expect(typeof b.label).toBe("string");
      expect(b.amount).toBeGreaterThan(0);
    }
  });

  it("is deterministic", () => {
    const a = getMonthlyEarnings("bob");
    const b = getMonthlyEarnings("bob");
    expect(a.jpy).toBe(b.jpy);
  });
});
