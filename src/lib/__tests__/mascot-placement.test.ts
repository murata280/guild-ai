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

describe("ProToggle — no mascot", () => {
  it("ProToggle does NOT contain Shimaenaga", () => {
    const src = readFileSync(resolve(root, "src/components/ProToggle.tsx"), "utf8");
    expect(src).not.toContain("<Shimaenaga");
  });
});

describe("Shimaenaga mode ARIA labels", () => {
  const shimSrc = readFileSync(resolve(root, "src/components/Shimaenaga.tsx"), "utf8");

  it("guardian mode aria-label contains ガーディアン or 守り神 or guard", () => {
    expect(shimSrc).toMatch(/ガーディアン|守り神|guard/i);
  });

  it("seal mode aria-label contains 認証 or stamp or seal", () => {
    expect(shimSrc).toMatch(/認証スタンプ|stamp|seal/i);
  });

  it("guardian mode has shield rendering", () => {
    expect(shimSrc).toContain("GuardianShield");
  });

  it("seal mode has GUILD CERTIFIED text", () => {
    expect(shimSrc).toContain("GUILD CERTIFIED");
  });

  it("avatar mode has blink animation", () => {
    expect(shimSrc).toContain("shima-eye-blink");
  });

  it("prefers-reduced-motion is respected in avatar blink", () => {
    expect(shimSrc).toContain("prefers-reduced-motion");
  });
});
