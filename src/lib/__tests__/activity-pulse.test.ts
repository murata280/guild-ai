import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("ActivityPulse component", () => {
  it("has aria-live and pulse animation in source", () => {
    const filePath = path.resolve(__dirname, "../../components/ActivityPulse.tsx");
    const source = fs.readFileSync(filePath, "utf-8");
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("pulse-line");
  });
});
