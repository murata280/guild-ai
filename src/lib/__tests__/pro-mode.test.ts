import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const TOGGLE_PATH = path.resolve("src/components/ProToggle.tsx");
const SUMMARY_PATH = path.resolve("src/components/ProSummaryRow.tsx");
const WALLET_PATH = path.resolve("src/app/wallet/page.tsx");

const toggleSrc = readFileSync(TOGGLE_PATH, "utf8");
const summarySrc = readFileSync(SUMMARY_PATH, "utf8");
const walletSrc = readFileSync(WALLET_PATH, "utf8");

describe("ProToggle", () => {
  it('has role="switch"', () => {
    expect(toggleSrc).toContain('role="switch"');
  });

  it("has aria-checked binding", () => {
    expect(toggleSrc).toContain("aria-checked");
  });

  it("has aria-label for accessibility", () => {
    expect(toggleSrc).toContain("aria-label");
  });
});

describe("ProSummaryRow", () => {
  it("displays rps metric", () => {
    expect(summarySrc).toContain("rps");
  });

  it("displays 信用 (trust score) metric", () => {
    expect(summarySrc).toContain("信用");
  });

  it("displays 資産 (total value) metric", () => {
    expect(summarySrc).toContain("資産");
  });

  it("displays 24h metric", () => {
    expect(summarySrc).toContain("24h");
  });

  it("displays 30d P&L metric", () => {
    expect(summarySrc).toMatch(/30d\s+P/);
  });

  it("has 5 metric items in a grid", () => {
    expect(summarySrc).toContain("sm:grid-cols-5");
  });

  it("uses tabular-nums for numeric display", () => {
    expect(summarySrc).toContain("tabular-nums");
  });
});

describe("Wallet page pro mode integration", () => {
  it("imports ProToggle", () => {
    expect(walletSrc).toContain("ProToggle");
  });

  it("imports ProSummaryRow", () => {
    expect(walletSrc).toContain("ProSummaryRow");
  });

  it("persists pro mode to localStorage with key guild_pro_mode", () => {
    expect(walletSrc).toContain("guild_pro_mode");
  });

  it("reads pro mode from localStorage on mount", () => {
    expect(walletSrc).toContain('getItem("guild_pro_mode")');
  });

  it("renders ProSummaryRow conditionally when proMode is true", () => {
    expect(walletSrc).toContain("{proMode && (");
    expect(walletSrc).toContain("<ProSummaryRow");
  });

  it("renders ProToggle in the header area alongside sound controls", () => {
    // Both the sound mute button and ProToggle must appear in the same header block
    const headerStart = walletSrc.indexOf("Sound mute toggle");
    const headerEnd = walletSrc.indexOf("</div>\n\n      {!mounted", headerStart);
    const headerSection = walletSrc.slice(headerStart, headerEnd);
    expect(headerSection).toContain("ProToggle");
  });
});
