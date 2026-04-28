// GUILD AI — Payout Preferences
// Creators choose their preferred settlement currency (JPY or JPYC).
// 1:1 exchange rate for mock — no real FX or bridging.

import type { Currency, PayoutPreference } from "@/types";

const prefStore = new Map<string, PayoutPreference>();

export function getPayoutPreference(creatorId: string): PayoutPreference {
  return prefStore.get(creatorId) ?? { creatorId, currency: "JPY" };
}

export function setPayoutPreference(
  creatorId: string,
  currency: Currency,
  walletId?: string
): PayoutPreference {
  const pref: PayoutPreference = { creatorId, currency, walletId };
  prefStore.set(creatorId, pref);
  return pref;
}

export function resolvePayoutAmount(
  amountJpy: number,
  creatorPreference: Currency
): { currency: Currency; amount: number } {
  // 1:1 mock — no real conversion
  return { currency: creatorPreference, amount: amountJpy };
}

export function _resetStore(): void {
  prefStore.clear();
}
