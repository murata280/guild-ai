import { describe, it, expect, beforeEach } from "vitest";
import { isMuted, setMuted, toggleMute, CHIME_FREQUENCIES } from "../index";

beforeEach(() => setMuted(false));

describe("sound mute control", () => {
  it("starts unmuted", () => {
    expect(isMuted()).toBe(false);
  });

  it("setMuted(true) mutes the chime", () => {
    setMuted(true);
    expect(isMuted()).toBe(true);
  });

  it("toggleMute flips state and returns new value", () => {
    const first = toggleMute();
    expect(first).toBe(true);
    const second = toggleMute();
    expect(second).toBe(false);
  });

  it("toggleMute is idempotent — double toggle returns to original", () => {
    const before = isMuted();
    toggleMute();
    toggleMute();
    expect(isMuted()).toBe(before);
  });
});

describe("chime frequencies", () => {
  it("has exactly 3 frequencies", () => {
    expect(CHIME_FREQUENCIES).toHaveLength(3);
  });

  it("primary frequency is 700Hz (bell)", () => {
    expect(CHIME_FREQUENCIES[0]).toBe(700);
  });

  it("undertone is half the primary (350Hz)", () => {
    expect(CHIME_FREQUENCIES[1]).toBe(CHIME_FREQUENCIES[0] / 2);
  });

  it("all frequencies are positive numbers above 100Hz", () => {
    for (const f of CHIME_FREQUENCIES) {
      expect(f).toBeGreaterThan(100);
    }
  });
});
