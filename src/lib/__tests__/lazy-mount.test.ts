import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "../../..");

describe("useLazyMount hook", () => {
  const src = readFileSync(resolve(root, "src/hooks/useLazyMount.ts"), "utf8");

  it("contains IntersectionObserver", () => {
    expect(src).toContain("IntersectionObserver");
  });

  it("contains rootMargin", () => {
    expect(src).toContain("rootMargin");
  });

  it("exports useLazyMount", () => {
    expect(src).toContain("export function useLazyMount");
  });
});
