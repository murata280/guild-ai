import { describe, it, expect, beforeEach } from "vitest";
import { instantiateAgent, healthCheck, runWithQA, getInstance, _resetRunner } from "../index";
import { _resetStores } from "@/lib/atoa-escrow";

beforeEach(() => {
  _resetRunner();
  _resetStores();
});

describe("instantiateAgent", () => {
  it("creates an instance with 'running' status and inst_ prefix", () => {
    const inst = instantiateAgent("agent-001");
    expect(inst.instanceId).toMatch(/^inst_/);
    expect(inst.agentId).toBe("agent-001");
    expect(inst.status).toBe("running");
    expect(inst.startedAt).toBeGreaterThan(0);
  });

  it("generates unique instanceIds", () => {
    const a = instantiateAgent("agent-001");
    const b = instantiateAgent("agent-001");
    expect(a.instanceId).not.toBe(b.instanceId);
  });
});

describe("healthCheck", () => {
  it("returns ok=true for normal agents", () => {
    const inst = instantiateAgent("agent-001");
    const result = healthCheck(inst.instanceId);
    expect(result.ok).toBe(true);
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.checkedAt).toBeGreaterThan(0);
  });

  it("returns ok=false for degraded agent IDs", () => {
    const inst = instantiateAgent("agent-degraded-001");
    const result = healthCheck(inst.instanceId);
    expect(result.ok).toBe(false);
    expect(result.latencyMs).toBe(0);
  });

  it("returns ok=false for unknown instanceId", () => {
    const result = healthCheck("inst_nonexistent");
    expect(result.ok).toBe(false);
  });

  it("updates instance status to 'healthy' after passing check", () => {
    const inst = instantiateAgent("agent-002");
    healthCheck(inst.instanceId);
    const updated = getInstance(inst.instanceId);
    expect(updated?.status).toBe("healthy");
  });
});

describe("runWithQA", () => {
  it("returns success=true and non-empty output for healthy agent", () => {
    const result = runWithQA("asset-001", "タスクを実行してください");
    expect(result.success).toBe(true);
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.refundIssued).toBe(false);
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it("returns success=false and refundIssued=true for degraded agent", () => {
    const result = runWithQA("agent-degraded-x", "some input");
    expect(result.success).toBe(false);
    expect(result.refundIssued).toBe(true);
    expect(result.refundReason).toBeTruthy();
    expect(result.output).toBe("");
  });

  it("output includes input character count", () => {
    const input = "テスト入力";
    const result = runWithQA("asset-002", input);
    expect(result.output).toContain(String(input.length));
  });

  it("is deterministic for same agentId", () => {
    const a = runWithQA("asset-003", "同じ入力");
    const b = runWithQA("asset-003", "同じ入力");
    expect(a.output).toBe(b.output);
    expect(a.success).toBe(b.success);
  });
});
