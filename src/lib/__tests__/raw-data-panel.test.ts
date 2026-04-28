import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const panelSource = readFileSync(
  resolve(__dirname, "../../components/RawDataPanel.tsx"),
  "utf-8"
);

describe("RawDataPanel component", () => {
  it("is a client component with use client directive", () => {
    expect(panelSource.startsWith('"use client"')).toBe(true);
  });

  it("uses <details> and <summary> for native accessible accordion", () => {
    expect(panelSource).toContain("<details");
    expect(panelSource).toContain("<summary");
  });

  it("persists open state to localStorage with guild_raw_data_open key", () => {
    expect(panelSource).toContain("guild_raw_data_open");
    expect(panelSource).toContain("localStorage.setItem");
  });

  it("exports RawDataPanel as a named export", () => {
    expect(panelSource).toContain("export function RawDataPanel");
  });
});
