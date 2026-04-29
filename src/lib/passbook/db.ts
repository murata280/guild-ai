// GUILD AI — Passbook (DB-enriched)
// Returns a PassbookSnapshot built from real ownership_records + checkout_sessions.
// Falls back to the deterministic mock when the user has no real activity yet —
// preserves the demo experience for fresh visitors while showing real data after
// the first purchase.

import { and, desc, eq, inArray } from "drizzle-orm";
import type { PassbookSnapshot, PassbookTransaction } from "@/types";
import { db } from "@/db/client";
import { listings, checkoutSessions } from "@/db/schema";
import { getOwnedAssets } from "@/lib/ownership";
import { getPassbookSnapshot as getMockSnapshot } from "./index";

export async function getPassbookSnapshotFromDb(userId: string): Promise<PassbookSnapshot> {
  const owned = await getOwnedAssets(userId);

  // No real activity → deterministic mock keeps the demo lively.
  if (owned.length === 0) {
    return getMockSnapshot(userId);
  }

  // For fields with no real data source yet (balance, trust score / history),
  // borrow from the mock to keep the UI populated.
  const mock = getMockSnapshot(userId);

  const assetIds = owned.map((o) => o.assetId);
  const rankRows = await db
    .select({ rank: listings.rank })
    .from(listings)
    .where(inArray(listings.id, assetIds));

  const rankBreakdown = { S: 0, A: 0, B: 0 };
  for (const r of rankRows) rankBreakdown[r.rank]++;

  const txRows = await db
    .select({
      id: checkoutSessions.id,
      method: checkoutSessions.method,
      amountJpy: checkoutSessions.amountJpy,
      createdAt: checkoutSessions.createdAt,
      assetTitle: listings.title,
    })
    .from(checkoutSessions)
    .innerJoin(listings, eq(checkoutSessions.assetId, listings.id))
    .where(
      and(eq(checkoutSessions.buyerId, userId), eq(checkoutSessions.status, "settled"))
    )
    .orderBy(desc(checkoutSessions.createdAt))
    .limit(3);

  const recentTransactions: PassbookTransaction[] = txRows.map((r) => ({
    id: r.id,
    type: r.method === "card" || r.method === "bank" ? "card" : "jpyc",
    amount: r.amountJpy,
    assetTitle: r.assetTitle,
    at: r.createdAt.toISOString(),
  }));

  return {
    userId,
    jpycBalance: mock.jpycBalance,        // mock (no balance ledger yet)
    trustScore: mock.trustScore,          // mock (trust_score_inputs has no data yet)
    trustHistory: mock.trustHistory,      // mock (same)
    assetCount: owned.length,             // real
    rankBreakdown,                        // real
    recentTransactions,                   // real
  };
}
