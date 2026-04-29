"use client";

import { useCallback } from "react";

interface ProToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export function ProToggle({ isOn, onToggle }: ProToggleProps) {
  const handleClick = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-out ${isOn ? "bg-kaki" : "bg-kuroko/20"}`}
      aria-label="プロモードを切り替え"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-out ${isOn ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ─── Radial reveal overlay (placed in page root, triggered on Pro toggle) ─────

interface ProRadialOverlayProps {
  active: boolean;
}

export function ProRadialOverlay({ active }: ProRadialOverlayProps) {
  if (!active) return null;
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none bg-kuroko pro-radial-reveal"
      aria-hidden
    />
  );
}
