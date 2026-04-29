"use client";
import { useState, useEffect } from "react";

interface PoolPulseProps {
  assetId: string;
  pooledJpy: number;
  className?: string;
}

export function PoolPulse({ assetId: _assetId, pooledJpy, className }: PoolPulseProps) {
  const [displayed, setDisplayed] = useState(pooledJpy);

  useEffect(() => {
    // Slowly increment displayed value to create "accumulating" feeling
    const interval = setInterval(() => {
      setDisplayed((v) => v + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`} aria-live="polite">
      {/* Subtle pulse SVG */}
      <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
        <path
          d="M0 6 L4 6 L6 2 L8 10 L10 4 L12 8 L14 6 L20 6"
          fill="none"
          stroke="#FFCC00"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs font-semibold tabular-nums text-[#8B6800]">
        潜在価値 ¥{displayed.toLocaleString("ja-JP")}
      </span>
    </div>
  );
}
