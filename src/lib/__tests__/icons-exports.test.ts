import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const iconsSource = readFileSync(
  resolve(__dirname, "../../components/icons/index.tsx"),
  "utf-8"
);

describe("icons module exports", () => {
  it("exports rank badge icons (CrownIcon, StarIcon, LeafIcon)", () => {
    expect(iconsSource).toContain("export function CrownIcon");
    expect(iconsSource).toContain("export function StarIcon");
    expect(iconsSource).toContain("export function LeafIcon");
  });

  it("exports section header icons (SearchIcon, LinkIcon, ShoppingBagIcon, UserIcon, BanknoteIcon, CodeIcon)", () => {
    expect(iconsSource).toContain("export function SearchIcon");
    expect(iconsSource).toContain("export function LinkIcon");
    expect(iconsSource).toContain("export function ShoppingBagIcon");
    expect(iconsSource).toContain("export function UserIcon");
    expect(iconsSource).toContain("export function BanknoteIcon");
    expect(iconsSource).toContain("export function CodeIcon");
  });
});
