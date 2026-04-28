// GUILD AI — Shared types
// Cross-referenced from docs/マスター設計図.md (Single Source of Truth).

export type Rank = "S" | "A" | "B";

/**
 * CCAF = Cognitive Context Audit File.
 * Structured proof-of-thought document used by ai-auditor.
 */
export interface CCAF {
  intentSignals: string[]; // Human-intent signals (required for S rank — 魂の登記)
  thoughtDensity: number; // 0-100
  iterations: number; // attempt count
  authorId: string;
  createdAt: string; // ISO8601
}

/**
 * Listing = a registered piece of intelligence (知能資産).
 * Inherits the listing_008 structure referenced in the spec.
 */
export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  ccaf: CCAF;
  vercelUptimeDays: number;
  rank: Rank;
  basePrice: number;
  floorPrice: number;
  githubUrl?: string;
}

/**
 * TrustScoreInput — inputs for Trust Score calculation.
 * Weighted: 0.5 * qualityHistory + 0.3 * discordContribution + 0.2 * xAmplification
 */
export interface TrustScoreInput {
  qualityHistory: number; // 0-100
  discordContribution: number; // 0-100
  xAmplification: number; // 0-100
}

export interface TrustScoreResult {
  raw: number; // 0-100
  score: number; // 0-1000 (raw * 10)
  rank: Rank;
  updatedAt: string;
}

export type DiscordActionKind = "share" | "endorse" | "react" | "bug-report";

export interface DiscordEvent {
  userId: string;
  kind: DiscordActionKind;
  listingId: string;
  occurredAt: string; // ISO8601
}

export interface AuditResult {
  rank: Rank;
  score: number; // composite score (0-100)
  reasons: string[];
}

// ─── Marketplace ───────────────────────────────────────────────────────────

export interface MarketplaceListing {
  listing: Listing;
  auditResult: AuditResult;
  trustScore: TrustScoreResult;
  listedAt: string; // ISO8601
}

// ─── Ownership / Transfer ──────────────────────────────────────────────────

export interface OwnershipRecord {
  assetId: string;
  ownerId: string;
  acquiredAt: string; // ISO8601
  deployUrl: string; // Vercel Deploy Button URL
  assetTitle: string;
}

// ─── Royalty ───────────────────────────────────────────────────────────────

/** Ancestor chain, oldest creator first, newest (direct parent) last. */
export interface Creator {
  creatorId: string;
  name: string;
}

export interface RoyaltyDistribution {
  creatorId: string;
  name: string;
  amount: number; // JPY
  trustScoreBonus: number; // Trust Score points added
  generation: number; // 1 = direct parent, 2 = grandparent, …
}

export interface RoyaltyResult {
  distributions: RoyaltyDistribution[];
  totalRoyaltyPaid: number;
  sellerNet: number;
}
