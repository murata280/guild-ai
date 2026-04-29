"use client";

import { generateBeforeAfterSpec } from "@/lib/before-after";
import type { Rank } from "@/types";

interface BeforeAfterHeroProps {
  assetId: string;
  rank: Rank;
  size?: number;
  className?: string;
}

export function BeforeAfterHero({ assetId, rank, size = 80, className }: BeforeAfterHeroProps) {
  const spec = generateBeforeAfterSpec(assetId, rank);

  const width = size * 1.5;
  const height = size;
  const mid = width / 2;

  const gradBeforeId = `ba-bg-${assetId}`;
  const gradAfterId = `ba-after-${assetId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${spec.beforeLabel}から${spec.afterLabel}へ`}
      className={className}
    >
      <defs>
        <linearGradient id={gradBeforeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#F0EEF8" />
        </linearGradient>
        <linearGradient id={gradAfterId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={spec.primaryColor} stopOpacity={0.15} />
          <stop offset="100%" stopColor={spec.secondaryColor} stopOpacity={0.25} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill={`url(#${gradBeforeId})`} rx={10} />

      {/* Before panel */}
      <rect
        x={4}
        y={4}
        width={mid - 8}
        height={height - 8}
        fill="#1A162808"
        rx={6}
        stroke="#1A162820"
        strokeWidth={1}
      />
      <text
        x={mid / 2}
        y={height / 2 - 8}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={Math.max(8, size * 0.1)}
        fill="#9890A8"
      >
        Before
      </text>
      <text
        x={mid / 2}
        y={height / 2 + 8}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={Math.max(8, size * 0.11)}
        fontWeight="600"
        fill="#4A4464"
      >
        {spec.beforeLabel}
      </text>

      {/* Arrow */}
      <text
        x={mid}
        y={height / 2 + 6}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={Math.max(12, size * 0.18)}
        fill={spec.primaryColor}
      >
        →
      </text>

      {/* After panel */}
      <rect
        x={mid + 4}
        y={4}
        width={mid - 8}
        height={height - 8}
        fill={`url(#${gradAfterId})`}
        rx={6}
        stroke={`${spec.primaryColor}40`}
        strokeWidth={1.5}
      />
      <text
        x={mid + mid / 2}
        y={height / 2 - 8}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={Math.max(8, size * 0.1)}
        fill={spec.secondaryColor}
      >
        After
      </text>
      <text
        x={mid + mid / 2}
        y={height / 2 + 8}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={Math.max(8, size * 0.11)}
        fontWeight="700"
        fill={spec.primaryColor}
      >
        {spec.afterLabel}
      </text>
    </svg>
  );
}
