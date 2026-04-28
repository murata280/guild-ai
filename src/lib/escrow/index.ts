// GUILD AI — Escrow
// Unified escrow for fiat and JPYC payments.
// Funds are held until API success is confirmed, then released.

import type { EscrowRecord, EscrowStatus, PaymentMethod, Currency } from "@/types";
import { resolvePayoutAmount } from "@/lib/payments/payouts";

const escrowStore = new Map<string, EscrowRecord>();

export function holdPayment(
  buyerId: string,
  sellerId: string,
  assetId: string,
  amount: number,
  method: PaymentMethod = "card",
  payoutCurrency: Currency = "JPY"
): EscrowRecord {
  const record: EscrowRecord = {
    id: `escrow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    buyerId,
    sellerId,
    assetId,
    amount,
    method,
    payoutCurrency,
    status: "held",
    createdAt: new Date().toISOString(),
  };
  escrowStore.set(record.id, record);
  return record;
}

export function confirmOnApiSuccess(escrowId: string): EscrowRecord | undefined {
  const record = escrowStore.get(escrowId);
  if (!record || record.status !== "held") return undefined;
  record.status = "confirmed";
  // Resolve payout to creator's preferred currency (1:1 mock)
  resolvePayoutAmount(record.amount, record.payoutCurrency);
  return record;
}

export function release(escrowId: string): EscrowRecord | undefined {
  const record = escrowStore.get(escrowId);
  if (!record || record.status !== "confirmed") return undefined;
  record.status = "released";
  record.releasedAt = new Date().toISOString();
  return record;
}

export function getEscrow(id: string): EscrowRecord | undefined {
  return escrowStore.get(id);
}

export function getEscrowStatus(id: string): EscrowStatus | undefined {
  return escrowStore.get(id)?.status;
}

export function _resetStore(): void {
  escrowStore.clear();
}
