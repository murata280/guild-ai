import { describe, it, expect } from "vitest";
import {
  purchase,
  transferOwnership,
  getOwnership,
  getOwnedAssets,
  generateDeployUrl,
} from "../index";

describe("generateDeployUrl", () => {
  it("returns a Vercel Deploy Button URL", () => {
    const url = generateDeployUrl("asset-001");
    expect(url).toContain("https://vercel.com/new/clone");
    expect(url).toContain("asset-001");
  });
});

describe("purchase", () => {
  it("creates an OwnershipRecord with correct fields", () => {
    const record = purchase("asset-own-01", "buyer-01", "Test Asset");
    expect(record.assetId).toBe("asset-own-01");
    expect(record.ownerId).toBe("buyer-01");
    expect(record.assetTitle).toBe("Test Asset");
    expect(record.deployUrl).toContain("vercel.com");
    expect(record.acquiredAt).toBeTruthy();
  });

  it("getOwnership returns the purchased record", () => {
    purchase("asset-own-02", "buyer-01", "Another Asset");
    const r = getOwnership("asset-own-02");
    expect(r?.ownerId).toBe("buyer-01");
    expect(r?.assetId).toBe("asset-own-02");
  });

  it("overrides the previous owner when purchased again", () => {
    purchase("asset-own-03", "buyer-a", "Asset A");
    purchase("asset-own-03", "buyer-b", "Asset A");
    expect(getOwnership("asset-own-03")?.ownerId).toBe("buyer-b");
  });
});

describe("transferOwnership", () => {
  it("moves the asset to a new owner", () => {
    purchase("asset-own-04", "buyer-01", "Transfer Asset");
    const r = transferOwnership("asset-own-04", "buyer-02");
    expect(r?.ownerId).toBe("buyer-02");
    expect(getOwnership("asset-own-04")?.ownerId).toBe("buyer-02");
  });

  it("preserves the deployUrl after transfer", () => {
    purchase("asset-own-05", "buyer-01", "Preserve Asset");
    const original = getOwnership("asset-own-05")!.deployUrl;
    const transferred = transferOwnership("asset-own-05", "buyer-02");
    expect(transferred?.deployUrl).toBe(original);
  });

  it("returns undefined when asset has not been registered", () => {
    const r = transferOwnership("nonexistent-xyz", "buyer-01");
    expect(r).toBeUndefined();
  });
});

describe("getOwnedAssets", () => {
  it("returns all assets owned by a specific user", () => {
    purchase("asset-own-06", "buyer-alpha", "Alpha Asset 1");
    purchase("asset-own-07", "buyer-alpha", "Alpha Asset 2");
    const owned = getOwnedAssets("buyer-alpha");
    const ids = owned.map((r) => r.assetId);
    expect(ids).toContain("asset-own-06");
    expect(ids).toContain("asset-own-07");
    expect(owned.every((r) => r.ownerId === "buyer-alpha")).toBe(true);
  });

  it("returns empty array for a user with no assets", () => {
    const owned = getOwnedAssets("user-with-nothing");
    expect(Array.isArray(owned)).toBe(true);
  });
});
