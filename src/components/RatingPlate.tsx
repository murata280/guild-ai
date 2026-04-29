"use client";

import type { Rank } from "@/types";

interface RatingPlateProps {
  rank: Rank;
  size?: "sm" | "md" | "lg";
}

const PLATE_CONFIG: Record<Rank, {
  bg: string;
  border: string;
  textColor: string;
  subColor: string;
}> = {
  S: {
    bg: "linear-gradient(160deg, #2A2200 0%, #1A1500 100%)",
    border: "#D4AF37",
    textColor: "#D4AF37",
    subColor: "#B58E1A",
  },
  A: {
    bg: "linear-gradient(160deg, #1B2027 0%, #11141A 100%)",
    border: "#D4AF37",
    textColor: "#E8EBF0",
    subColor: "#98A1B0",
  },
  B: {
    bg: "linear-gradient(160deg, #1B2027 0%, #11141A 100%)",
    border: "#2E3540",
    textColor: "#98A1B0",
    subColor: "#5A6270",
  },
};

const SIZES = {
  sm: { w: 32, h: 44, rank: 18, sub: 5, pad: 3 },
  md: { w: 44, h: 64, rank: 28, sub: 6, pad: 4 },
  lg: { w: 56, h: 80, rank: 36, sub: 7, pad: 5 },
};

export function RatingPlate({ rank, size = "md" }: RatingPlateProps) {
  const cfg = PLATE_CONFIG[rank];
  const s = SIZES[size];
  const id = `rp-grad-${rank}-${size}`;

  return (
    <svg
      width={s.w}
      height={s.h}
      viewBox={`0 0 ${s.w} ${s.h}`}
      role="img"
      aria-label={`${rank}ランク — Verified by GUILD AI`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {rank === "S" ? (
            <>
              <stop offset="0%" stopColor="#2A2200" />
              <stop offset="100%" stopColor="#1A1500" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#1B2027" />
              <stop offset="100%" stopColor="#11141A" />
            </>
          )}
        </linearGradient>
      </defs>

      {/* Plate background */}
      <rect
        x="1" y="1"
        width={s.w - 2} height={s.h - 2}
        rx="3" ry="3"
        fill={`url(#${id})`}
        stroke={cfg.border}
        strokeWidth="1.5"
      />

      {/* Inner border line for S rank double-edge */}
      {rank === "S" && (
        <rect
          x="3.5" y="3.5"
          width={s.w - 7} height={s.h - 7}
          rx="1.5" ry="1.5"
          fill="none"
          stroke="#B58E1A"
          strokeWidth="0.5"
          opacity="0.6"
        />
      )}

      {/* Rank letter */}
      <text
        x={s.w / 2}
        y={s.h * 0.55}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={s.rank}
        fontWeight="900"
        fontFamily="'JetBrains Mono', 'Menlo', monospace"
        fill={cfg.textColor}
        letterSpacing="-1"
      >
        {rank}
      </text>

      {/* "Verified by GUILD AI" footer */}
      <text
        x={s.w / 2}
        y={s.h - s.pad - 2}
        textAnchor="middle"
        fontSize={s.sub}
        fontFamily="'JetBrains Mono', 'Menlo', monospace"
        fill={cfg.subColor}
        opacity="0.85"
      >
        GUILD AI
      </text>

      {/* Top rule line */}
      <line
        x1={s.pad + 4}
        y1={s.h * 0.28}
        x2={s.w - s.pad - 4}
        y2={s.h * 0.28}
        stroke={cfg.border}
        strokeWidth="0.5"
        opacity="0.5"
      />
      {/* Bottom rule line */}
      <line
        x1={s.pad + 4}
        y1={s.h * 0.82}
        x2={s.w - s.pad - 4}
        y2={s.h * 0.82}
        stroke={cfg.border}
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  );
}
