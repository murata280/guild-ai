"use client";

import { generateEmblemSpec } from "@/lib/asset-emblem";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AssetEmblemProps {
  assetId: string;
  size?: number;
  className?: string;
}

export function AssetEmblem({ assetId, size = 80, className }: AssetEmblemProps) {
  const spec = generateEmblemSpec(assetId);
  const gid = (djb2(assetId) % 99999).toString(36);
  const pg = `pg_${gid}`;
  const cg = `cg_${gid}`;

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

      {/* Background disc */}
      <circle cx={cx} cy={cy} r={cx} fill={spec.primaryColor} opacity={0.08} />

      {/* Symmetrical petals */}
      {Array.from({ length: spec.axes }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / spec.axes) * i + spec.rotation},${cx},${cy})`}>
          <ellipse cx={cx} cy={petalCy} rx={petalRx} ry={petalRy} fill={`url(#${pg})`} opacity={0.85} />
        </g>
      ))}

      {/* Optional outer ring */}
      {spec.hasOuterRing && (
        <circle
          cx={cx}
          cy={cy}
          r={(spec.petalRadius + 5) * sc}
          fill="none"
          stroke={spec.secondaryColor}
          strokeWidth={1.5 * sc}
          opacity={0.4}
        />
      )}

      {/* Center jewel */}
      <circle cx={cx} cy={cy} r={cr} fill={`url(#${cg})`} />
      <circle cx={cx} cy={cy} r={cr * 0.4} fill="white" opacity={0.5} />
    </svg>
  );
}
