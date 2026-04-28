import { describe, it, expect } from "vitest";
import { getPassbookSnapshot } from "../index";

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
