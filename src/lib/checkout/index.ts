// GUILD AI — Checkout
// Postgres-backed unified checkout session manager for fiat (card/bank) and JPYC.
// status transitions use conditional UPDATE so concurrent confirms can't double-settle.

import { and, eq } from "drizzle-orm";
import type { CheckoutSession, PaymentMethod, Currency, PaymentResult } from "@/types";
import { db } from "@/db/client";
import { checkoutSessions } from "@/db/schema";

type CheckoutRow = typeof checkoutSessions.$inferSelect;

function rowToSession(row: CheckoutRow): CheckoutSession {
  return {
    id: row.id,
    assetId: row.assetId,
    buyerId: row.buyerId,
    amountJpy: row.amountJpy,
    amountJpyc: row.amountJpyc,
    method: row.method,
    payoutCurrency: row.payoutCurrency,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Two-Way Pricing ──────────────────────────────────────────────────────────
// Pure pricing helpers (from upstream). No DB; used by sell/listing UIs to suggest tiers.

export interface BundlePricing {
  monthlyJpy: number;
  oneoffJpy: number;      // monthly × 12
  perCallJpyc: number;   // monthly ÷ 2000, min 0.1
}

export function computeBundlePricing(monthlyJpy: number): BundlePricing {
  return {
    monthlyJpy,
    oneoffJpy: monthlyJpy * 12,
    perCallJpyc: Math.max(0.1, Math.round((monthlyJpy / 2000) * 10) / 10),
  };
}

export function computeMonthlyFromFloor(floorPrice: number): number {
  return Math.round(floorPrice / 12);
}

export interface CreateCheckoutParams {
  assetId: string;
  buyerId: string;
  amountJpy: number;
  method: PaymentMethod;
  payoutCurrency: Currency;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
  const id = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const [row] = await db
    .insert(checkoutSessions)
    .values({
      id,
      assetId: params.assetId,
      buyerId: params.buyerId,
      amountJpy: params.amountJpy,
      amountJpyc: params.amountJpy, // 1:1 peg
      method: params.method,
      payoutCurrency: params.payoutCurrency,
      status: "pending",
    })
    .returning();
  return rowToSession(row);
}

export async function confirmPayment(sessionId: string): Promise<PaymentResult> {
  // Atomic: only flip pending → settled. Returns no row if already settled/failed.
  const [row] = await db
    .update(checkoutSessions)
    .set({ status: "settled" })
    .where(and(eq(checkoutSessions.id, sessionId), eq(checkoutSessions.status, "pending")))
    .returning();

  if (!row) return { sessionId, status: "failed" };

  if (row.method === "jpyc" || row.method === "onramp") {
    return {
      sessionId,
      status: "settled",
      txHash: `0x${Math.random().toString(16).slice(2).padStart(16, "0")}`,
    };
  }
  return {
    sessionId,
    status: "settled",
    receiptUrl: `https://stripe.com/receipts/mock/${sessionId}`,
  };
}

export async function cancelCheckoutSession(sessionId: string): Promise<boolean> {
  const [row] = await db
    .update(checkoutSessions)
    .set({ status: "failed" })
    .where(and(eq(checkoutSessions.id, sessionId), eq(checkoutSessions.status, "pending")))
    .returning({ id: checkoutSessions.id });
  return !!row;
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession | undefined> {
  const [row] = await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, sessionId));
  return row ? rowToSession(row) : undefined;
}

export async function isPaymentSettled(sessionId: string): Promise<boolean> {
  const [row] = await db
    .select({ status: checkoutSessions.status })
    .from(checkoutSessions)
    .where(eq(checkoutSessions.id, sessionId));
  return row?.status === "settled";
}

// Test-only. Wipes ALL checkout sessions — do not call in production.
export async function _resetStore(): Promise<void> {
  await db.delete(checkoutSessions);
}
