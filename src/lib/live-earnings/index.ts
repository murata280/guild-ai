"use client";

import { useState, useEffect, useRef } from "react";
import { getMonthlyEarnings } from "@/lib/passbook";

export interface LiveEarningsState {
  jpy: number;
  lastDelta: number;   // most recent pseudo-AtoA bump amount
  bumpCount: number;
}

export const PSEUDO_DELTAS = [75, 120, 200, 85, 150, 300, 60, 180];

/**
 * useLiveEarnings — returns a live-updating earnings value.
 * After initial load, adds a small deterministic bump every 5–8 seconds
 * to simulate AtoA job income arriving in real time.
 */
export function useLiveEarnings(userId: string): LiveEarningsState {
  const base = getMonthlyEarnings(userId).jpy;
  const [state, setState] = useState<LiveEarningsState>({
    jpy: base,
    lastDelta: 0,
    bumpCount: 0,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);

  useEffect(() => {
    function scheduleNext() {
      const delay = 5000 + Math.floor(Math.random() * 3000); // 5–8s
      timerRef.current = setTimeout(() => {
        const delta = PSEUDO_DELTAS[countRef.current % PSEUDO_DELTAS.length];
        countRef.current += 1;
        setState((prev) => ({
          jpy: prev.jpy + delta,
          lastDelta: delta,
          bumpCount: prev.bumpCount + 1,
        }));
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId]);

  return state;
}

/** Deterministic helper used in tests (no side effects) */
export function getNextDelta(bumpCount: number): number {
  return PSEUDO_DELTAS[bumpCount % PSEUDO_DELTAS.length];
}
