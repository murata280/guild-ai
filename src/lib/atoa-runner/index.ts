// GUILD AI — AtoA Runner (Auto-Instantiate + Health Check + Self-QA)
// Lifecycle: instantiate → run → health check → release escrow (or refund on failure)

import type { AgentInstance, HealthCheckResult, AtoaRunResult } from "@/types";
import { createAtoaEscrow, releaseAtoaEscrow, refundAtoaEscrow, recordMicropayment } from "@/lib/atoa-escrow";

let instanceCounter = 0;
const instanceStore = new Map<string, AgentInstance>();

// Deterministic health: agents with "degraded" in their id always fail (test hook)
function isHealthy(agentId: string): boolean {
  return !agentId.includes("degraded");
}

export function instantiateAgent(agentId: string): AgentInstance {
  const instanceId = `inst_${Date.now()}_${(++instanceCounter).toString().padStart(4, "0")}`;
  const instance: AgentInstance = {
    instanceId,
    agentId,
    startedAt: Date.now(),
    status: "running",
  };
  instanceStore.set(instanceId, instance);
  return instance;
}

export function healthCheck(instanceId: string): HealthCheckResult {
  const instance = instanceStore.get(instanceId);
  if (!instance) {
    return { instanceId, ok: false, latencyMs: 0, checkedAt: Date.now() };
  }

  const ok = isHealthy(instance.agentId);
  const latencyMs = ok ? 40 + Math.floor(Math.abs(instanceId.charCodeAt(5) * 7) % 120) : 0;
  instance.status = ok ? "healthy" : "degraded";

  return { instanceId, ok, latencyMs, checkedAt: Date.now() };
}

export function stopInstance(instanceId: string): void {
  const instance = instanceStore.get(instanceId);
  if (instance) instance.status = "stopped";
}

export function getInstance(instanceId: string): AgentInstance | undefined {
  return instanceStore.get(instanceId);
}

/**
 * runWithQA — full AtoA execution pipeline:
 *  1. Create non-custodial escrow
 *  2. Instantiate agent
 *  3. Health check — if degraded → refund escrow and return failure
 *  4. Execute (mocked output generation)
 *  5. Record micropayment
 *  6. Release escrow
 */
export function runWithQA(
  agentId: string,
  input: string,
  amount = 500
): AtoaRunResult {
  const escrow = createAtoaEscrow(agentId, "system", amount);
  const instance = instantiateAgent(agentId);
  const health = healthCheck(instance.instanceId);

  if (!health.ok) {
    refundAtoaEscrow(escrow.id);
    stopInstance(instance.instanceId);
    return {
      success: false,
      instanceId: instance.instanceId,
      output: "",
      refundIssued: true,
      refundReason: `健全性チェック失敗 — エージェント ${agentId} は応答不良`,
      durationMs: health.latencyMs,
    };
  }

  // Mock output: deterministic based on agentId + input length
  const outputSeed = agentId.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const outputVariants = [
    "タスクを受理し、処理を完了しました。",
    "入力を解析し、最適な結果を生成しました。",
    "要求を処理し、レスポンスを送信します。",
    "知能資産が正常に起動し、実行が完了しました。",
  ];
  const output = outputVariants[Math.abs(outputSeed) % outputVariants.length];

  recordMicropayment(escrow.id, Math.floor(amount / 10));
  releaseAtoaEscrow(escrow.id);
  stopInstance(instance.instanceId);

  return {
    success: true,
    instanceId: instance.instanceId,
    output: `${output} (入力文字数: ${input.length})`,
    refundIssued: false,
    durationMs: health.latencyMs + 10,
  };
}

export function _resetRunner(): void {
  instanceStore.clear();
  instanceCounter = 0;
}
