import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "../../..");

describe("showcase page structure", () => {
  const src = readFileSync(resolve(root, "src/app/showcase/page.tsx"), "utf8");

  it("exports a default page component", () => {
    expect(src).toMatch(/export default function ShowcasePage/);
  });

  it("includes StarRating import", () => {
    expect(src).toMatch(/import.*StarRating.*from/);
  });

  it("uses 'この分身に投資する' CTA text", () => {
    expect(src).toContain("この分身に投資する");
  });

  it("has like button with aria-label", () => {
    expect(src).toMatch(/aria-label.*いいね/);
  });

  it("links to /asset/[id] for each card", () => {
    expect(src).toMatch(/href=.*asset.*item\.listing\.id/);
  });
});

describe("wallet redirect", () => {
  const src = readFileSync(resolve(root, "src/app/dashboard/page.tsx"), "utf8");

  it("imports redirect from next/navigation", () => {
    expect(src).toContain('from "next/navigation"');
  });

  it("redirects to /wallet", () => {
    expect(src).toContain('redirect("/wallet")');
  });

  it("does not render any UI (pure redirect)", () => {
    expect(src).not.toMatch(/<div|<main|<section/);
  });
});

describe("wallet page", () => {
  const src = readFileSync(resolve(root, "src/app/wallet/page.tsx"), "utf8");

  it("exports a default WalletPage component", () => {
    expect(src).toMatch(/export default function WalletPage/);
  });

  it("contains お財布 in the heading", () => {
    expect(src).toContain("お財布");
  });

  it("includes SkillGrowthCard component", () => {
    expect(src).toContain("SkillGrowthCard");
  });
});

describe("AssetReview component", () => {
  const src = readFileSync(resolve(root, "src/components/AssetReview.tsx"), "utf8");

  it("is a use client component", () => {
    expect(src).toMatch(/^"use client"/);
  });

  it("exports AssetReview function", () => {
    expect(src).toMatch(/export function AssetReview/);
  });

  it("has star picker with 5-star range", () => {
    expect(src).toContain("StarPicker");
    expect(src).toContain("1, 2, 3, 4, 5");
  });

  it("persists to localStorage with guild_review_ key", () => {
    expect(src).toContain("guild_review_");
  });
});
