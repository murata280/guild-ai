"use client";

import { useCallback } from "react";
import { playStampChime, playPoyon, playPassbookChime, isMuted } from "@/lib/sound";

export type TactileContext = "stamp" | "poyon" | "coin" | "quest";

const VIBRATION_MS: Record<TactileContext, number[]> = {
  stamp: [15],
  poyon: [8],
  coin:  [10, 5, 10],
  quest: [12],
};

function vibrate(pattern: number[]) {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  try {
    navigator.vibrate?.(pattern);
  } catch { /* unsupported */ }
}

export function useTactile(context: TactileContext = "poyon") {
  const trigger = useCallback(() => {
    if (!isMuted()) {
      switch (context) {
        case "stamp": playStampChime(); break;
        case "poyon": playPoyon(); break;
        case "coin":
        case "quest": playPassbookChime(); break;
      }
    }
    vibrate(VIBRATION_MS[context]);
  }, [context]);

  return trigger;
}
