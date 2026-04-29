// GUILD AI — Ownership / Instant Transfer
// Postgres-backed ownership history. Each purchase/transfer appends a row.
// Current owner of an asset = the row with the latest acquired_at for that asset.

import { and, desc, eq, sql } from "drizzle-orm";
import type { OwnershipRecord } from "@/types";
import { db } from "@/db/client";
import { ownershipRecords } from "@/db/schema";

type OwnershipRow = typeof ownershipRecords.$inferSelect;

function rowToRecord(row: OwnershipRow): OwnershipRecord {
  return {
    assetId: row.assetId,
    ownerId: row.ownerId,
    acquiredAt: row.acquiredAt.toISOString(),
    deployUrl: row.deployUrl,
    assetTitle: row.assetTitle,
  };
}

/**
 * generateDeployUrl — Vercel Deploy Button URL for cloning the asset's repo.
 * Pure function, no DB access.
 */
export function generateDeployUrl(assetId: string): string {
  const repoUrl = `https://github.com/guild-ai/asset-${assetId}`;
  return (
    `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}` +
    `&project-name=guild-asset-${assetId}`
  );
}

/** purchase — appends a new ownership row. The latest row is the current owner. */
export async function purchase(
  assetId: string,
  buyerId: string,
  assetTitle: string
): Promise<OwnershipRecord> {
  const id = `own-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [row] = await db
    .insert(ownershipRecords)
    .values({
      id,
      assetId,
      ownerId: buyerId,
      deployUrl: generateDeployUrl(assetId),
      assetTitle,
    })
    .returning();
  return rowToRecord(row);
}

/**
 * transferOwnership — appends a new row carrying forward the current deploy URL
 * and asset title. Returns undefined if the asset has never been registered.
 */
export async function transferOwnership(
  assetId: string,
  newOwnerId: string
): Promise<OwnershipRecord | undefined> {
  const current = await getOwnership(assetId);
  if (!current) return undefined;

  const id = `own-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [row] = await db
    .insert(ownershipRecords)
    .values({
      id,
      assetId,
      ownerId: newOwnerId,
      deployUrl: current.deployUrl,
      assetTitle: current.assetTitle,
    })
    .returning();
  return rowToRecord(row);
}

/** getOwnership — current owner = the latest row for this asset. */
export async function getOwnership(assetId: string): Promise<OwnershipRecord | undefined> {
  const [row] = await db
    .select()
    .from(ownershipRecords)
    .where(eq(ownershipRecords.assetId, assetId))
    .orderBy(desc(ownershipRecords.acquiredAt))
    .limit(1);
  return row ? rowToRecord(row) : undefined;
}

/**
 * getOwnedAssets — assets currently owned by ownerId.
 * Tuple IN subquery picks the latest (asset_id, acquired_at) per asset, then
 * filters by owner. Avoids returning historical assets the user no longer holds.
 */
export async function getOwnedAssets(ownerId: string): Promise<OwnershipRecord[]> {
  const rows = await db
    .select()
    .from(ownershipRecords)
    .where(
      and(
        eq(ownershipRecords.ownerId, ownerId),
        sql`(${ownershipRecords.assetId}, ${ownershipRecords.acquiredAt}) IN (
          SELECT asset_id, MAX(acquired_at) FROM ownership_records GROUP BY asset_id
        )`
      )
    );
  return rows.map(rowToRecord);
}

// Test-only. Wipes ALL ownership rows — do not call in production.
export async function _resetStore(): Promise<void> {
  await db.delete(ownershipRecords);
}
