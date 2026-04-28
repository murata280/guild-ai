import { describe, it, expect, beforeEach } from "vitest";
import {
  createAtoaEscrow,
  releaseAtoaEscrow,
  refundAtoaEscrow,
  getAtoaEscrow,
  recordMicropayment,
  settleMicropayment,
  getMicropaymentTotal,
  _resetStores,
} from "../index";

beforeEach(() => _resetStores());

describe("createAtoaEscrow", () => {
  it("creates a held escrow with correct fields", () => {
    const session = createAtoaEscrow("agent-001", "caller-abc", 5000);
    expect(session.id).toMatch(/^esw_/);
    expect(session.agentId).toBe("agent-001");
    expect(session.callerId).toBe("caller-abc");
    expect(session.amount).toBe(5000);
    expect(session.status).toBe("held");
    expect(session.createdAt).toBeGreaterThan(0);
  });

  it("generates unique IDs for multiple sessions", () => {
    const a = createAtoaEscrow("agent-001", "caller-1", 1000);
    const b = createAtoaEscrow("agent-001", "caller-2", 2000);
    expect(a.id).not.toBe(b.id);
  });
});

describe("releaseAtoaEscrow", () => {
  it("transitions held → released and sets releasedAt", () => {
    const session = createAtoaEscrow("agent-002", "caller-xyz", 3000);
    const released = releaseAtoaEscrow(session.id);
    expect(released.status).toBe("released");
    expect(released.releasedAt).toBeGreaterThan(0);
  });

  it("throws if escrow not found", () => {
    expect(() => releaseAtoaEscrow("esw_nonexistent")).toThrow("E404");
  });

  it("throws if already released", () => {
    const session = createAtoaEscrow("agent-003", "caller-1", 1000);
    releaseAtoaEscrow(session.id);
    expect(() => releaseAtoaEscrow(session.id)).toThrow("E409");
  });
});

describe("refundAtoaEscrow", () => {
  it("transitions held → refunded", () => {
    const session = createAtoaEscrow("agent-004", "caller-1", 2000);
    const refunded = refundAtoaEscrow(session.id);
    expect(refunded.status).toBe("refunded");
  });

  it("is idempotent on already-refunded sessions", () => {
    const session = createAtoaEscrow("agent-005", "caller-1", 1500);
    refundAtoaEscrow(session.id);
    const second = refundAtoaEscrow(session.id);
    expect(second.status).toBe("refunded");
  });

  it("throws when refunding a released escrow", () => {
    const session = createAtoaEscrow("agent-006", "caller-1", 1000);
    releaseAtoaEscrow(session.id);
    expect(() => refundAtoaEscrow(session.id)).toThrow("E409");
  });
});

describe("recordMicropayment + getMicropaymentTotal", () => {
  it("accumulates calls on the same escrow", () => {
    const session = createAtoaEscrow("agent-007", "caller-1", 9000);
    const r1 = recordMicropayment(session.id, 100);
    const r2 = recordMicropayment(session.id, 100);
    expect(r1.id).toBe(r2.id);
    expect(r2.callCount).toBe(2);
    expect(r2.totalBilled).toBe(200);
  });

  it("getMicropaymentTotal sums settled records for an agent", () => {
    const s = createAtoaEscrow("agent-008", "caller-1", 5000);
    const rec = recordMicropayment(s.id, 500);
    recordMicropayment(s.id, 500);
    settleMicropayment(rec.id);
    const total = getMicropaymentTotal("agent-008");
    expect(total).toBe(1000);
  });

  it("does not count pending micropayments in total", () => {
    const s = createAtoaEscrow("agent-009", "caller-1", 3000);
    recordMicropayment(s.id, 300);
    expect(getMicropaymentTotal("agent-009")).toBe(0);
  });
});
