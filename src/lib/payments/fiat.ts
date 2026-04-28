// GUILD AI — Fiat Payments (Stripe mock)
// No real Stripe calls — deterministic mock for demo.

export interface StripeMockSession {
  id: string;
  method: "card" | "bank";
  amount: number;
  receiptUrl: string;
}

const stripeStore = new Map<string, StripeMockSession>();

export function createStripeMockSession(
  amount: number,
  method: "card" | "bank"
): StripeMockSession {
  const session: StripeMockSession = {
    id: `pi_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    method,
    amount,
    receiptUrl: `https://stripe.com/receipts/mock/${Date.now()}`,
  };
  stripeStore.set(session.id, session);
  return session;
}

export function confirmStripeMock(sessionId: string): { success: boolean; receiptUrl?: string } {
  const session = stripeStore.get(sessionId);
  if (!session) return { success: false };
  return { success: true, receiptUrl: session.receiptUrl };
}

export function _resetStore(): void {
  stripeStore.clear();
}
