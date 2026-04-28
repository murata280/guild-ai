// GUILD AI — Escrow
// Postgres-backed escrow for fiat and JPYC payments.
// State machine: held → confirmed → released. Transitions use conditional UPDATE
// (WHERE current_status = expected) so concurrent writers can't double-advance.

import { and, eq } from "drizzle-orm";
import type { EscrowRecord, EscrowStatus, PaymentMethod, Currency } from "@/types";
import { resolvePayoutAmount } from "@/lib/payments/payouts";
import { db } from "@/db/client";
import { escrowRecords } from "@/db/schema";

type EscrowRow = typeof escrowRecords.$inferSelect;

function rowToRecord(row: EscrowRow): EscrowRecord {
  return {
    id: row.id,
    buyerId: row.buyerId,
    sellerId: row.sellerId,
    assetId: row.assetId,
    amount: row.amount,
    method: row.method,
    payoutCurrency: row.payoutCurrency,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    releasedAt: row.releasedAt?.toISOString(),
  };
}

export async function holdPayment(
  buyerId: string,
  sellerId: string,
  assetId: string,
  amount: number,
  method: PaymentMethod = "card",
  payoutCurrency: Currency = "JPY"
): Promise<EscrowRecord> {
  const id = `escrow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [row] = await db
    .insert(escrowRecords)
    .values({ id, buyerId, sellerId, assetId, amount, method, payoutCurrency, status: "held" })
    .returning();
  return rowToRecord(row);
}

export async function confirmOnApiSuccess(escrowId: string): Promise<EscrowRecord | undefined> {
  const [row] = await db
    .update(escrowRecords)
    .set({ status: "confirmed" })
    .where(and(eq(escrowRecords.id, escrowId), eq(escrowRecords.status, "held")))
    .returning();
  if (!row) return undefined;
  resolvePayoutAmount(row.amount, row.payoutCurrency);
  return rowToRecord(row);
}

export async function release(escrowId: string): Promise<EscrowRecord | undefined> {
  const [row] = await db
    .update(escrowRecords)
    .set({ status: "released", releasedAt: new Date() })
    .where(and(eq(escrowRecords.id, escrowId), eq(escrowRecords.status, "confirmed")))
    .returning();
  return row ? rowToRecord(row) : undefined;
}

export async function getEscrow(id: string): Promise<EscrowRecord | undefined> {
  const [row] = await db.select().from(escrowRecords).where(eq(escrowRecords.id, id));
  return row ? rowToRecord(row) : undefined;
}

export async function getEscrowStatus(id: string): Promise<EscrowStatus | undefined> {
  const [row] = await db
    .select({ status: escrowRecords.status })
    .from(escrowRecords)
    .where(eq(escrowRecords.id, id));
  return row?.status;
}

// Test-only. Wipes ALL escrow rows — do not call in production.
export async function _resetStore(): Promise<void> {
  await db.delete(escrowRecords);
}
