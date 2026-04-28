// GUILD AI — Ownership / Instant Transfer
// purchase() moves an asset's ownership to the buyer and generates a Vercel deploy URL.
// Spec: docs/マスター設計図.md §6 (即時決済・移転).

import type { OwnershipRecord } from "@/types";

// Module-level in-memory store (sufficient for demo; replace with DB in production).
const ownershipStore = new Map<string, OwnershipRecord>();

/**
 * generateDeployUrl — returns a Vercel Deploy Button URL for the given asset.
 * The buyer can click this to clone and deploy the asset on their own Vercel account.
 */
export function generateDeployUrl(assetId: string): string {
  const repoUrl = `https://github.com/guild-ai/asset-${assetId}`;
  return (
    `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}` +
    `&project-name=guild-asset-${assetId}`
  );
}

/** purchase — registers a new OwnershipRecord for the buyer. */
export function purchase(assetId: string, buyerId: string, assetTitle: string): OwnershipRecord {
  const record: OwnershipRecord = {
    assetId,
    ownerId: buyerId,
    acquiredAt: new Date().toISOString(),
    deployUrl: generateDeployUrl(assetId),
    assetTitle,
  };
  ownershipStore.set(assetId, record);
  return record;
}

/** transferOwnership — moves an already-registered asset to a new owner. */
export function transferOwnership(assetId: string, newOwnerId: string): OwnershipRecord | undefined {
  const existing = ownershipStore.get(assetId);
  if (!existing) return undefined;
  const record: OwnershipRecord = {
    ...existing,
    ownerId: newOwnerId,
    acquiredAt: new Date().toISOString(),
  };
  ownershipStore.set(assetId, record);
  return record;
}

export function getOwnership(assetId: string): OwnershipRecord | undefined {
  return ownershipStore.get(assetId);
}

export function getOwnedAssets(ownerId: string): OwnershipRecord[] {
  return Array.from(ownershipStore.values()).filter((r) => r.ownerId === ownerId);
}
