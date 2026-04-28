// GUILD AI — Checkout
// Unified checkout session manager for fiat (card/bank) and JPYC stablecoin.

import type { CheckoutSession, PaymentMethod, Currency, PaymentResult } from "@/types";

const sessionStore = new Map<string, CheckoutSession>();

export interface CreateCheckoutParams {
  assetId: string;
  buyerId: string;
  amountJpy: number;
  method: PaymentMethod;
  payoutCurrency: Currency;
}

export function createCheckoutSession(params: CreateCheckoutParams): CheckoutSession {
  const session: CheckoutSession = {
    id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    assetId: params.assetId,
    buyerId: params.buyerId,
    amountJpy: params.amountJpy,
    amountJpyc: params.amountJpy, // 1:1 peg
    method: params.method,
    payoutCurrency: params.payoutCurrency,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  sessionStore.set(session.id, session);
  return session;
}

export function confirmPayment(sessionId: string): PaymentResult {
  const session = sessionStore.get(sessionId);
  if (!session || session.status !== "pending") {
    return { sessionId, status: "failed" };
  }

  session.status = "settled";

  if (session.method === "jpyc" || session.method === "onramp") {
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

export function cancelCheckoutSession(sessionId: string): boolean {
  const session = sessionStore.get(sessionId);
  if (!session || session.status !== "pending") return false;
  session.status = "failed";
  return true;
}

export function getCheckoutSession(sessionId: string): CheckoutSession | undefined {
  return sessionStore.get(sessionId);
}

export function isPaymentSettled(sessionId: string): boolean {
  return sessionStore.get(sessionId)?.status === "settled";
}

export function _resetStore(): void {
  sessionStore.clear();
}
