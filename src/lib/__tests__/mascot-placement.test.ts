import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "../../..");

describe("AssetSpirit placement — product cards", () => {
  it("AssetSpirit does NOT appear in marketplace page", () => {
    const src = readFileSync(resolve(root, "src/app/marketplace/page.tsx"), "utf8");
    expect(src).not.toContain("AssetSpirit");
  });

  it("AssetSpirit does NOT appear in showcase page", () => {
    const src = readFileSync(resolve(root, "src/app/showcase/page.tsx"), "utf8");
    expect(src).not.toContain("AssetSpirit");
  });

  it("AssetSpirit does NOT appear in asset detail page", () => {
    const src = readFileSync(resolve(root, "src/app/asset/[id]/page.tsx"), "utf8");
    expect(src).not.toContain("AssetSpirit");
  });
});

describe("Shimaenaga placement — product cards", () => {
  it("Shimaenaga does NOT appear in marketplace page", () => {
    const src = readFileSync(resolve(root, "src/app/marketplace/page.tsx"), "utf8");
    expect(src).not.toContain("<Shimaenaga");
  });

  it("Shimaenaga does NOT appear in showcase page", () => {
    const src = readFileSync(resolve(root, "src/app/showcase/page.tsx"), "utf8");
    expect(src).not.toContain("<Shimaenaga");
  });
});
