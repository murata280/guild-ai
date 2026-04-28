import { describe, it, expect, beforeEach } from "vitest";
import {
  getPayoutPreference,
  setPayoutPreference,
  resolvePayoutAmount,
  _resetStore,
} from "../payouts";

beforeEach(() => _resetStore());

describe("getPayoutPreference / setPayoutPreference", () => {
  it("defaults to JPY for unknown creator", () => {
    const pref = getPayoutPreference("creator-unknown");
    expect(pref.currency).toBe("JPY");
  });

  it("stores and retrieves preference", () => {
    setPayoutPreference("creator-1", "JPYC", "wallet_abc");
    const pref = getPayoutPreference("creator-1");
    expect(pref.currency).toBe("JPYC");
    expect(pref.walletId).toBe("wallet_abc");
  });
});

describe("resolvePayoutAmount", () => {
  it("passes amount through at 1:1 for JPYC preference", () => {
    const result = resolvePayoutAmount(5000, "JPYC");
    expect(result.amount).toBe(5000);
    expect(result.currency).toBe("JPYC");
  });
});
