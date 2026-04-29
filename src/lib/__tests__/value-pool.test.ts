import { describe, it, expect } from "vitest";
import { recordUnclaimedUsage, getValuePool, releaseRetroactive } from "@/lib/value-pool";

// Use unique asset IDs per test to avoid cross-test contamination
// since pools is a module-level Map that persists across tests.

describe("value-pool", () => {
  it("recordUnclaimedUsage accumulates amounts", () => {
    recordUnclaimedUsage("vp-test-001", 500);
    recordUnclaimedUsage("vp-test-001", 300);
    const pool = getValuePool("vp-test-001");
    expect(pool).not.toBeNull();
    expect(pool!.totalPooledJpy).toBe(800);
    expect(pool!.perUseHistory).toHaveLength(2);
  });

  it("getValuePool returns correct total", () => {
    recordUnclaimedUsage("vp-test-002", 1000);
    const pool = getValuePool("vp-test-002");
    expect(pool).not.toBeNull();
    expect(pool!.totalPooledJpy).toBe(1000);
  });

  it("getValuePool returns null if no pool exists", () => {
    expect(getValuePool("vp-nonexistent-xyz")).toBeNull();
  });

  it("releaseRetroactive sets distributedYet=true and returns releasedJpy", () => {
    recordUnclaimedUsage("vp-test-003", 750);
    const result = releaseRetroactive("vp-test-003", "claimer-001");
    expect(result).toEqual({ releasedJpy: 750 });
    const pool = getValuePool("vp-test-003");
    expect(pool!.distributedYet).toBe(true);
    expect(pool!.claimerId).toBe("claimer-001");
  });

  it("releaseRetroactive returns error if already distributed", () => {
    recordUnclaimedUsage("vp-test-004", 500);
    releaseRetroactive("vp-test-004", "claimer-002");
    const result = releaseRetroactive("vp-test-004", "claimer-002");
    expect(result).toEqual({ error: "already_distributed" });
  });

  it("releaseRetroactive returns error if no pool exists", () => {
    const result = releaseRetroactive("vp-nonexistent-abc", "claimer");
    expect(result).toEqual({ error: "no_pool" });
  });
});
