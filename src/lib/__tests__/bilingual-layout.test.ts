import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "../../..");
const src = readFileSync(resolve(root, "src/components/BilingualLayout.tsx"), "utf8");

describe("BilingualLayout component", () => {
  it("is a use client component", () => {
    expect(src).toMatch(/^"use client"/);
  });

  it("exports BilingualLayout", () => {
    expect(src).toContain("export function BilingualLayout");
  });

  it("yasashii tab exists", () => {
    expect(src).toContain("yasashii");
    expect(src).toContain("やさしい説明");
  });

  it("kuwashii tab exists", () => {
    expect(src).toContain("kuwashii");
    expect(src).toContain("くわしい仕様");
  });

  it("role=tablist is present", () => {
    expect(src).toContain('role="tablist"');
  });

  it("role=tab is present", () => {
    expect(src).toContain('role="tab"');
  });

  it("role=tabpanel is present", () => {
    expect(src).toContain('role="tabpanel"');
  });

  it("aria-selected is present", () => {
    expect(src).toContain("aria-selected");
  });

  it("aria-labelledby links tabpanel to tab", () => {
    expect(src).toContain("aria-labelledby");
  });

  it("desktop two-column layout with md:grid-cols", () => {
    expect(src).toContain("md:grid-cols");
  });

  it("has aria-controls connecting tab to panel", () => {
    expect(src).toContain("aria-controls");
  });
});
