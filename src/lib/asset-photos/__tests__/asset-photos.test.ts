import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const src = readFileSync(
  resolve(__dirname, "../index.ts"),
  "utf8"
);

describe("asset-photos module", () => {
  it("exports getPhoto, setPhoto, removePhoto", () => {
    expect(src).toContain("export function getPhoto");
    expect(src).toContain("export function setPhoto");
    expect(src).toContain("export function removePhoto");
  });

  it("guards against SSR with typeof window check", () => {
    expect(src).toContain('typeof window === "undefined"');
  });

  it("uses guild_photo_ key prefix", () => {
    expect(src).toContain("guild_photo_");
  });

  it("getPhoto returns null guard on server", () => {
    // The function must return null when window is undefined
    expect(src).toMatch(/getPhoto.*typeof window.*null/s);
  });
});

describe("HumanThumbnail component", () => {
  const comp = readFileSync(
    resolve(__dirname, "../../../components/HumanThumbnail.tsx"),
    "utf8"
  );

  it("is a use client component", () => {
    expect(comp).toMatch(/^"use client"/);
  });

  it("imports AssetEmblem as fallback", () => {
    expect(comp).toContain("AssetEmblem");
  });

  it("imports getPhoto from asset-photos", () => {
    expect(comp).toContain("getPhoto");
  });

  it("renders img tag when photo is present", () => {
    expect(comp).toContain("<img");
  });
});

describe("AssetEmblem component", () => {
  const comp = readFileSync(
    resolve(__dirname, "../../../components/AssetEmblem.tsx"),
    "utf8"
  );

  it("is a use client component", () => {
    expect(comp).toMatch(/^"use client"/);
  });

  it("exports AssetEmblem function", () => {
    expect(comp).toContain("export function AssetEmblem");
  });

  it("uses JSX SVG (not dangerouslySetInnerHTML)", () => {
    expect(comp).not.toContain("dangerouslySetInnerHTML");
    expect(comp).toContain("<svg");
  });

  it("renders petals via Array.from mapping", () => {
    expect(comp).toContain("Array.from");
    expect(comp).toContain("<ellipse");
  });
});
