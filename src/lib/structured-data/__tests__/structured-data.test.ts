import { describe, it, expect } from "vitest";
import { buildAssetJsonLd } from "../index";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";

describe("buildAssetJsonLd", () => {
  const item = MOCK_MARKETPLACE[0];

  it("produces valid JSON (JSON.parse succeeds)", () => {
    const ld = buildAssetJsonLd(item);
    expect(() => JSON.parse(JSON.stringify(ld))).not.toThrow();
  });

  it("has required Schema.org fields", () => {
    const ld = buildAssetJsonLd(item);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toContain("Product");
    expect(typeof ld["name"]).toBe("string");
    expect(ld["offers"]).toBeTruthy();
  });

  it("has agentEndpoint in additionalProperty", () => {
    const ld = buildAssetJsonLd(item);
    const props = ld["additionalProperty"] as Array<Record<string, unknown>>;
    const endpoint = props.find((p) => p["name"] === "agentEndpoint");
    expect(endpoint).toBeTruthy();
    expect(endpoint?.["value"]).toContain("/api/atoa/");
  });
});
