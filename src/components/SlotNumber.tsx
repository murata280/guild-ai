"use client";

import { useEffect, useRef, useState } from "react";

interface SlotNumberProps {
  value: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animates a number counting up from 0 to `value`.
 * Uses easeOutQuart for natural deceleration.
 * Respects prefers-reduced-motion — shows final value immediately.
 */
export function SlotNumber({
  value,
  duration = 1400,
  prefix = "",
  suffix = "",
  className = "",
}: SlotNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayed(value);
      return;
    }

    const startValue = 0;
    startRef.current = null;

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(t);
      setDisplayed(Math.round(startValue + (value - startValue) * eased));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayed(value);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = displayed.toLocaleString("ja-JP");

  return (
    <span className={className} aria-live="polite" aria-atomic="true">
      {prefix}{formatted}{suffix}
    </span>
  );
}
