import { describe, it, expect } from "vitest";
import { getNextDelta, PSEUDO_DELTAS } from "../index";

describe("live-earnings deterministic helpers", () => {
  it("getNextDelta wraps around PSEUDO_DELTAS array", () => {
    const len = PSEUDO_DELTAS.length;
    const a = getNextDelta(0);
    const b = getNextDelta(len);
    expect(a).toBe(b);
  });

  it("getNextDelta returns positive amounts", () => {
    for (let i = 0; i < 16; i++) {
      expect(getNextDelta(i)).toBeGreaterThan(0);
    }
  });

  it("all pseudo deltas are positive integers", () => {
    for (const d of PSEUDO_DELTAS) {
      expect(d).toBeGreaterThan(0);
      expect(Number.isInteger(d)).toBe(true);
    }
  });

  it("pseudo deltas stay in reasonable range (50–500 JPY per AtoA bump)", () => {
    for (const d of PSEUDO_DELTAS) {
      expect(d).toBeGreaterThanOrEqual(50);
      expect(d).toBeLessThanOrEqual(500);
    }
  });
});
