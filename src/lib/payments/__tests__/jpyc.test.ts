import { describe, it, expect, beforeEach } from "vitest";
import {
  createJpycMockTx,
  confirmJpycMock,
  getJpycBalance,
  onrampJpyc,
  _resetStore,
} from "../jpyc";

beforeEach(() => _resetStore());

describe("createJpycMockTx + confirmJpycMock", () => {
  it("creates pending tx and confirms it", () => {
    const tx = createJpycMockTx(1000);
    expect(tx.status).toBe("pending");
    expect(tx.txHash.startsWith("0x")).toBe(true);

    const result = confirmJpycMock(tx.txHash);
    expect(result.confirmed).toBe(true);
  });

  it("returns false when confirming unknown txHash", () => {
    expect(confirmJpycMock("0xdeadbeef").confirmed).toBe(false);
  });
});

describe("getJpycBalance", () => {
  it("returns default 10000 for unknown wallet", () => {
    expect(getJpycBalance("wallet_unknown")).toBe(10000);
  });
});

describe("onrampJpyc", () => {
  it("returns jpycAmount at 1:1 ratio", () => {
    const result = onrampJpyc(5000, "tok_visa_mock");
    expect(result.jpycAmount).toBe(5000);
    expect(result.txHash.startsWith("0x")).toBe(true);
    expect(result.receiptUrl).toBeDefined();
  });
});
