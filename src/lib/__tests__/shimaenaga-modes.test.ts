import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "../../..");
const src = readFileSync(resolve(root, "src/components/Shimaenaga.tsx"), "utf8");

describe("Shimaenaga contextual modes", () => {
  it("mode prop appears in file", () => {
    expect(src).toContain("mode");
  });

  it("avatar mode is mentioned", () => {
    expect(src).toContain('"avatar"');
  });

  it("seal mode is mentioned", () => {
    expect(src).toContain('"seal"');
  });

  it("guardian mode is mentioned", () => {
    expect(src).toContain('"guardian"');
  });

  it("prefers-reduced-motion handling exists", () => {
    expect(src).toContain("prefers-reduced-motion");
  });

  it("Mode type is defined with all three values", () => {
    expect(src).toContain('type Mode = "avatar" | "seal" | "guardian"');
  });

  it("GUILD CERTIFIED text present for seal mode", () => {
    expect(src).toContain("GUILD CERTIFIED");
  });

  it("guardian has aria label suffix referencing ガーディアン or 守り神", () => {
    expect(src).toMatch(/ガーディアン|守り神/);
  });

  it("seal has aria label suffix referencing 認証 or stamp", () => {
    expect(src).toMatch(/認証スタンプ|stamp/i);
  });
});
