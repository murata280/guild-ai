// GUILD AI — AtoA Escrow + Micropayment Billing
// Non-custodial escrow for autonomous Agent-to-Agent transactions.
// Funds are held until the agent execution completes successfully, then released.
// On health-check failure, auto-refund is issued.

import type { AtoaEscrowSession, MicropaymentRecord } from "@/types";

let escrowCounter = 0;
let payCounter = 0;
const escrowStore = new Map<string, AtoaEscrowSession>();
const micropayStore = new Map<string, MicropaymentRecord>();

export function createAtoaEscrow(
  agentId: string,
  callerId: string,
  amount: number
): AtoaEscrowSession {
  const id = `esw_${Date.now()}_${(++escrowCounter).toString().padStart(4, "0")}`;
  const session: AtoaEscrowSession = {
    id,
    agentId,
    callerId,
    amount,
    status: "held",
    createdAt: Date.now(),
  };
  escrowStore.set(id, session);
  return session;
}

export function releaseAtoaEscrow(id: string): AtoaEscrowSession {
  const session = escrowStore.get(id);
  if (!session) throw new Error(`GUILD-E404: Escrow session ${id} not found`);
  if (session.status !== "held") throw new Error(`GUILD-E409: Cannot release escrow in status "${session.status}"`);
  session.status = "released";
  session.releasedAt = Date.now();
  return session;
}

export function refundAtoaEscrow(id: string): AtoaEscrowSession {
  const session = escrowStore.get(id);
  if (!session) throw new Error(`GUILD-E404: Escrow session ${id} not found`);
  if (session.status === "refunded") return session;
  if (session.status === "released") throw new Error(`GUILD-E409: Cannot refund already-released escrow`);
  session.status = "refunded";
  session.releasedAt = Date.now();
  return session;
}

export function getAtoaEscrow(id: string): AtoaEscrowSession | undefined {
  return escrowStore.get(id);
}

export function recordMicropayment(
  escrowId: string,
  perCallAmount: number
): MicropaymentRecord {
  const existing = [...micropayStore.values()].find((r) => r.escrowId === escrowId);
  if (existing) {
    existing.callCount += 1;
    existing.totalBilled += perCallAmount;
    return existing;
  }
  const escrow = escrowStore.get(escrowId);
  const id = `pay_${Date.now()}_${(++payCounter).toString().padStart(4, "0")}`;
  const record: MicropaymentRecord = {
    id,
    escrowId,
    agentId: escrow?.agentId ?? "unknown",
    perCallAmount,
    callCount: 1,
    totalBilled: perCallAmount,
    status: "pending",
  };
  micropayStore.set(id, record);
  return record;
}

export function settleMicropayment(id: string): MicropaymentRecord {
  const record = micropayStore.get(id);
  if (!record) throw new Error(`GUILD-E404: Micropayment record ${id} not found`);
  record.status = "settled";
  return record;
}

export function getMicropaymentTotal(agentId: string): number {
  return [...micropayStore.values()]
    .filter((r) => r.agentId === agentId && r.status === "settled")
    .reduce((sum, r) => sum + r.totalBilled, 0);
}

export function _resetStores(): void {
  escrowStore.clear();
  micropayStore.clear();
  escrowCounter = 0;
  payCounter = 0;
}
