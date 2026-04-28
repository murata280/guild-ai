// GUILD AI — JPYC Stablecoin Payments (mock)
// JPYC is a JPY-pegged stablecoin (1 JPYC = 1 JPY).
// No on-chain calls — deterministic mock for demo.

export interface JpycTx {
  txHash: string;
  amount: number;
  from: string;
  status: "pending" | "confirmed";
}

export interface OnrampResult {
  txHash: string;
  jpycAmount: number;
  receiptUrl: string;
}

const txStore = new Map<string, JpycTx>();
const balanceStore = new Map<string, number>();

function mockHash(): string {
  return "0x" + Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0")
  ).join("");
}

export function createJpycMockTx(amount: number): JpycTx {
  const tx: JpycTx = {
    txHash: mockHash(),
    amount,
    from: "wallet_demo",
    status: "pending",
  };
  txStore.set(tx.txHash, tx);
  return tx;
}

export function confirmJpycMock(txHash: string): { confirmed: boolean } {
  const tx = txStore.get(txHash);
  if (!tx) return { confirmed: false };
  tx.status = "confirmed";
  return { confirmed: true };
}

export function getJpycBalance(walletId: string): number {
  return balanceStore.get(walletId) ?? 10000; // default mock: 10,000 JPYC
}

export function onrampJpyc(amountJpy: number, _cardToken: string): OnrampResult {
  const txHash = mockHash();
  txStore.set(txHash, {
    txHash,
    amount: amountJpy,
    from: "onramp_mock",
    status: "confirmed",
  });
  return {
    txHash,
    jpycAmount: amountJpy, // 1:1
    receiptUrl: `https://mock-onramp.example.com/receipt/${txHash}`,
  };
}

export function _resetStore(): void {
  txStore.clear();
  balanceStore.clear();
}
