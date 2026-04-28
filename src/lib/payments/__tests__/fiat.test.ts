import { describe, it, expect, beforeEach } from "vitest";
import { createStripeMockSession, confirmStripeMock, _resetStore } from "../fiat";

beforeEach(() => _resetStore());

describe("createStripeMockSession", () => {
  it("returns session with correct amount and method", () => {
    const s = createStripeMockSession(5000, "card");
    expect(s.amount).toBe(5000);
    expect(s.method).toBe("card");
    expect(s.id.startsWith("pi_mock_")).toBe(true);
    expect(s.receiptUrl).toContain("stripe.com");
  });
});

describe("confirmStripeMock", () => {
  it("confirms an existing session", () => {
    const s = createStripeMockSession(3000, "bank");
    const result = confirmStripeMock(s.id);
    expect(result.success).toBe(true);
    expect(result.receiptUrl).toBeDefined();
  });

  it("fails for unknown session id", () => {
    const result = confirmStripeMock("pi_mock_unknown");
    expect(result.success).toBe(false);
  });
});
