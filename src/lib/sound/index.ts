"use client";

// GUILD AI — Water-Koto Chime (水琴窟 風)
// Synthesized bell/koto tone using Web Audio API only — no external assets.
// Two partials: 700Hz (bright bell) + 350Hz (warm undertone), 0.6s decay.
// Volume ~= -18 dBFS. Silent fail on iOS/Safari AudioContext restrictions.

let ctx: AudioContext | null = null;
let muted = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx || ctx.state === "closed") {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctx;
  } catch {
    return null;
  }
}

function playPartial(ac: AudioContext, freq: number, gain: number, delay: number, duration: number) {
  const osc = ac.createOscillator();
  const gainNode = ac.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay);

  gainNode.gain.setValueAtTime(0, ac.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + delay + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

  osc.connect(gainNode);
  gainNode.connect(ac.destination);

  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.01);
}

/**
 * playSuccessChime — 水琴窟 / bell tone.
 * Must be called in a user-gesture handler to satisfy autoplay policy.
 * Silent fail if AudioContext is unavailable or muted.
 */
export function playSuccessChime(): void {
  if (muted) return;
  const ac = getContext();
  if (!ac) return;

  try {
    if (ac.state === "suspended") {
      ac.resume().catch(() => undefined);
    }
    // Primary bell: 700Hz, 0.6s
    playPartial(ac, 700, 0.12, 0, 0.6);
    // Undertone: 350Hz, delayed 60ms, 0.5s
    playPartial(ac, 350, 0.07, 0.06, 0.5);
    // Shimmer: 1400Hz, delayed 120ms, 0.3s (quiet)
    playPartial(ac, 1400, 0.03, 0.12, 0.3);
  } catch {
    // Silent fail — Safari strict mode, etc.
  }
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

/**
 * playPassbookChime — gentle bank-passbook entry sound.
 * Lower, mellower than the success chime: A4 main tone + A3 bass.
 * Must be called from a user-gesture handler.
 */
export function playPassbookChime(): void {
  if (muted) return;
  const ac = getContext();
  if (!ac) return;
  try {
    if (ac.state === "suspended") ac.resume().catch(() => undefined);
    playPartial(ac, 440, 0.10, 0, 0.8);     // A4 — main note
    playPartial(ac, 220, 0.06, 0.02, 0.6);  // A3 — warm bass
    playPartial(ac, 880, 0.04, 0.05, 0.4);  // A5 — soft shimmer
  } catch {
    // Silent fail
  }
}

/** Deterministic helper: returns the note frequencies used (for tests) */
export const CHIME_FREQUENCIES = [700, 350, 1400] as const;
export const PASSBOOK_CHIME_FREQUENCIES = [440, 220, 880] as const;
