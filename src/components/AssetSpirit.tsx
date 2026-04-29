"use client";

import { generateEmblemSpec } from "@/lib/asset-emblem";
import type { Rank } from "@/types";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AssetSpiritProps {
  assetId: string;
  rank: Rank;
  size?: number;
  className?: string;
}

// Face overlay layer rendered inside the SVG — rank-expressive kawaii face
function FaceOverlay({ rank, cx, cy, sc }: { rank: Rank; cx: number; cy: number; sc: number }) {
  return (
    <>
      {/* Ghost face oval */}
      <ellipse cx={cx} cy={cy + 2 * sc} rx={24 * sc} ry={26 * sc} fill="white" opacity={0.82} />

      {rank === "S" && (
        <>
          {/* きらきら — star eyes */}
          <ellipse cx={cx - 14 * sc} cy={cy - 4 * sc} rx={4 * sc} ry={2 * sc} fill="#1A1628" />
          <ellipse cx={cx - 14 * sc} cy={cy - 4 * sc} rx={2 * sc} ry={4 * sc} fill="#1A1628" />
          <ellipse cx={cx + 14 * sc} cy={cy - 4 * sc} rx={4 * sc} ry={2 * sc} fill="#1A1628" />
          <ellipse cx={cx + 14 * sc} cy={cy - 4 * sc} rx={2 * sc} ry={4 * sc} fill="#1A1628" />
          {/* Wide smile */}
          <path
            d={`M ${cx - 16 * sc} ${cy + 12 * sc} Q ${cx} ${cy + 20 * sc} ${cx + 16 * sc} ${cy + 12 * sc}`}
            stroke="#1A1628" strokeWidth={2.5 * sc} fill="none" strokeLinecap="round"
          />
          {/* Blush */}
          <ellipse cx={cx - 22 * sc} cy={cy + 6 * sc} rx={9 * sc} ry={5 * sc} fill="#FFB6C1" opacity={0.6} />
          <ellipse cx={cx + 22 * sc} cy={cy + 6 * sc} rx={9 * sc} ry={5 * sc} fill="#FFB6C1" opacity={0.6} />
          {/* Sparkle dots */}
          <circle cx={cx + 38 * sc} cy={cy - 32 * sc} r={2 * sc} fill="#F5A623" />
          <circle cx={cx - 36 * sc} cy={cy - 28 * sc} r={1.5 * sc} fill="#E84C88" />
        </>
      )}

      {rank === "A" && (
        <>
          {/* やさしい — gentle round eyes */}
          <circle cx={cx - 14 * sc} cy={cy - 4 * sc} r={4 * sc} fill="#1A1628" />
          <circle cx={cx + 14 * sc} cy={cy - 4 * sc} r={4 * sc} fill="#1A1628" />
          <circle cx={cx - 12 * sc} cy={cy - 6 * sc} r={1.5 * sc} fill="white" />
          <circle cx={cx + 16 * sc} cy={cy - 6 * sc} r={1.5 * sc} fill="white" />
          {/* Gentle arc smile */}
          <path
            d={`M ${cx - 12 * sc} ${cy + 12 * sc} Q ${cx} ${cy + 18 * sc} ${cx + 12 * sc} ${cy + 12 * sc}`}
            stroke="#1A1628" strokeWidth={2 * sc} fill="none" strokeLinecap="round"
          />
          {/* Soft blush */}
          <ellipse cx={cx - 20 * sc} cy={cy + 6 * sc} rx={8 * sc} ry={4 * sc} fill="#FFB6C1" opacity={0.4} />
          <ellipse cx={cx + 20 * sc} cy={cy + 6 * sc} rx={8 * sc} ry={4 * sc} fill="#FFB6C1" opacity={0.4} />
        </>
      )}

      {rank === "B" && (
        <>
          {/* もぐもぐ — oval sleepy eyes */}
          <ellipse cx={cx - 14 * sc} cy={cy - 2 * sc} rx={4 * sc} ry={3 * sc} fill="#1A1628" />
          <ellipse cx={cx + 14 * sc} cy={cy - 2 * sc} rx={4 * sc} ry={3 * sc} fill="#1A1628" />
          {/* O-shaped mouth */}
          <ellipse cx={cx} cy={cy + 14 * sc} rx={5 * sc} ry={4 * sc} fill="#1A1628" opacity={0.8} />
        </>
      )}
    </>
  );
}

// AssetSpirit = AssetEmblem + kawaii face overlay in one JSX SVG.
export function AssetSpirit({ assetId, rank, size = 80, className }: AssetSpiritProps) {
  const spec = generateEmblemSpec(assetId);
  const gid = (djb2(assetId) % 99999).toString(36);
  const pg = `ps_${gid}`;
  const cg = `cs_${gid}`;

  const cx = size / 2;
  const cy = size / 2;
  const sc = size / 100;
  const petalRy = (spec.petalRadius * sc) / 2;
  const petalRx = spec.petalRadius * sc * 0.3;
  const petalCy = cy - petalRy;
  const cr = spec.centerRadius * sc;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={pg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.primaryColor} stopOpacity={0.9} />
          <stop offset="100%" stopColor={spec.secondaryColor} stopOpacity={0.6} />
        </linearGradient>
        <radialGradient id={cg} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={spec.accentColor} />
          <stop offset="100%" stopColor={spec.primaryColor} stopOpacity={0.7} />
        </radialGradient>
      </defs>

      {/* Emblem layer */}
      <circle cx={cx} cy={cy} r={cx} fill={spec.primaryColor} opacity={0.08} />
      {Array.from({ length: spec.axes }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / spec.axes) * i + spec.rotation},${cx},${cy})`}>
          <ellipse cx={cx} cy={petalCy} rx={petalRx} ry={petalRy} fill={`url(#${pg})`} opacity={0.85} />
        </g>
      ))}
      {spec.hasOuterRing && (
        <circle cx={cx} cy={cy} r={(spec.petalRadius + 5) * sc} fill="none" stroke={spec.secondaryColor} strokeWidth={1.5 * sc} opacity={0.4} />
      )}
      <circle cx={cx} cy={cy} r={cr} fill={`url(#${cg})`} />
      <circle cx={cx} cy={cy} r={cr * 0.4} fill="white" opacity={0.5} />

      {/* Kawaii face overlay */}
      <FaceOverlay rank={rank} cx={cx} cy={cy} sc={sc} />
    </svg>
  );
}
