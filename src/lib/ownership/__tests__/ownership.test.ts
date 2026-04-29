// Integration tests — hit real Postgres via Drizzle.
// Skipped when DATABASE_URL is unset (fresh clone, CI without DB).
// Each test seeds listing fixtures (asset-own-01..07) for FK satisfaction and tears them down.

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { eq, inArray } from "drizzle-orm";
import {
  purchase,
  transferOwnership,
  getOwnership,
  getOwnedAssets,
  generateDeployUrl,
  _resetStore,
} from "../index";
import { db } from "@/db/client";
import { listings, ownershipRecords } from "@/db/schema";

const HAS_DB = !!process.env.DATABASE_URL;
const FIXTURE_IDS = [
  "asset-own-01",
  "asset-own-02",
  "asset-own-03",
  "asset-own-04",
  "asset-own-05",
  "asset-own-06",
  "asset-own-07",
];

describe("generateDeployUrl (pure)", () => {
  it("returns a Vercel Deploy Button URL", () => {
    const url = generateDeployUrl("asset-001");
    expect(url).toContain("https://vercel.com/new/clone");
    expect(url).toContain("asset-001");
  });
});

describe.skipIf(!HAS_DB)("ownership (DB integration)", () => {
  beforeAll(async () => {
    for (const id of FIXTURE_IDS) {
      await db
        .insert(listings)
        .values({
          id,
          ownerId: "fixture-creator",
          title: `Fixture ${id}`,
          description: "ownership test fixture",
          ccaf: {
            intentSignals: [],
            thoughtDensity: 50,
            iterations: 1,
            authorId: "fixture-creator",
            createdAt: new Date().toISOString(),
          },
          vercelUptimeDays: 0,
          basePrice: 1000,
          rank: "B",
          floorPrice: 1000,
        })
        .onConflictDoNothing();
    }
  });

  afterAll(async () => {
    await db.delete(ownershipRecords).where(inArray(ownershipRecords.assetId, FIXTURE_IDS));
    await db.delete(listings).where(inArray(listings.id, FIXTURE_IDS));
  });

  beforeEach(async () => {
    await db.delete(ownershipRecords).where(inArray(ownershipRecords.assetId, FIXTURE_IDS));
  });

  describe("purchase", () => {
    it("creates an OwnershipRecord with correct fields", async () => {
      const record = await purchase("asset-own-01", "buyer-01", "Test Asset");
      expect(record.assetId).toBe("asset-own-01");
      expect(record.ownerId).toBe("buyer-01");
      expect(record.assetTitle).toBe("Test Asset");
      expect(record.deployUrl).toContain("vercel.com");
      expect(record.acquiredAt).toBeTruthy();
    });

    it("getOwnership returns the purchased record", async () => {
      await purchase("asset-own-02", "buyer-01", "Another Asset");
      const r = await getOwnership("asset-own-02");
      expect(r?.ownerId).toBe("buyer-01");
      expect(r?.assetId).toBe("asset-own-02");
    });

    it("latest purchase wins (history-style: latest row = current owner)", async () => {
      await purchase("asset-own-03", "buyer-a", "Asset A");
      await new Promise((r) => setTimeout(r, 5)); // ensure distinct timestamps
      await purchase("asset-own-03", "buyer-b", "Asset A");
      expect((await getOwnership("asset-own-03"))?.ownerId).toBe("buyer-b");
    });
  });

  describe("transferOwnership", () => {
    it("moves the asset to a new owner", async () => {
      await purchase("asset-own-04", "buyer-01", "Transfer Asset");
      await new Promise((r) => setTimeout(r, 5));
      const r = await transferOwnership("asset-own-04", "buyer-02");
      expect(r?.ownerId).toBe("buyer-02");
      expect((await getOwnership("asset-own-04"))?.ownerId).toBe("buyer-02");
    });

    it("preserves the deployUrl after transfer", async () => {
      await purchase("asset-own-05", "buyer-01", "Preserve Asset");
      const original = (await getOwnership("asset-own-05"))!.deployUrl;
      await new Promise((r) => setTimeout(r, 5));
      const transferred = await transferOwnership("asset-own-05", "buyer-02");
      expect(transferred?.deployUrl).toBe(original);
    });

    it("returns undefined when asset has not been registered", async () => {
      const r = await transferOwnership("asset-own-01", "buyer-01");
      expect(r).toBeUndefined();
    });
  });

  describe("getOwnedAssets", () => {
    it("returns all assets currently owned by a user", async () => {
      await purchase("asset-own-06", "buyer-alpha", "Alpha Asset 1");
      await purchase("asset-own-07", "buyer-alpha", "Alpha Asset 2");
      const owned = await getOwnedAssets("buyer-alpha");
      const ids = owned.map((r) => r.assetId);
      expect(ids).toContain("asset-own-06");
      expect(ids).toContain("asset-own-07");
      expect(owned.every((r) => r.ownerId === "buyer-alpha")).toBe(true);
    });

    it("excludes assets the user no longer owns after a transfer", async () => {
      await purchase("asset-own-06", "buyer-alpha", "Alpha Asset 1");
      await new Promise((r) => setTimeout(r, 5));
      await transferOwnership("asset-own-06", "buyer-beta");
      const alphaOwned = await getOwnedAssets("buyer-alpha");
      expect(alphaOwned.find((r) => r.assetId === "asset-own-06")).toBeUndefined();
      const betaOwned = await getOwnedAssets("buyer-beta");
      expect(betaOwned.find((r) => r.assetId === "asset-own-06")).toBeDefined();
    });

    it("returns empty array for a user with no assets", async () => {
      const owned = await getOwnedAssets("user-with-nothing");
      expect(Array.isArray(owned)).toBe(true);
      expect(owned).toHaveLength(0);
    });
  });
});
