export interface PoolEntry {
  timestamp: number;
  amountJpy: number;
}

export interface ValuePool {
  assetId: string;
  totalPooledJpy: number;
  sinceDate: string;
  perUseHistory: PoolEntry[];
  distributedYet: boolean;
  creditedAt?: number;
  claimerId?: string;
}

const pools = new Map<string, ValuePool>();

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function recordUnclaimedUsage(assetId: string, amountJpy: number): void {
  const existing = pools.get(assetId);
  const entry: PoolEntry = { timestamp: Date.now(), amountJpy };
  if (existing) {
    existing.totalPooledJpy += amountJpy;
    existing.perUseHistory.push(entry);
  } else {
    pools.set(assetId, {
      assetId,
      totalPooledJpy: amountJpy,
      sinceDate: todayISO(),
      perUseHistory: [entry],
      distributedYet: false,
    });
  }
}

export function getValuePool(assetId: string): ValuePool | null {
  return pools.get(assetId) ?? null;
}

export function releaseRetroactive(
  assetId: string,
  claimerId: string
): { releasedJpy: number } | { error: string } {
  const pool = pools.get(assetId);
  if (!pool) return { error: "no_pool" };
  if (pool.distributedYet) return { error: "already_distributed" };
  pool.distributedYet = true;
  pool.creditedAt = Date.now();
  pool.claimerId = claimerId;
  return { releasedJpy: pool.totalPooledJpy };
}
