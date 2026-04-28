"use server";

// GUILD AI — Checkout Server Action
// Bridges the "use client" CheckoutSection to server-only DB code.
// Without this layer, importing lib/checkout (and its db/client dep) into a
// client component would bundle Neon for the browser and throw at runtime.

import { createCheckoutSession, confirmPayment } from "@/lib/checkout";
import { issueApiKeyVerified } from "@/lib/api-gateway";
import type { PaymentMethod, Currency } from "@/types";

export interface PurchaseInput {
  assetId: string;
  amountJpy: number;
  method: PaymentMethod;
  payoutCurrency: Currency;
}

export type PurchaseResult =
  | { status: "settled"; apiKey: string; receiptUrl?: string; txHash?: string }
  | { status: "failed"; message: string };

export async function purchaseAction(input: PurchaseInput): Promise<PurchaseResult> {
  try {
    const session = await createCheckoutSession({
      assetId: input.assetId,
      buyerId: "demo-buyer", // TODO: replace with authenticated user when auth lands
      amountJpy: input.amountJpy,
      method: input.method,
      payoutCurrency: input.payoutCurrency,
    });
    const result = await confirmPayment(session.id);
    if (result.status !== "settled") {
      return { status: "failed", message: "決済に失敗しました。再度お試しください。" };
    }
    const apiKey = await issueApiKeyVerified("demo-buyer", input.assetId, session.id);
    return {
      status: "settled",
      apiKey: apiKey.key,
      receiptUrl: result.receiptUrl,
      txHash: result.txHash,
    };
  } catch (err) {
    return {
      status: "failed",
      message: err instanceof Error ? err.message : "エラーが発生しました",
    };
  }
}
